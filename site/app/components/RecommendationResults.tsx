"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { buildRecommendationInput, recommend } from "../lib/recommendation-engine";
import type { CustomerWorkspace } from "../types/customer";
import { DeliveryBoard } from "./DeliveryBoard";

type Props = {
  workspace: CustomerWorkspace;
  onUpdate: (updater: (current: CustomerWorkspace) => CustomerWorkspace) => void;
};

const money = (value: number) => `${(value / 10_000).toFixed(value % 10_000 === 0 ? 0 : 1)}万`;

export function RecommendationResults({ workspace, onUpdate }: Props) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { events, recommendationBudgetMax: budgetMax, request } = workspace;
  const input = useMemo(() => buildRecommendationInput(events, budgetMax, request), [events, budgetMax, request]);
  const run = useMemo(() => recommend(input), [input]);
  const selectedResult = run.results.find((result) => result.case.id === workspace.selectedCaseId) ?? null;
  const budgetOptions = [...new Set([Math.max(request.budgetMin, request.budgetMax - 50_000), request.budgetMax, request.budgetMax + 50_000])].sort((a, b) => a - b);

  return (
    <section className="recommendation-section" id="recommendations" aria-labelledby="recommendation-title">
      <div className="recommendation-intro">
        <div>
          <p className="kicker">STEP 04 · CASE RECOMMENDATION</p>
          <h2 id="recommendation-title">三种取舍，<em>都说清为什么。</em></h2>
          <p>先过滤展示权限、脱敏、主图和预算硬上限，再按七项固定权重计算。三套结果不是只换图片，而是分别偏向成熟度、审美匹配和预算效率。</p>
        </div>
        <div className="budget-control" aria-label="调整预算并重新推荐">
          <span>模拟预算上限</span>
          <strong>{money(budgetMax)}元</strong>
          <div>
            {budgetOptions.map((budget) => (
              <button key={budget} className={budget === budgetMax ? "active" : ""} onClick={() => onUpdate((current) => ({ ...current, recommendationBudgetMax: budget, selectedCaseId: null, resolvedRiskIds: [] }))}>{money(budget)}</button>
            ))}
          </div>
          {budgetMax !== request.budgetMax && <small>已从{money(request.budgetMax)}基准重新计算，排序与预算分同步变化。</small>}
        </div>
      </div>

      <div className="run-audit">
        <div><span>案例库</span><strong>{run.sourceCaseCount}条</strong></div>
        <div><span>合规且未超预算</span><strong>{run.eligibleCaseCount}条</strong></div>
        <div><span>本轮候选</span><strong>{run.candidateCount}条</strong></div>
        <div><span>算法版本</span><strong>{run.version}</strong></div>
        {run.expanded && <p>候选少于10条，已按文档规则放宽地区/面积软约束；展示权、脱敏和预算上限未放宽。</p>}
      </div>

      <div className="recommendation-grid">
        {run.results.map((result, index) => {
          const open = expandedCard === result.case.id;
          return (
            <article className={`recommendation-card strategy-${result.strategy}`} key={result.case.id}>
              <div className="strategy-heading">
                <span>0{index + 1}</span>
                <div><p>{result.strategyLabel}</p><small>{result.outputLabel}</small></div>
                {result.exploration && <b>探索推荐</b>}
              </div>
              <div className="recommendation-image">
                <Image src={result.case.image!} alt={`${result.case.title}，AI生成示意图`} fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized />
                <span className="ai-badge">AI生成示意图</span>
                <div className="score-seal"><strong>{result.totalScore.toFixed(1)}</strong><span>综合匹配</span></div>
              </div>
              <div className="recommendation-body">
                <div className="case-title-row"><div><p>{result.case.id}</p><h3>{result.case.title}</h3></div><span>{result.case.mainStyle}</span></div>
                <div className="case-facts">
                  <span>{result.case.areaM2}㎡ · {result.case.layout}</span>
                  <span>{result.case.householdType}</span>
                  <span>模拟预算 {money(result.case.budgetTotal)}元</span>
                  <span>封闭收纳 {Math.round(result.case.storageClosedRatio * 100)}%</span>
                </div>

                <div className="reason-block">
                  <p>为什么推荐</p>
                  <ol>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ol>
                </div>
                <div className="tradeoff"><span>取舍提醒</span><p>{result.tradeoff}</p></div>

                <button className="score-toggle" onClick={() => setExpandedCard(open ? null : result.case.id)} aria-expanded={open}>
                  {open ? "收起分项得分" : "查看分项得分与证据"}<span>{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="score-breakdown">
                    <div className="score-table-head"><span>分项</span><span>得分</span><span>权重</span></div>
                    {result.breakdown.map((item) => (
                      <div className="score-row" key={item.key}>
                        <div><strong>{item.label}</strong><small>{item.evidence}</small></div>
                        <span>{item.score.toFixed(1)}</span>
                        <span>{Math.round(item.weight * 100)}%</span>
                        <i style={{ width: `${item.score}%` }} />
                      </div>
                    ))}
                    <p>策略重排分：{result.strategyScore.toFixed(1)}。综合匹配分仍严格采用PRD七项基础权重。</p>
                  </div>
                )}

                <div className="case-rights">
                  <span>数据声明</span>
                  <p>{result.case.dataOrigin}；预算、家庭、成交、满意度、交期等业务字段均为AI模拟，不构成真实报价或成交证明。</p>
                  {result.case.sourceUrl && <a href={result.case.sourceUrl} target="_blank" rel="noreferrer">查看来源参考页 ↗</a>}
                </div>
                <button className="select-plan-button" onClick={() => {
                  onUpdate((current) => ({ ...current, selectedCaseId: result.case.id, resolvedRiskIds: [] }));
                  window.setTimeout(() => document.getElementById("delivery-board")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                }}>{selectedResult?.case.id === result.case.id ? "已选择此方案" : "选择此方案，进入交付看板"}<span>→</span></button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="algorithm-note">
        <div><strong>基础公式</strong><p>S = 25%风格＋20%预算＋15%户型面积＋15%家庭结构＋10%功能需求＋10%成交表现＋5%满意度</p></div>
        <div><strong>解释边界</strong><p>推荐理由来自分项得分与案例可见字段；“模拟已成交”不是实际成交证明，系统不会输出保证成交、绝不超预算等承诺。</p></div>
      </div>
      {selectedResult && <DeliveryBoard recommendation={selectedResult} workspace={workspace} onUpdate={onUpdate} />}
    </section>
  );
}
