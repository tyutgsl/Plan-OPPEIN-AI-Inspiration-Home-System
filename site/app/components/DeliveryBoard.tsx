"use client";

import { useMemo } from "react";
import { createDeliveryProject } from "../lib/delivery-engine";
import type { CustomerWorkspace } from "../types/customer";
import type { RecommendationResult } from "../types/recommendation";

type Props = {
  recommendation: RecommendationResult;
  workspace: CustomerWorkspace;
  onUpdate: (updater: (current: CustomerWorkspace) => CustomerWorkspace) => void;
};
const money = (value: number) => `¥${value.toLocaleString("zh-CN")}`;
const statusLabel = { completed: "已完成", current: "进行中", risk: "风险待处理", pending: "待开始" } as const;

export function DeliveryBoard({ recommendation, workspace, onUpdate }: Props) {
  const { resolvedRiskIds } = workspace;
  const project = useMemo(() => createDeliveryProject(recommendation.case.id, resolvedRiskIds, workspace.id), [recommendation.case.id, resolvedRiskIds, workspace.id]);
  const openRisks = project.risks.filter((risk) => risk.status === "open");
  const quoteTotal = project.skus.filter((sku) => project.quotedSkuCodes.includes(sku.skuCode)).reduce((sum, sku) => sum + sku.lineTotal, 0);
  const fullTotal = project.skus.reduce((sum, sku) => sum + sku.lineTotal, 0);

  const resolveRisk = (riskId: string) => onUpdate((current) => ({ ...current, resolvedRiskIds: current.resolvedRiskIds.includes(riskId) ? current.resolvedRiskIds : [...current.resolvedRiskIds, riskId] }));

  return (
    <section className="delivery-board" id="delivery-board" aria-labelledby="delivery-title">
      <div className="delivery-hero">
        <div>
          <p className="kicker">STEP 05 · DELIVERY CONTROL</p>
          <h2 id="delivery-title">一条透明的<em>模拟交付链</em></h2>
          <p>{workspace.request.displayName}的同一份客户画像与所选方案继续服务报价和交付。这里展示的SKU、价格、日期和进度均为比赛MVP模拟数据，不连接欧派真实系统。</p>
        </div>
        <div className="project-id-card"><span>模拟项目编号</span><strong>{project.id}</strong><small>{project.version}</small></div>
      </div>

      <div className="project-summary">
        <div><span>所选方案</span><strong>{project.selectedCaseTitle}</strong><small>{project.selectedCaseId}</small></div>
        <div><span>当前阶段</span><strong>{project.currentStageLabel}</strong><small>{project.demoStatus}</small></div>
        <div><span>模拟预计验收</span><strong>{project.promisedDate}</strong><small>不构成交付承诺</small></div>
        <div className="project-progress"><span>整体模拟进度</span><strong>{project.progress}%</strong><div><i style={{ width: `${project.progress}%` }} /></div></div>
      </div>

      <div className="stage-timeline" aria-label="八阶段模拟交付进度">
        {project.stages.map((stage, index) => (
          <div className={`stage-item stage-${stage.status}`} key={stage.key}>
            <div className="stage-marker"><span>{stage.status === "completed" ? "✓" : index + 1}</span></div>
            <p>{stage.label}</p><strong>{statusLabel[stage.status]}</strong><small>{stage.plannedDate}</small>
            <em>{stage.summary}</em>
          </div>
        ))}
      </div>

      <div className="delivery-content">
        <div className="delivery-main">
          <div className="delivery-section-heading"><div><p>模拟SKU协同清单</p><h3>方案、报价与交期逐行核对</h3></div><span>{project.skus.length}个品类项</span></div>
          <div className="sku-table" role="table" aria-label="模拟SKU报价与交期清单">
            <div className="sku-row sku-head" role="row"><span>品类 / 模拟SKU</span><span>金额</span><span>交期</span><span>报价状态</span></div>
            {project.skus.map((sku) => {
              const quoted = project.quotedSkuCodes.includes(sku.skuCode) || resolvedRiskIds.includes("RISK-QUOTE-001");
              return <div className={`sku-row ${quoted ? "" : "sku-missing"}`} role="row" key={sku.id}>
                <div><strong>{sku.category}</strong><p>{sku.productName}</p><small>{sku.skuCode} · AI虚构SKU</small></div>
                <span>{money(sku.lineTotal)}</span><span>{sku.deliveryDays}天</span><b>{quoted ? "已列入" : "漏项"}</b>
              </div>;
            })}
          </div>
          <div className="quote-reconcile">
            <div><span>当前模拟报价合计</span><strong>{money(resolvedRiskIds.includes("RISK-QUOTE-001") ? fullTotal : quoteTotal)}</strong></div>
            <div><span>完整SKU清单合计</span><strong>{money(fullTotal)}</strong></div>
            <p>{resolvedRiskIds.includes("RISK-QUOTE-001") ? "已模拟补齐漏项，两侧金额一致。" : `当前相差${money(fullTotal - quoteTotal)}，禁止直接进入模拟下单。`}</p>
          </div>

          <div className="activity-block">
            <div className="delivery-section-heading"><div><p>项目动态</p><h3>每次检查与处置都有记录</h3></div><span>演示日志</span></div>
            <div className="activity-list">{project.activities.map((activity, index) => (
              <div className={`activity activity-${activity.kind}`} key={`${activity.time}-${index}`}><span>{activity.time}</span><i /><div><strong>{activity.title}</strong><p>{activity.detail}</p></div></div>
            ))}</div>
          </div>
        </div>

        <aside className="risk-center">
          <div className="risk-center-header"><div><p>AI风险预警</p><h3>{openRisks.length ? `${openRisks.length}项待处理` : "固定风险已处理"}</h3></div><span className={openRisks.length ? "alerting" : "clear"}>{openRisks.length ? "!" : "✓"}</span></div>
          <p className="risk-disclaimer">本地规则根据模拟SKU、报价行和交期字段检查；无外部AI时仍可运行。</p>
          <div className="risk-list">
            {project.risks.map((risk) => (
              <article className={`risk-event risk-${risk.status}`} key={risk.id}>
                <div className="risk-meta"><span>{risk.severity === "high" ? "高风险" : "中风险"}</span><b>{risk.status === "open" ? "待处理" : "已模拟处理"}</b></div>
                <h4>{risk.title}</h4>
                <p><strong>证据</strong>{risk.evidence}</p>
                <p><strong>影响</strong>{risk.impact}</p>
                <div className="risk-suggestion"><span>建议处置</span><ol>{risk.suggestion.map((step) => <li key={step}>{step}</li>)}</ol></div>
                {risk.status === "open" ? <button onClick={() => resolveRisk(risk.id)}>{risk.actionLabel} →</button> : <div className="risk-done">✓ 已记录模拟处置结果</div>}
              </article>
            ))}
          </div>
          {!openRisks.length && <div className="ready-next"><span>✓</span><div><strong>可以进入模拟下单</strong><p>报价已补齐，交期已按两批齐套重排。</p></div></div>}
        </aside>
      </div>
    </section>
  );
}
