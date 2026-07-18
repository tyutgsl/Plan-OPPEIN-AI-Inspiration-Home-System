"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LIN_DEMO_ID, linDemoRequest } from "../lib/customer-storage";
import { householdLabel, type CustomerRequest, type CustomerWorkspace } from "../types/customer";

type Props = {
  customers: CustomerWorkspace[];
  onSave: (request: CustomerRequest, editingId?: string) => void;
  onStart: (customerId: string) => void;
  onUseDemo: () => void;
  onDelete: (customerId: string) => void;
};

const cities = ["广州", "深圳", "佛山", "东莞", "珠海", "中山", "惠州", "其他华南城市"];
const layouts = ["一房一厅", "两房两厅", "三房两厅", "四房两厅", "五房及以上", "其他"];
const needOptions = ["儿童安全", "适老无障碍", "宠物友好", "强收纳", "易清洁", "视觉整洁", "环保材料", "智能家居"];

const emptyRequest = (): CustomerRequest => ({
  displayName: "",
  city: "广州",
  layout: "三房两厅",
  areaM2: 98,
  budgetMin: 200_000,
  budgetMax: 250_000,
  household: { adults: 2, children: 1, elders: 0, pets: 0 },
  moveInMonth: "",
  freeText: "",
  specialNeeds: [],
  demoMode: false,
});

export function CustomerManager({ customers, onSave, onStart, onUseDemo, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [draft, setDraft] = useState<CustomerRequest>(emptyRequest);
  const [showForm, setShowForm] = useState(customers.length <= 1);
  const [errors, setErrors] = useState<string[]>([]);
  const sortedCustomers = useMemo(() => [...customers].sort((a, b) => Number(a.id === LIN_DEMO_ID) - Number(b.id === LIN_DEMO_ID) || b.updatedAt - a.updatedAt), [customers]);

  const openCreate = () => {
    setEditingId(undefined);
    setDraft(emptyRequest());
    setErrors([]);
    setShowForm(true);
    window.setTimeout(() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const openEdit = (customer: CustomerWorkspace) => {
    setEditingId(customer.id);
    setDraft(structuredClone(customer.request));
    setErrors([]);
    setShowForm(true);
    window.setTimeout(() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const validate = () => {
    const next: string[] = [];
    if (!draft.displayName.trim()) next.push("请填写客户称呼或匿名编号。");
    if (!draft.city) next.push("请选择城市。");
    if (!draft.layout) next.push("请选择户型。");
    if (draft.areaM2 < 30 || draft.areaM2 > 500) next.push("面积应在30—500㎡之间。");
    if (draft.budgetMin <= 0 || draft.budgetMax < draft.budgetMin) next.push("预算上限必须大于或等于预算下限。");
    if (draft.household.adults + draft.household.children + draft.household.elders <= 0) next.push("请至少填写一位居住成员。");
    if (draft.freeText.trim().length < 10 || draft.freeText.trim().length > 500) next.push("自由描述应为10—500字。");
    setErrors(next);
    return next.length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSave({ ...draft, displayName: draft.displayName.trim(), freeText: draft.freeText.trim() }, editingId);
  };

  const setHousehold = (key: keyof CustomerRequest["household"], value: number) => setDraft((current) => ({
    ...current,
    household: { ...current.household, [key]: Math.max(0, Math.min(9, value || 0)) },
  }));

  return (
    <main className="customer-home">
      <section className="home-hero-shell" id="top">
        <div className="home-hero">
          <Image className="home-hero-media" src="/cases/01_pure_ai_cases/OP-AI-001_奶咖晨光成长之家.png" alt="柔和晨光中的现代家居空间，AI生成示意图" fill priority unoptimized />
          <div className="home-hero-wash" />
          <div className="home-hero-content">
            <nav className="home-nav" aria-label="主导航">
              <a className="home-brand" href="#top" aria-label="欧派AI灵感家首页"><span>OP</span><strong>欧派 AI 灵感家</strong></a>
              <div className="home-nav-links"><a href="#customer-list-title">客户空间</a><button onClick={openCreate}>需求采集</button><button onClick={onUseDemo}>智能体验</button></div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} className="home-nav-cta" onClick={openCreate}><span><ArrowUpRight /></span>创建匿名客户</motion.button>
            </nav>

            <div className="home-hero-copy">
              <motion.div className="home-badge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}><Sparkles />AI 全屋灵感工作台</motion.div>
              <motion.h1 initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .2 }}>让家的想象，<br />自然流向现实。</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: .4 }}>从一句生活描述出发，通过视觉偏好、智能推荐与透明交付，把模糊灵感沉淀为可理解、可选择、可推进的家居方案。</motion.p>
            </div>

            <motion.div className="home-demo-card" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .8, delay: .2 }}>
              <span>固定演示案例</span><strong>林女士 · 98㎡</strong><small>7 轮视觉选择 · 完整推荐链路</small>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} onClick={onUseDemo}><i><ArrowUpRight /></i>一键使用林女士演示案例</motion.button>
            </motion.div>

            <motion.button className="home-corner-cta" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .8, delay: .4 }} onClick={openCreate}>
              <i><ArrowUpRight /></i><span><strong>创建专属方案</strong><small>录入匿名需求 <ChevronRight /></small></span>
            </motion.button>
            <a className="home-scroll" href="#customer-list-title" aria-label="浏览客户列表"><ArrowDown /></a>
          </div>
        </div>
      </section>

      <section className="customer-list-section" aria-labelledby="customer-list-title">
        <div className="customer-list-visual" aria-hidden="true">
          <Image src="/cases/01_pure_ai_cases/OP-AI-008_静奢门墙柜一体宅.png" alt="" fill sizes="(max-width: 760px) 0px, 62vw" unoptimized />
          <span>静奢门墙柜一体宅 · AI 灵感场景</span>
        </div>
        <div className="section-heading"><div><p>本机客户列表</p><h2 id="customer-list-title">选择客户，继续上次体验</h2></div><span>{customers.length}份匿名档案</span></div>
        <div className="customer-grid">
          {sortedCustomers.map((customer) => {
            const completed = customer.events.length;
            return <article className={`customer-card ${customer.id === LIN_DEMO_ID ? "demo-customer" : ""}`} key={customer.id}>
              <div className="customer-card-top"><span>{customer.id === LIN_DEMO_ID ? "固定演示" : "本机匿名"}</span><small>{new Date(customer.updatedAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 更新</small></div>
              <h3>{customer.request.displayName}</h3>
              <p>{customer.request.city} · {customer.request.areaM2}㎡ · {customer.request.layout}</p>
              <div className="customer-facts"><span>{householdLabel(customer.request.household)}</span><span>预算{customer.request.budgetMin / 10_000}—{customer.request.budgetMax / 10_000}万元</span><span>视觉记录 {completed} 条</span></div>
              <div className="customer-card-actions"><button className="primary-small" onClick={() => onStart(customer.id)}>{completed ? "继续体验" : "开始视觉选择"} →</button><button onClick={() => openEdit(customer)}>编辑需求</button>{customer.id !== LIN_DEMO_ID && <button className="danger-text" onClick={() => window.confirm(`确定删除“${customer.request.displayName}”的本机演示记录吗？`) && onDelete(customer.id)}>删除</button>}</div>
            </article>;
          })}
        </div>
        <div className="local-storage-note"><span>i</span><p><strong>本地保存说明</strong>这些档案只保存在当前浏览器的 localStorage 中。评委从GitHub下载项目后，会在自己的电脑生成独立数据，不会访问你的电脑或数据库。</p></div>
      </section>

      {showForm && <section className="request-form-section" id="request-form" aria-labelledby="request-title">
        <div className="request-form-pattern" aria-hidden="true"><Image src="/patterns/interior-botanical-pattern.png" alt="" fill sizes="100vw" unoptimized /></div>
        <div className="section-heading"><div><p>{editingId ? "编辑匿名需求" : "创建匿名需求"}</p><h2 id="request-title">完成基础资料后进入视觉选择</h2></div><button className="text-button" onClick={() => setShowForm(false)}>收起表单</button></div>
        <form className="request-form" onSubmit={submit} noValidate>
          <fieldset><legend>基础资料</legend><div className="form-grid">
            <label><span>客户称呼 / 匿名编号 *</span><input value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} placeholder="例如：客户001或王女士" maxLength={30} /></label>
            <label><span>所在城市 *</span><select value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
            <label><span>户型 *</span><select value={draft.layout} onChange={(e) => setDraft({ ...draft, layout: e.target.value })}>{layouts.map((layout) => <option key={layout}>{layout}</option>)}</select></label>
            <label><span>建筑面积（㎡）*</span><input type="number" min="30" max="500" value={draft.areaM2} onChange={(e) => setDraft({ ...draft, areaM2: Number(e.target.value) })} /></label>
            <label><span>预算下限（万元）*</span><input type="number" min="1" max="999" value={draft.budgetMin / 10_000} onChange={(e) => setDraft({ ...draft, budgetMin: Number(e.target.value) * 10_000 })} /></label>
            <label><span>预算上限（万元）*</span><input type="number" min="1" max="999" value={draft.budgetMax / 10_000} onChange={(e) => setDraft({ ...draft, budgetMax: Number(e.target.value) * 10_000 })} /></label>
            <label><span>预计入住月份（可选）</span><input type="month" value={draft.moveInMonth ?? ""} onChange={(e) => setDraft({ ...draft, moveInMonth: e.target.value })} /></label>
          </div></fieldset>

          <fieldset><legend>家庭结构 *</legend><div className="household-grid">
            {([['adults', '成人'], ['children', '儿童'], ['elders', '老人'], ['pets', '宠物']] as const).map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min="0" max="9" value={draft.household[key]} onChange={(e) => setHousehold(key, Number(e.target.value))} /></label>)}
          </div></fieldset>

          <fieldset><legend>特殊需求（可多选）</legend><div className="need-checks">{needOptions.map((need) => <label key={need}><input type="checkbox" checked={draft.specialNeeds.includes(need)} onChange={(e) => setDraft((current) => ({ ...current, specialNeeds: e.target.checked ? [...current.specialNeeds, need] : current.specialNeeds.filter((item) => item !== need) }))} /><span>{need}</span></label>)}</div></fieldset>

          <label className="free-text"><span>请用一句话描述理想的家 *</span><textarea rows={4} minLength={10} maxLength={500} value={draft.freeText} onChange={(e) => setDraft({ ...draft, freeText: e.target.value })} placeholder="例如：喜欢温馨简洁、容易打理的家，收纳要多，家里有小孩……" /><small>{draft.freeText.trim().length}/500字 · 原文会被保留用于需求复核</small></label>
          {errors.length > 0 && <div className="form-errors" role="alert"><strong>请先完善以下内容：</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
          <div className="privacy-confirm"><span>✓</span><p>比赛演示版不收集手机号、身份证、详细地址等真实身份信息；提交后仅保存到当前浏览器。</p></div>
          <div className="form-submit"><button type="button" className="text-button" onClick={() => setDraft(editingId === LIN_DEMO_ID ? structuredClone(linDemoRequest) : emptyRequest())}>重置表单</button><button className="primary-button" type="submit">保存需求并进入视觉选择 →</button></div>
        </form>
      </section>}
    </main>
  );
}
