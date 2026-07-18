"use client";

import { useEffect, useState } from "react";
import { createCustomerWorkspace, createLinDemoWorkspace, CUSTOMER_STORAGE_KEY, defaultCustomerStore, LIN_DEMO_ID, loadCustomerStore } from "../lib/customer-storage";
import type { CustomerRequest, CustomerStore, CustomerWorkspace } from "../types/customer";
import { CustomerManager } from "./CustomerManager";
import { VisualPreferenceSelector } from "./VisualPreferenceSelector";

export function CustomerExperienceApp() {
  const [store, setStore] = useState<CustomerStore>(defaultCustomerStore);
  const [view, setView] = useState<"customers" | "experience">("customers");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setStore(loadCustomerStore(window.localStorage.getItem(CUSTOMER_STORAGE_KEY)));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(store));
  }, [store, hydrated]);

  const activeCustomer = store.customers.find((item) => item.id === store.activeCustomerId) ?? null;
  const start = (customerId: string) => {
    setStore((current) => ({ ...current, activeCustomerId: customerId }));
    setView("experience");
    window.scrollTo({ top: 0 });
  };

  const save = (request: CustomerRequest, editingId?: string) => {
    setStore((current) => {
      if (editingId) {
        return { ...current, activeCustomerId: editingId, customers: current.customers.map((item) => item.id === editingId ? { ...item, request, recommendationBudgetMax: request.budgetMax, selectedCaseId: null, resolvedRiskIds: [], updatedAt: Date.now() } : item) };
      }
      const created = createCustomerWorkspace(request);
      return { ...current, activeCustomerId: created.id, customers: [...current.customers, created] };
    });
    setView("experience");
    window.scrollTo({ top: 0 });
  };

  const useDemo = () => {
    setStore((current) => ({ ...current, activeCustomerId: LIN_DEMO_ID, customers: current.customers.map((item) => item.id === LIN_DEMO_ID ? createLinDemoWorkspace() : item) }));
    setView("experience");
    window.scrollTo({ top: 0 });
  };

  const updateActive = (updater: (current: CustomerWorkspace) => CustomerWorkspace) => setStore((current) => ({
    ...current,
    customers: current.customers.map((item) => item.id === current.activeCustomerId ? { ...updater(item), updatedAt: Date.now() } : item),
  }));

  const remove = (customerId: string) => setStore((current) => ({ ...current, activeCustomerId: current.activeCustomerId === customerId ? null : current.activeCustomerId, customers: current.customers.filter((item) => item.id !== customerId) }));

  if (view === "experience" && activeCustomer) return <VisualPreferenceSelector workspace={activeCustomer} onUpdate={updateActive} onBack={() => { setView("customers"); window.scrollTo({ top: 0 }); }} />;
  return <CustomerManager customers={store.customers} onSave={save} onStart={start} onUseDemo={useDemo} onDelete={remove} />;
}
