import type { EvaluatePreferencesInput } from "./preferences.validation";

export const preferencesService = {
  evaluate(input: EvaluatePreferencesInput) {
    const hasOpenStorage = input.events.some((event) => event.optionId === "storage-open" && event.action === "like");
    const openStorageConflict = hasOpenStorage && input.context.childSafety && input.context.easyCleaning && input.context.visualNeatness;
    return {
      eventCount: input.events.length,
      conflicts: openStorageConflict ? [{
        code: "OPEN_STORAGE_FAMILY_NEEDS",
        cause: "大量开放格与易清洁、儿童安全、视觉整洁同时存在",
        recommendation: "20%开放＋80%封闭，并避开低位玻璃与可攀爬结构",
      }] : [],
    };
  },
};
