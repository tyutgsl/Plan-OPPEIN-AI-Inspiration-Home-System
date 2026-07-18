import type { CustomerRequest, CustomerStore, CustomerWorkspace } from "../types/customer";

export const CUSTOMER_STORAGE_KEY = "oppein-ai-inspiration-customers-v1";

export const LIN_DEMO_ID = "demo-lin-2026";

export const linDemoRequest: CustomerRequest = {
  displayName: "林女士",
  city: "广州",
  layout: "三房两厅",
  areaM2: 98,
  budgetMin: 200_000,
  budgetMax: 250_000,
  household: { adults: 2, children: 1, elders: 0, pets: 0 },
  moveInMonth: "2026-12",
  freeText: "喜欢温馨明亮、简洁耐看的家，希望收纳充足，兼顾儿童安全、易清洁和视觉整洁。",
  specialNeeds: ["儿童安全", "强收纳", "易清洁", "视觉整洁"],
  demoMode: true,
};

export function createCustomerWorkspace(request: CustomerRequest, id = crypto.randomUUID()): CustomerWorkspace {
  const now = Date.now();
  return {
    id,
    request,
    events: [],
    currentRound: 0,
    showRecommendations: false,
    recommendationBudgetMax: request.budgetMax,
    selectedCaseId: null,
    resolvedRiskIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createLinDemoWorkspace(): CustomerWorkspace {
  return createCustomerWorkspace(structuredClone(linDemoRequest), LIN_DEMO_ID);
}

export function defaultCustomerStore(): CustomerStore {
  return { version: 1, activeCustomerId: null, customers: [createLinDemoWorkspace()] };
}

function isWorkspace(value: unknown): value is CustomerWorkspace {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CustomerWorkspace>;
  const request = item.request as Partial<CustomerRequest> | undefined;
  return Boolean(
    typeof item.id === "string" &&
    request &&
    typeof request.displayName === "string" &&
    typeof request.city === "string" &&
    typeof request.layout === "string" &&
    typeof request.areaM2 === "number" &&
    typeof request.budgetMin === "number" &&
    typeof request.budgetMax === "number" &&
    Array.isArray(item.events),
  );
}

export function loadCustomerStore(raw: string | null): CustomerStore {
  if (!raw) return defaultCustomerStore();
  try {
    const parsed = JSON.parse(raw) as Partial<CustomerStore>;
    const customers = Array.isArray(parsed.customers) ? parsed.customers.filter(isWorkspace) : [];
    if (!customers.some((item) => item.id === LIN_DEMO_ID)) customers.unshift(createLinDemoWorkspace());
    return {
      version: 1,
      activeCustomerId: customers.some((item) => item.id === parsed.activeCustomerId) ? parsed.activeCustomerId! : null,
      customers,
    };
  } catch {
    return defaultCustomerStore();
  }
}
