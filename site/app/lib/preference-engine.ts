import { preferenceRounds, roundLabels } from "../data/preference-rounds";
import type { CustomerRequest } from "../types/customer";
import type { ConflictAdvice, PreferenceEvent, ProfileDimension, RoundKey } from "../types/preferences";

const weight = { like: 2, dislike: -2, neutral: 0.5, skip: 0 } as const;

export function buildProfile(events: PreferenceEvent[]): ProfileDimension[] {
  return preferenceRounds.flatMap((round) => {
    const scoped = events.filter((event) => event.round === round.key && event.optionId);
    if (!scoped.length) return [];
    const scores = new Map<string, number>();
    scoped.forEach((event) => scores.set(event.value!, (scores.get(event.value!) ?? 0) + weight[event.action]));
    const [value, score] = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
    if (score < 0) return [];
    const explicit = scoped.some((event) => event.value === value && event.action === "like");
    return [{
      label: roundLabels[round.key],
      value,
      confidence: Math.min(95, Math.round(42 + Math.max(0, score) * 18)),
      source: explicit ? "客户明确选择" : "系统推断",
    }];
  });
}

const liked = (events: PreferenceEvent[], id: string) =>
  events.some((event) => event.optionId === id && event.action === "like");

export function detectConflicts(events: PreferenceEvent[], request?: CustomerRequest): ConflictAdvice[] {
  const conflicts: ConflictAdvice[] = [];
  const needs = request?.specialNeeds ?? ["儿童安全", "易清洁", "视觉整洁"];
  const openConflictNeeds = needs.filter((need) => ["儿童安全", "易清洁", "视觉整洁"].includes(need));
  if (liked(events, "storage-open") && openConflictNeeds.length) conflicts.push({
    id: "open-clean-child",
    title: "开放展示与家庭需求存在冲突",
    cause: `你喜欢大量开放格，同时前置需求强调${openConflictNeeds.join("、")}。`,
    impact: `开放格更易积灰和暴露物品${request?.household.children ? "，低位结构还可能诱发儿童攀爬" : ""}。`,
    recommendation: "建议采用 20% 开放展示＋80% 封闭收纳；开放格上移，并避开低位玻璃与可攀爬结构。",
  });
  if (liked(events, "mood-premium") && (request?.areaM2 ?? 98) <= 110) conflicts.push({ id: "dark-space", title: "深色氛围可能压缩空间感", cause: `沉稳深色与${request?.areaM2 ?? 98}㎡住宅的明亮诉求存在张力。`, impact: "大面积深色会降低采光感受。", recommendation: "以浅色为基底，仅在电视墙或单柜局部使用深色。" });
  if (liked(events, "light-none")) conflicts.push({ id: "light-budget", title: "复杂无主灯方案需校验预算", cause: "多回路灯光会增加施工与设备成本。", impact: `可能挤占${(request?.budgetMax ?? 250_000) / 10_000}万元总预算。`, recommendation: "采用混合照明，减少灯具数量并保留重点氛围层次。" });
  if (liked(events, "material-glass") && ((request?.household.children ?? 1) > 0 || needs.includes("儿童安全"))) conflicts.push({ id: "glass-child", title: "低位玻璃需关注儿童安全", cause: `家庭中有${request?.household.children ?? 1}名儿童。`, impact: "低位玻璃门与锐角五金可能带来磕碰风险。", recommendation: "玻璃仅用于高位展示，并使用圆角与安全玻璃。" });
  if (liked(events, "material-stone") && needs.includes("易清洁")) conflicts.push({ id: "luxury-maintenance", title: "质感材料与低维护诉求需平衡", cause: "高光石材肌理与易清洁诉求并不总是一致。", impact: "指纹、水渍和接缝会增加维护成本。", recommendation: "大面使用哑光耐污材料，石材只用于耐磨重点区域。" });
  return conflicts;
}

export function selectedAction(events: PreferenceEvent[], round: RoundKey, optionId: string) {
  return [...events].reverse().find((event) => event.round === round && event.optionId === optionId)?.action;
}
