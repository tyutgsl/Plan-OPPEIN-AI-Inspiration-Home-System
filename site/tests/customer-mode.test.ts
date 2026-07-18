import assert from "node:assert/strict";
import test from "node:test";
import { createCustomerWorkspace, createLinDemoWorkspace, defaultCustomerStore, LIN_DEMO_ID, loadCustomerStore } from "../app/lib/customer-storage";
import { buildRecommendationInput } from "../app/lib/recommendation-engine";
import type { CustomerRequest } from "../app/types/customer";

const customRequest: CustomerRequest = {
  displayName: "客户002",
  city: "深圳",
  layout: "两房两厅",
  areaM2: 72,
  budgetMin: 120_000,
  budgetMax: 180_000,
  household: { adults: 1, children: 0, elders: 0, pets: 1 },
  freeText: "希望空间自然轻松，适合一人一猫居住并且方便清洁。",
  specialNeeds: ["宠物友好", "易清洁"],
  demoMode: false,
};

test("默认本地档案保留林女士一键演示案例", () => {
  const store = defaultCustomerStore();
  assert.equal(store.customers.length, 1);
  assert.equal(store.customers[0].id, LIN_DEMO_ID);
  assert.equal(store.customers[0].request.displayName, "林女士");
});

test("两个客户的需求与视觉事件互不串联", () => {
  const first = createLinDemoWorkspace();
  const second = createCustomerWorkspace(customRequest, "customer-002");
  second.events.push({ id: "event-2", round: "style", optionId: "style-wood", optionTitle: "现代原木", value: "现代原木", action: "like", createdAt: 2 });
  const restored = loadCustomerStore(JSON.stringify({ version: 1, activeCustomerId: second.id, customers: [first, second] }));
  assert.equal(restored.customers.find((item) => item.id === LIN_DEMO_ID)?.events.length, 0);
  assert.equal(restored.customers.find((item) => item.id === second.id)?.events.length, 1);
  assert.equal(restored.activeCustomerId, second.id);
});

test("推荐输入读取当前客户而不是固定林女士参数", () => {
  const input = buildRecommendationInput([], customRequest.budgetMax, customRequest);
  assert.equal(input.city, "深圳");
  assert.equal(input.layout, "两房两厅");
  assert.equal(input.areaM2, 72);
  assert.equal(input.budgetMax, 180_000);
  assert.equal(input.householdType, "单身+宠物");
  assert.ok(input.needs.includes("宠物友好"));
  assert.ok(!input.needs.includes("儿童安全"));
});
