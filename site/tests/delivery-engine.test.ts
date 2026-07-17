import assert from "node:assert/strict";
import test from "node:test";
import { createDeliveryProject } from "../app/lib/delivery-engine";

const project = createDeliveryProject("OP-PUB-005");

test("交付看板严格生成量尺至验收八阶段", () => {
  assert.deepEqual(project.stages.map((stage) => stage.label), ["量尺", "设计", "报价", "下单", "生产", "物流", "安装", "验收"]);
  assert.equal(project.stages.length, 8);
  assert.equal(project.currentStage, "quote");
  assert.equal(project.stages[2].status, "risk");
});

test("固定场景触发报价漏项并给出可执行处置建议", () => {
  const risk = project.risks.find((item) => item.type === "QUOTE_OMISSION");
  assert.ok(risk);
  assert.match(risk.evidence, /仅覆盖3个.*遗漏/);
  assert.equal(risk.suggestion.length, 3);
  assert.equal(project.quotedSkuCodes.length, project.skus.length - 1);
});

test("模拟SKU交期触发跨品类不一致风险", () => {
  const risk = project.risks.find((item) => item.type === "CROSS_CATEGORY_DELIVERY");
  assert.ok(risk);
  assert.match(risk.evidence, /相差35天/);
  assert.match(risk.suggestion.join(" "), /两批齐套/);
});

test("全部SKU均明确标记为AI模拟且不可映射真实产品", () => {
  assert.ok(project.skus.every((sku) => sku.simulated));
  assert.ok(project.skus.every((sku) => sku.simulationNote.includes("AI虚构SKU")));
});

test("处理两项风险后推进至模拟下单并保留处置日志", () => {
  const resolved = createDeliveryProject("OP-PUB-005", ["RISK-QUOTE-001", "RISK-DELIVERY-001"]);
  assert.ok(resolved.risks.every((risk) => risk.status === "resolved"));
  assert.equal(resolved.currentStage, "order");
  assert.equal(resolved.progress, 38);
  assert.equal(resolved.activities.filter((item) => item.kind === "resolved").length, 2);
});
