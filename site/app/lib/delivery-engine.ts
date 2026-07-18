import rawSkus from "../data/case-skus.json";
import rawCases from "../data/recommendation-cases.json";
import type { DeliveryProject, DeliverySku, ProjectActivity, ProjectStage, RiskEvent } from "../types/delivery";
import type { DesignCase } from "../types/recommendation";

export const DELIVERY_VERSION = "oppein-delivery-v1.0.0";
const skus = rawSkus as DeliverySku[];
const cases = rawCases as DesignCase[];
const stageLabels = ["量尺", "设计", "报价", "下单", "生产", "物流", "安装", "验收"] as const;
const stageKeys = ["measure", "design", "quote", "order", "production", "logistics", "installation", "acceptance"] as const;

const money = (value: number) => `¥${value.toLocaleString("zh-CN")}`;
const dateLabel = (dayOffset: number) => {
  const date = new Date(Date.UTC(2026, 6, 17 + dayOffset));
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
};

function buildRisks(caseSkus: DeliverySku[], resolved: Set<string>): RiskEvent[] {
  const omitted = caseSkus.at(-1)!;
  const fastest = [...caseSkus].sort((a, b) => a.deliveryDays - b.deliveryDays)[0];
  const slowest = [...caseSkus].sort((a, b) => b.deliveryDays - a.deliveryDays)[0];
  const gap = slowest.deliveryDays - fastest.deliveryDays;
  return [
    {
      id: "RISK-QUOTE-001",
      type: "QUOTE_OMISSION",
      title: "报价清单存在漏项",
      severity: "high",
      status: resolved.has("RISK-QUOTE-001") ? "resolved" : "open",
      evidence: `方案包含${caseSkus.length}个模拟SKU，当前模拟报价仅覆盖${caseSkus.length - 1}个；遗漏“${omitted.productName}”（${omitted.skuCode}，${money(omitted.lineTotal)}）。`,
      impact: "若未复核就确认报价，方案总价与客户所见内容可能不一致。",
      suggestion: ["暂停模拟报价确认", `补入${omitted.category}明细与${money(omitted.lineTotal)}模拟金额`, "复核总价、优惠与效果图项目后再次确认"],
      actionLabel: "模拟补齐报价并复核",
    },
    {
      id: "RISK-DELIVERY-001",
      type: "CROSS_CATEGORY_DELIVERY",
      title: "跨品类交期不一致",
      severity: gap >= 28 ? "high" : "medium",
      status: resolved.has("RISK-DELIVERY-001") ? "resolved" : "open",
      evidence: `${fastest.category}模拟交期${fastest.deliveryDays}天，${slowest.category}模拟交期${slowest.deliveryDays}天，相差${gap}天。`,
      impact: "若按单一日期安排安装，可能出现等待、二次上门或无法齐套验收。",
      suggestion: ["按公共区与卧室拆分两批齐套", `先安排${fastest.category}等短交期品类，长交期品类到齐后集中二次安装`, "最终验收日期以全部品类完成为准"],
      actionLabel: "采用两批齐套方案",
    },
  ];
}

export function createDeliveryProject(caseId: string, resolvedRiskIds: string[] = [], workspaceId = "demo"): DeliveryProject {
  const selectedCase = cases.find((item) => item.id === caseId);
  if (!selectedCase) throw new Error(`未找到案例：${caseId}`);
  const caseSkus = skus.filter((item) => item.caseId === caseId);
  if (caseSkus.length < 2) throw new Error(`案例${caseId}缺少可比较的模拟SKU`);
  const resolved = new Set(resolvedRiskIds);
  const risks = buildRisks(caseSkus, resolved);
  const allResolved = risks.every((risk) => risk.status === "resolved");
  const currentIndex = allResolved ? 3 : 2;
  const maxDelivery = Math.max(...caseSkus.map((item) => item.deliveryDays));
  const offsets = [0, 7, 12, 15, 18, maxDelivery, maxDelivery + 4, maxDelivery + 7];
  const summaries = ["现场尺寸模拟确认", "全案设计模拟定稿", "报价一致性复核中", "待风险处理后模拟下单", "待模拟排产", "待模拟发运", "待模拟安装", "待模拟验收"];
  const stages: ProjectStage[] = stageKeys.map((key, index) => ({
    key,
    label: stageLabels[index],
    status: index < currentIndex ? "completed" : index === currentIndex ? (allResolved ? "current" : "risk") : "pending",
    plannedDate: dateLabel(offsets[index]),
    summary: allResolved && index === 2 ? "报价风险已模拟复核" : summaries[index],
  }));

  const activities: ProjectActivity[] = [
    { time: "10:18", title: "方案已选择", detail: `选择${selectedCase.title}，建立模拟项目单。`, kind: "normal" },
    { time: "10:19", title: "报价一致性检查", detail: "发现方案SKU与模拟报价行数量不一致。", kind: "risk" },
    { time: "10:20", title: "交期协同检查", detail: "发现不同品类模拟交期差超过14天。", kind: "risk" },
  ];
  if (resolved.has("RISK-QUOTE-001")) activities.push({ time: "10:22", title: "报价漏项已模拟处理", detail: "已补齐缺失明细并完成总价复核。", kind: "resolved" });
  if (resolved.has("RISK-DELIVERY-001")) activities.push({ time: "10:23", title: "交期风险已模拟处理", detail: "已采用两批齐套方案并重排模拟安装窗口。", kind: "resolved" });

  return {
    id: `SIM-${workspaceId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "LOCAL"}-${caseId}`,
    version: DELIVERY_VERSION,
    selectedCaseId: caseId,
    selectedCaseTitle: selectedCase.title,
    demoStatus: allResolved ? "模拟风险已处理" : "模拟进行中",
    currentStage: stageKeys[currentIndex],
    currentStageLabel: stageLabels[currentIndex],
    progress: allResolved ? 38 : 25,
    promisedDate: dateLabel(maxDelivery + 7),
    skus: caseSkus,
    quotedSkuCodes: caseSkus.slice(0, -1).map((item) => item.skuCode),
    stages,
    risks,
    activities,
  };
}
