import assert from "node:assert/strict";
import test from "node:test";
import { buildRecommendationInput, recommend } from "../app/lib/recommendation-engine";

const defaultRun = recommend(buildRecommendationInput([], 250_000));

test("一次生成三种不重复策略结果并保留审计快照", () => {
  assert.equal(defaultRun.results.length, 3);
  assert.deepEqual(defaultRun.results.map((item) => item.strategy), ["safe", "personal", "budget"]);
  assert.equal(new Set(defaultRun.results.map((item) => item.case.id)).size, 3);
  assert.equal(defaultRun.sourceCaseCount, 60);
  assert.match(defaultRun.version, /^oppein-rec-v1\.0/);
});

test("综合分严格等于PRD七项固定权重的加权结果", () => {
  for (const result of defaultRun.results) {
    const recomputed = Math.round(result.breakdown.reduce((sum, item) => sum + item.score * item.weight, 0) * 10) / 10;
    assert.equal(result.totalScore, recomputed);
    assert.equal(result.breakdown.length, 7);
  }
});

test("每套提供三条证据理由和一条非绝对化取舍", () => {
  const banned = /最适合|保证成交|绝不超预算|一定准时/;
  for (const result of defaultRun.results) {
    assert.ok(result.reasons.length >= 3);
    assert.ok(result.tradeoff.length > 10);
    assert.doesNotMatch([...result.reasons, result.tradeoff].join(" "), banned);
  }
});

test("预算硬上限不会放宽，25万改20万后推荐发生合理变化", () => {
  const budget20 = recommend(buildRecommendationInput([], 200_000));
  assert.ok(budget20.results.every((item) => item.case.budgetTotal <= 200_000));
  assert.notDeepEqual(budget20.results.map((item) => item.case.id), defaultRun.results.map((item) => item.case.id));
});

test("推荐只使用已脱敏、具备本地演示图和展示声明的案例", () => {
  for (const result of defaultRun.results) {
    assert.equal(result.case.anonymized, true);
    assert.ok(result.case.image);
    assert.ok(result.case.displayRight);
  }
});
