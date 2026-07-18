import rawCases from "../data/recommendation-cases.json";
import { linDemoRequest } from "./customer-storage";
import { recommendationHouseholdLabel, type CustomerRequest } from "../types/customer";
import type { PreferenceEvent } from "../types/preferences";
import type {
  DesignCase,
  RecommendationInput,
  RecommendationResult,
  RecommendationRun,
  RecommendationStrategy,
  ScoreBreakdown,
  ScoreKey,
} from "../types/recommendation";

export const RECOMMENDATION_VERSION = "oppein-rec-v1.0.0";
export const BASE_WEIGHTS: Record<ScoreKey, number> = {
  style: 0.25,
  budget: 0.2,
  layout: 0.15,
  household: 0.15,
  function: 0.1,
  transaction: 0.1,
  satisfaction: 0.05,
};

const cases = rawCases as DesignCase[];
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round1 = (value: number) => Math.round(value * 10) / 10;
const containsAny = (text: string, tokens: string[]) => tokens.some((token) => text.includes(token));

const styleNeighbors: Record<string, string[]> = {
  现代原木: ["现代简约", "奶油风"],
  现代简约: ["现代原木", "现代轻奢"],
  奶油风: ["现代原木", "现代简约"],
  现代轻奢: ["现代简约"],
  新中式: ["现代原木"],
  混合: ["现代简约", "现代原木", "奶油风", "现代轻奢", "新中式"],
};

function eventValues(events: PreferenceEvent[] | undefined, round: PreferenceEvent["round"]) {
  return (events ?? []).filter((event) => event.round === round && event.action === "like" && event.value).map((event) => event.value!);
}

export function buildRecommendationInput(events: PreferenceEvent[], budgetMax = 250_000, customerRequest: CustomerRequest = linDemoRequest): RecommendationInput {
  const styles = eventValues(events, "style");
  const mood = eventValues(events, "mood");
  const temperature = eventValues(events, "temperature").at(-1);
  const materials = eventValues(events, "material");
  const storage = eventValues(events, "storage").at(-1);
  const lighting = eventValues(events, "lighting");
  return {
    city: customerRequest.city,
    layout: customerRequest.layout,
    areaM2: customerRequest.areaM2,
    budgetMin: Math.min(customerRequest.budgetMin, budgetMax),
    budgetMax,
    householdType: recommendationHouseholdLabel(customerRequest.household),
    preferredStyles: styles.length ? styles : ["现代原木", "现代简约"],
    ambience: mood.length ? mood : ["明亮温馨", "自然松弛"],
    temperature: temperature === "冷" || temperature === "中性" || temperature === "暖" ? temperature : "暖",
    materials: materials.length ? materials : ["木纹", "哑光"],
    storageClosedRatio: storage === "高开放" ? 0.35 : storage === "均衡" ? 0.6 : 0.8,
    lighting: lighting.length ? lighting : ["混合"],
    needs: [...new Set([
      ...customerRequest.specialNeeds,
      ...(customerRequest.household.children > 0 ? ["儿童安全"] : []),
      ...(customerRequest.household.elders > 0 ? ["适老无障碍"] : []),
      ...(customerRequest.household.pets > 0 ? ["宠物友好"] : []),
    ])],
    events,
  };
}

function styleScore(designCase: DesignCase, input: RecommendationInput) {
  const exact = input.preferredStyles.includes(designCase.mainStyle);
  const neighboring = input.preferredStyles.some((style) => styleNeighbors[style]?.includes(designCase.mainStyle));
  const secondary = input.preferredStyles.some((style) => designCase.secondaryStyle.includes(style.replace("风", "")));
  const core = exact ? 100 : secondary ? 85 : neighboring ? 76 : designCase.mainStyle === "混合" ? 68 : 42;
  const visualText = `${designCase.ambience};${designCase.primaryColors.join(";")}`;
  const warmth = input.temperature === "暖"
    ? (containsAny(visualText, ["暖", "木", "米白", "奶", "焦糖"]) ? 100 : 52)
    : input.temperature === "冷"
      ? (containsAny(visualText, ["冷", "灰", "金属"]) ? 100 : 55)
      : 80;
  const normalizedMaterials = designCase.materials.join(";");
  const materialHits = input.materials.filter((material) => normalizedMaterials.includes(material.replace("肤感", ""))).length;
  const material = input.materials.length ? clamp((materialHits / input.materials.length) * 100, 35) : 70;
  return {
    score: round1(core * 0.6 + warmth * 0.2 + material * 0.2),
    evidence: exact
      ? `${designCase.mainStyle}与明确风格偏好一致；${designCase.ambience}提供氛围证据`
      : `${designCase.mainStyle}与偏好存在邻近关系；材料为${designCase.materials.join("、")}`,
  };
}

function budgetScore(designCase: DesignCase, input: RecommendationInput) {
  if (designCase.budgetTotal > input.budgetMax) return { score: 0, evidence: "超过预算硬上限" };
  if (designCase.budgetTotal >= input.budgetMin) return { score: 100, evidence: `模拟总预算${formatWan(designCase.budgetTotal)}，落入${formatWan(input.budgetMin)}—${formatWan(input.budgetMax)}` };
  const gapRatio = (input.budgetMin - designCase.budgetTotal) / input.budgetMin;
  return { score: round1(clamp(100 - gapRatio * 80, 55)), evidence: `模拟总预算${formatWan(designCase.budgetTotal)}，低于目标区间但未超过上限` };
}

function layoutScore(designCase: DesignCase, input: RecommendationInput) {
  const layoutPart = designCase.layout === input.layout ? 100 : designCase.layout.includes("三房") === input.layout.includes("三房") ? 80 : 45;
  const delta = Math.abs(designCase.areaM2 - input.areaM2) / input.areaM2;
  const areaPart = delta <= 0.1 ? 100 : delta <= 0.25 ? 85 - ((delta - 0.1) / 0.15) * 25 : clamp(55 - (delta - 0.25) * 90, 20);
  return { score: round1(layoutPart * 0.6 + areaPart * 0.4), evidence: `${designCase.areaM2}㎡${designCase.layout}，与${input.areaM2}㎡${input.layout}对照` };
}

function householdScore(designCase: DesignCase, input: RecommendationInput) {
  const exact = designCase.householdType === input.householdType;
  const bothChild = designCase.householdType.includes("儿童") && input.householdType.includes("儿童");
  const bothFamily = containsAny(designCase.householdType, ["夫妻", "三代"]) && containsAny(input.householdType, ["夫妻", "三代"]);
  const score = exact ? 100 : bothChild ? 88 : bothFamily ? 68 : 42;
  return { score, evidence: `${designCase.householdType}${exact ? "与演示家庭结构一致" : "与演示家庭结构作相似度比较"}` };
}

function functionScore(designCase: DesignCase, input: RecommendationInput) {
  const checks = [
    { label: "儿童安全", met: !input.needs.includes("儿童安全") || designCase.specialNeeds.some((need) => need.includes("儿童安全")) },
    { label: "强收纳", met: !input.needs.includes("强收纳") || designCase.storageClosedRatio >= 0.75 },
    { label: "易清洁", met: !input.needs.includes("易清洁") || designCase.storageClosedRatio >= 0.7 || containsAny(designCase.materials.join(";"), ["哑光", "肤感", "木纹"]) },
    { label: "视觉整洁", met: !input.needs.includes("视觉整洁") || designCase.storageClosedRatio >= 0.75 },
  ];
  const met = checks.filter((item) => item.met).map((item) => item.label);
  return { score: round1((met.length / checks.length) * 100), evidence: `覆盖${met.join("、") || "暂无明确覆盖"}；封闭收纳比例${Math.round(designCase.storageClosedRatio * 100)}%` };
}

function transactionScore(designCase: DesignCase) {
  const status = designCase.simulatedTransactionStatus.includes("已成交") ? 75 : designCase.simulatedTransactionStatus.includes("意向") ? 60 : 50;
  const revision = clamp(100 - Math.max(0, designCase.revisionCount - 1) * 14, 35);
  return { score: round1(status * 0.55 + revision * 0.45), evidence: `${designCase.simulatedTransactionStatus}、模拟修改${designCase.revisionCount}次；无真实成交证明` };
}

function satisfactionScore(designCase: DesignCase) {
  const hasValue = designCase.satisfaction5 > 0;
  return { score: hasValue ? round1(designCase.satisfaction5 * 20) : 50, evidence: hasValue ? `模拟满意度${designCase.satisfaction5.toFixed(1)}/5` : "满意度缺失，按中性50分处理" };
}

function scoreCase(designCase: DesignCase, input: RecommendationInput) {
  const raw = {
    style: styleScore(designCase, input),
    budget: budgetScore(designCase, input),
    layout: layoutScore(designCase, input),
    household: householdScore(designCase, input),
    function: functionScore(designCase, input),
    transaction: transactionScore(designCase),
    satisfaction: satisfactionScore(designCase),
  };
  const labels: Record<ScoreKey, string> = { style: "风格", budget: "预算", layout: "户型面积", household: "家庭结构", function: "功能需求", transaction: "成交表现", satisfaction: "满意度" };
  const breakdown = (Object.keys(BASE_WEIGHTS) as ScoreKey[]).map((key): ScoreBreakdown => ({ key, label: labels[key], score: raw[key].score, weight: BASE_WEIGHTS[key], evidence: raw[key].evidence }));
  const totalScore = round1(breakdown.reduce((sum, item) => sum + item.score * item.weight, 0));
  return { designCase, breakdown, totalScore };
}

function formatWan(value: number) {
  return `${(value / 10_000).toFixed(value % 10_000 === 0 ? 0 : 1)}万元`;
}

function buildReasons(scored: ReturnType<typeof scoreCase>, input: RecommendationInput) {
  const { designCase, breakdown } = scored;
  const reasonCandidates = [...breakdown]
    .filter((item) => ["style", "budget", "layout", "household", "function"].includes(item.key))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.evidence);
  if (designCase.storageClosedRatio >= 0.75) reasonCandidates.push(`${Math.round(designCase.storageClosedRatio * 100)}%封闭收纳，呼应强收纳与视觉整洁需求`);
  if (designCase.budgetTotal <= input.budgetMax) reasonCandidates.push(`模拟总预算${formatWan(designCase.budgetTotal)}，未超过当前${formatWan(input.budgetMax)}硬上限`);
  return [...new Set(reasonCandidates)].slice(0, 3);
}

function buildTradeoff(scored: ReturnType<typeof scoreCase>, input: RecommendationInput) {
  const item = scored.designCase;
  if (item.budgetTotal >= input.budgetMax * 0.92) return `模拟预算${formatWan(item.budgetTotal)}接近当前上限，实际报价仍需线下复核。`;
  if (item.storageClosedRatio < 0.75) return `封闭收纳比例为${Math.round(item.storageClosedRatio * 100)}%，展示感更强，但清洁与视觉维护成本可能更高。`;
  if (item.materials.some((material) => material.includes("玻璃")) && input.needs.includes("儿童安全")) return "方案含玻璃材质，儿童家庭需在深化设计时避开低位玻璃和锐角五金。";
  if (item.deliveryDays >= 50) return `模拟交付周期为${item.deliveryDays}天，跨品类齐套时间需要进一步复核。`;
  return item.riskTags[0] ? `${item.riskTags[0]}；该提示来自模拟案例风险字段。` : "图片与实际可落地材质需要设计师进一步复核。";
}

function strategyScore(strategy: RecommendationStrategy, scored: ReturnType<typeof scoreCase>) {
  const part = Object.fromEntries(scored.breakdown.map((item) => [item.key, item.score])) as Record<ScoreKey, number>;
  const lowRevision = clamp(100 - Math.max(0, scored.designCase.revisionCount - 1) * 15, 25);
  if (strategy === "safe") return round1(scored.totalScore * 0.7 + part.transaction * 0.2 + lowRevision * 0.1);
  if (strategy === "personal") return round1(part.style * 0.45 + part.function * 0.15 + part.household * 0.15 + part.layout * 0.1 + scored.totalScore * 0.15);
  return round1(part.budget * 0.45 + part.function * 0.25 + scored.totalScore * 0.2 + part.layout * 0.1);
}

function isCompliant(item: DesignCase) {
  return Boolean(item.image && item.anonymized && item.title && item.mainStyle && item.budgetTotal > 0 && item.displayRight);
}

function violatesHardConstraints(item: DesignCase, input: RecommendationInput) {
  if (item.budgetTotal > input.budgetMax) return true;
  return input.needs.includes("儿童安全") && item.riskTags.some((risk) => containsAny(risk, ["低位玻璃", "儿童攀爬"]));
}

export function recommend(input: RecommendationInput, catalog: DesignCase[] = cases): RecommendationRun {
  const eligible = catalog.filter(isCompliant).filter((item) => !violatesHardConstraints(item, input));
  const strict = eligible.filter((item) => item.region === "华南" && Math.abs(item.areaM2 - input.areaM2) / input.areaM2 <= 0.25);
  const expanded = strict.length < 10;
  const candidates = (expanded ? eligible : strict).map((item) => scoreCase(item, input));
  const used = new Set<string>();
  const picked: RecommendationResult[] = [];
  const strategies: Array<{ key: RecommendationStrategy; label: string; output: string }> = [
    { key: "safe", label: "稳妥成交型", output: "成熟 · 易沟通 · 风险较低" },
    { key: "personal", label: "个性匹配型", output: "更懂你的审美" },
    { key: "budget", label: "预算优化型", output: "预算友好 · 功能完整" },
  ];

  for (const strategy of strategies) {
    const ranked = candidates
      .filter((item) => !used.has(item.designCase.id))
      .map((item) => ({ item, score: strategyScore(strategy.key, item) }))
      .sort((a, b) => b.score - a.score || b.item.totalScore - a.item.totalScore || a.item.designCase.id.localeCompare(b.item.designCase.id));
    const safeStyle = picked[0]?.case.mainStyle;
    const diverse = strategy.key === "personal" && safeStyle ? ranked.find((entry) => entry.item.designCase.mainStyle !== safeStyle && entry.score >= ranked[0].score - 8) : undefined;
    const selected = diverse ?? ranked[0];
    if (!selected) continue;
    used.add(selected.item.designCase.id);
    picked.push({
      strategy: strategy.key,
      strategyLabel: strategy.label,
      outputLabel: strategy.output,
      case: selected.item.designCase,
      totalScore: selected.item.totalScore,
      strategyScore: selected.score,
      breakdown: selected.item.breakdown,
      reasons: buildReasons(selected.item, input),
      tradeoff: buildTradeoff(selected.item, input),
      exploration: expanded,
    });
  }

  return {
    version: RECOMMENDATION_VERSION,
    profileVersion: "visual-profile-v1",
    weights: BASE_WEIGHTS,
    sourceCaseCount: catalog.length,
    eligibleCaseCount: eligible.length,
    candidateCount: candidates.length,
    expanded,
    results: picked,
  };
}
