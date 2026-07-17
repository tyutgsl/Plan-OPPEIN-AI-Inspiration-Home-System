import assert from "node:assert/strict";
import test from "node:test";
import { buildProfile, detectConflicts } from "../app/lib/preference-engine";
import type { PreferenceEvent } from "../app/types/preferences";

const event: PreferenceEvent = {
  id: "fixed-demo-event",
  round: "storage",
  optionId: "storage-open",
  optionTitle: "大量开放格",
  value: "高开放",
  action: "like",
  createdAt: 1,
};

test("固定演示场景识别开放格冲突并给出20/80折中建议", () => {
  const conflicts = detectConflicts([event]);
  assert.equal(conflicts[0]?.id, "open-clean-child");
  assert.match(conflicts[0]?.recommendation ?? "", /20% 开放展示＋80% 封闭收纳/);
});

test("明确喜欢会实时写入画像并标记来源", () => {
  const profile = buildProfile([event]);
  assert.deepEqual(profile[0], {
    label: "收纳方式",
    value: "高开放",
    confidence: 78,
    source: "客户明确选择",
  });
});
