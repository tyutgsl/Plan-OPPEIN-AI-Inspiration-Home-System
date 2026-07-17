"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { preferenceRounds } from "../data/preference-rounds";
import { buildProfile, detectConflicts, selectedAction } from "../lib/preference-engine";
import type { PreferenceAction, PreferenceEvent, PreferenceOption } from "../types/preferences";
import { RecommendationResults } from "./RecommendationResults";

const actionMeta: Record<Exclude<PreferenceAction, "skip">, { label: string; icon: string }> = {
  like: { label: "喜欢", icon: "♡" },
  dislike: { label: "不喜欢", icon: "×" },
  neutral: { label: "都可以", icon: "○" },
};

export function VisualPreferenceSelector() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [events, setEvents] = useState<PreferenceEvent[]>([]);
  const [preview, setPreview] = useState<PreferenceOption | null>(null);
  const [conflictChoice, setConflictChoice] = useState<"accepted" | "kept" | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [budgetMax, setBudgetMax] = useState(250_000);
  const round = preferenceRounds[roundIndex];
  const profile = useMemo(() => buildProfile(events), [events]);
  const conflicts = useMemo(() => detectConflicts(events), [events]);
  const activeConflict = conflicts[0];
  const completion = Math.round(((roundIndex + 1) / preferenceRounds.length) * 100);
  const roundHasChoice = events.some((event) => event.round === round.key);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const choose = (option: PreferenceOption, action: Exclude<PreferenceAction, "skip">) => {
    setConflictChoice(null);
    setEvents((current) => [
      ...current.filter((event) => !(event.round === round.key && event.optionId === option.id)),
      { id: crypto.randomUUID(), round: round.key, optionId: option.id, optionTitle: option.title, value: option.value, action, createdAt: Date.now() },
    ]);
  };

  const skipRound = () => {
    setEvents((current) => [...current, { id: crypto.randomUUID(), round: round.key, action: "skip", createdAt: Date.now() }]);
    if (roundIndex === preferenceRounds.length - 1) {
      setShowRecommendations(true);
      window.setTimeout(() => document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } else {
      setRoundIndex((current) => Math.min(preferenceRounds.length - 1, current + 1));
    }
  };

  const undo = () => {
    setEvents((current) => {
      const last = current.at(-1);
      if (last) setRoundIndex(preferenceRounds.findIndex((item) => item.key === last.round));
      return current.slice(0, -1);
    });
    setConflictChoice(null);
  };

  const acceptCompromise = () => {
    const option = preferenceRounds.find((item) => item.key === "storage")?.options.find((item) => item.id === "storage-balanced");
    if (!option) return;
    setEvents((current) => [
      ...current.filter((event) => event.round !== "storage"),
      { id: crypto.randomUUID(), round: "storage", optionId: option.id, optionTitle: "20%开放＋80%封闭", value: "高封闭", action: "like", createdAt: Date.now() },
    ]);
    setConflictChoice("accepted");
  };

  const finishProfile = () => {
    setShowRecommendations(true);
    window.setTimeout(() => document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="欧派AI灵感家首页">
          <span className="brand-mark">OP</span>
          <span><strong>欧派 AI 灵感家</strong><small>让模糊想法，变成可落地的家</small></span>
        </a>
        <div className="demo-pill"><span />演示客户：林女士 · 广州 · 98㎡</div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="kicker">AI VISUAL DISCOVERY · STEP 02</p>
          <h1>不必描述风格，<br /><em>看图就能说清楚。</em></h1>
          <p className="hero-copy">基于前置需求，逐轮确认氛围、风格与生活细节。每次选择都会实时更新客户画像，并主动提示难以兼顾的需求。</p>
        </div>
        <div className="journey" aria-label="客户旅程进度">
          {["需求输入", "视觉选择", "客户画像", "案例推荐"].map((label, index) => (
            <div className={`journey-step ${index === 1 ? "active" : ""} ${index === 0 ? "done" : ""}`} key={label}>
              <span>{index === 0 ? "✓" : index + 1}</span><small>{label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace" aria-label="视觉偏好选择器">
        <div className="selector-panel">
          <div className="selector-topline">
            <div>
              <p className="round-label">{round.eyebrow}</p>
              <h2>{round.title}</h2>
              <p>{round.prompt}</p>
            </div>
            <div className="round-progress" aria-label={`完成度 ${completion}%`}>
              <strong>{String(roundIndex + 1).padStart(2, "0")}</strong><span>/ 07</span>
              <div><i style={{ width: `${completion}%` }} /></div>
            </div>
          </div>

          <div className="card-grid">
            {round.options.map((option) => {
              const current = selectedAction(events, round.key, option.id);
              return (
                <article className={`choice-card ${current ? `is-${current}` : ""}`} key={option.id}>
                  <button className="image-button" onClick={() => setPreview(option)} aria-label={`放大查看：${option.title}`}>
                    <Image src={option.image} alt={`${option.title}，AI生成示意图`} fill sizes="(max-width: 760px) 100vw, 28vw" unoptimized />
                    <span className="ai-badge">AI生成示意图</span>
                    <span className="zoom-hint">点击放大 ↗</span>
                  </button>
                  <div className="choice-copy">
                    <div><h3>{option.title}</h3><p>{option.description}</p></div>
                    <div className="tags">{option.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </div>
                  <div className="card-actions" aria-label={`评价 ${option.title}`}>
                    {Object.entries(actionMeta).map(([action, meta]) => (
                      <button className={current === action ? "selected" : ""} onClick={() => choose(option, action as Exclude<PreferenceAction, "skip">)} key={action} aria-pressed={current === action}>
                        <b>{meta.icon}</b>{meta.label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {activeConflict && (
            <aside className="conflict-card" role="alert">
              <div className="conflict-icon">!</div>
              <div>
                <p className="conflict-eyebrow">需求冲突提醒 · AI建议</p>
                <h3>{activeConflict.title}</h3>
                <p><strong>原因：</strong>{activeConflict.cause}</p>
                <p><strong>影响：</strong>{activeConflict.impact}</p>
                <div className="recommendation"><span>折中建议</span>{activeConflict.recommendation}</div>
                <div className="conflict-actions">
                  <button className="primary-small" onClick={acceptCompromise}>采用“20%开放＋80%封闭”</button>
                  <button onClick={() => setConflictChoice("kept")}>保留我的选择</button>
                  {conflictChoice && <small>{conflictChoice === "accepted" ? "已写入客户画像" : "已保留，并记录风险"}</small>}
                </div>
              </div>
            </aside>
          )}
          {conflictChoice === "accepted" && !activeConflict && (
            <div className="conflict-resolved" role="status"><span>✓</span><p><strong>已写入客户画像</strong>收纳偏好调整为20%开放＋80%封闭，并保留本次折中记录。</p></div>
          )}

          <div className="selector-footer">
            <button className="text-button" onClick={undo} disabled={!events.length}>↶ 撤销上一步</button>
            <div>
              <button className="text-button" onClick={skipRound}>跳过本轮</button>
              <button className="primary-button" disabled={!roundHasChoice} onClick={() => roundIndex === preferenceRounds.length - 1 ? finishProfile() : setRoundIndex((current) => Math.min(preferenceRounds.length - 1, current + 1))}>
                {roundIndex === preferenceRounds.length - 1 ? "完成视觉画像" : "保存并进入下一轮"} <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="profile-panel" aria-live="polite">
          <div className="profile-heading"><p>实时客户画像</p><span><i />AI 正在理解</span></div>
          <h2>林女士的家</h2>
          <p className="profile-summary">三房两厅 · 夫妻＋6岁儿童<br />预算约25万元 · 强收纳</p>
          <div className="profile-needs">
            <span>儿童安全</span><span>易清洁</span><span>视觉整洁</span>
          </div>
          <div className="profile-list">
            {profile.length ? profile.map((item) => (
              <div className="profile-item" key={item.label}>
                <div><span>{item.label}</span><small>{item.source}</small></div>
                <strong>{item.value}</strong>
                <div className="confidence"><i style={{ width: `${item.confidence}%` }} /><small>{item.confidence}%</small></div>
              </div>
            )) : <div className="empty-profile"><span>✦</span><p>做出第一次选择后，<br />画像会在这里实时生长。</p></div>}
          </div>
          <div className="profile-note"><span>i</span>画像仅基于本次演示选择，不代表欧派真实客户数据。</div>
        </aside>
      </section>

      {showRecommendations && <RecommendationResults events={events} budgetMax={budgetMax} onBudgetChange={setBudgetMax} />}

      <footer><span>欧派AI灵感家 · MVP v1.0</span><p>页面图片均为 <strong>AI生成示意图</strong>，仅用于产品功能演示，不代表真实交付效果。</p></footer>

      {preview && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={`查看 ${preview.title}`} onClick={() => setPreview(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreview(null)} aria-label="关闭放大图">×</button>
            <div className="modal-image"><Image src={preview.image} alt={`${preview.title}，AI生成示意图`} fill sizes="90vw" priority unoptimized /><span className="ai-badge large">AI生成示意图</span></div>
            <div className="modal-caption"><div><p>视觉偏好参考</p><h2>{preview.title}</h2></div><span>{preview.description}</span></div>
          </div>
        </div>
      )}
    </main>
  );
}
