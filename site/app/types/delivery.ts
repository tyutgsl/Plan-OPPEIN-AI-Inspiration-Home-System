export type DeliverySku = {
  id: string;
  caseId: string;
  category: string;
  skuCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  deliveryDays: number;
  simulated: boolean;
  simulationNote: string;
};

export type ProjectStageKey = "measure" | "design" | "quote" | "order" | "production" | "logistics" | "installation" | "acceptance";
export type ProjectStageStatus = "completed" | "current" | "risk" | "pending";

export type ProjectStage = {
  key: ProjectStageKey;
  label: string;
  status: ProjectStageStatus;
  plannedDate: string;
  summary: string;
};

export type RiskType = "QUOTE_OMISSION" | "CROSS_CATEGORY_DELIVERY";
export type RiskStatus = "open" | "resolved";

export type RiskEvent = {
  id: string;
  type: RiskType;
  title: string;
  severity: "high" | "medium";
  status: RiskStatus;
  evidence: string;
  impact: string;
  suggestion: string[];
  actionLabel: string;
};

export type ProjectActivity = {
  time: string;
  title: string;
  detail: string;
  kind: "normal" | "risk" | "resolved";
};

export type DeliveryProject = {
  id: string;
  version: string;
  selectedCaseId: string;
  selectedCaseTitle: string;
  demoStatus: "模拟进行中" | "模拟风险已处理";
  currentStage: ProjectStageKey;
  currentStageLabel: string;
  progress: number;
  promisedDate: string;
  skus: DeliverySku[];
  quotedSkuCodes: string[];
  stages: ProjectStage[];
  risks: RiskEvent[];
  activities: ProjectActivity[];
};
