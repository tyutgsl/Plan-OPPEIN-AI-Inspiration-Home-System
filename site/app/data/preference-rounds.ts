import type { PreferenceRound } from "../types/preferences";

const ai = (file: string) => `/cases/01_pure_ai_cases/${file}`;
const ref = (file: string) => `/cases/02_official_reference_derivatives/${file}`;

export const preferenceRounds: PreferenceRound[] = [
  {
    key: "mood",
    eyebrow: "01 · 整体氛围",
    title: "第一眼，你更想住进哪种感觉？",
    prompt: "先凭直觉选，不需要懂专业风格。",
    options: [
      { id: "mood-warm", title: "明亮温馨", description: "柔和日光与低饱和暖色", image: ai("OP-AI-001_奶咖晨光成长之家.png"), tags: ["通透", "亲和"], value: "明亮温馨" },
      { id: "mood-premium", title: "沉稳高级", description: "深色层次与克制光泽", image: ai("OP-AI-008_静奢门墙柜一体宅.png"), tags: ["静奢", "层次"], value: "沉稳高级" },
      { id: "mood-natural", title: "自然松弛", description: "木色、织物与自然肌理", image: ai("OP-AI-005_双宠友好原木小家.png"), tags: ["原生", "舒展"], value: "自然松弛" },
      { id: "mood-tech", title: "简洁科技", description: "清晰线条与智能氛围", image: ai("OP-AI-013_智能极简四口之家.png"), tags: ["利落", "智能"], value: "简洁科技" },
    ],
  },
  {
    key: "style",
    eyebrow: "02 · 装修风格",
    title: "哪种设计语言更像你的家？",
    prompt: "可对多张图片表达态度，画像会实时综合。",
    options: [
      { id: "style-modern", title: "现代简约", description: "干净线面，减少装饰负担", image: ref("OP-PUB-006_立方体现代简约四居室_AI演示图.png"), tags: ["简洁", "耐看"], value: "现代简约" },
      { id: "style-wood", title: "现代原木", description: "轻木色与温润触感", image: ai("OP-AI-002_浅橡木亲子收纳宅.png"), tags: ["温润", "自然"], value: "现代原木" },
      { id: "style-cream", title: "奶油风", description: "柔软曲线与暖白包裹感", image: ai("OP-AI-007_云朵奶油婚房.png"), tags: ["柔和", "轻盈"], value: "奶油" },
      { id: "style-chinese", title: "新中式", description: "东方秩序与现代留白", image: ai("OP-AI-009_东方留白书香之家.png"), tags: ["东方", "留白"], value: "新中式" },
    ],
  },
  {
    key: "temperature",
    eyebrow: "03 · 冷暖色",
    title: "你希望家的色彩温度如何？",
    prompt: "颜色会影响空间明暗感与情绪。",
    options: [
      { id: "temp-warm", title: "暖色", description: "奶咖、浅木与柔暖白", image: ref("OP-PUB-014_焦糖风情温暖风94㎡设计案例_AI演示图.png"), tags: ["温暖", "松弛"], value: "暖" },
      { id: "temp-neutral", title: "中性色", description: "米灰、木色，长久耐看", image: ai("OP-AI-015_柔光意式收纳宅.png"), tags: ["克制", "百搭"], value: "中性" },
      { id: "temp-cool", title: "冷色", description: "灰白与冷调金属感", image: ai("OP-AI-012_琥珀金属都市大宅.png"), tags: ["清爽", "现代"], value: "冷" },
      { id: "temp-mix", title: "冷暖平衡", description: "暖木打底，冷色局部点缀", image: ref("OP-PUB-005_埃菲尔现代三居室_AI演示图.png"), tags: ["平衡", "层次"], value: "中性" },
    ],
  },
  {
    key: "material",
    eyebrow: "04 · 材质",
    title: "你更喜欢哪种触感与细节？",
    prompt: "我们会同时考虑清洁难度与预算。",
    options: [
      { id: "material-matte", title: "哑光肤感", description: "柔和不刺眼，视觉更整洁", image: ai("OP-AI-001_奶咖晨光成长之家.png"), tags: ["哑光", "低反光"], value: "哑光" },
      { id: "material-wood", title: "自然木纹", description: "保留温度与真实纹理", image: ai("OP-AI-011_全龄无障碍原木宅.png"), tags: ["木纹", "温润"], value: "木纹" },
      { id: "material-stone", title: "石材肌理", description: "利落纹理强化品质感", image: ai("OP-AI-004_无界客餐厅轻奢宅.png"), tags: ["石材", "大气"], value: "石材" },
      { id: "material-glass", title: "玻璃与金属", description: "轻盈展示与精致反射", image: ai("OP-AI-012_琥珀金属都市大宅.png"), tags: ["玻璃", "金属"], value: "玻璃/金属" },
    ],
  },
  {
    key: "storage",
    eyebrow: "05 · 收纳方式",
    title: "物品应该怎样被看见？",
    prompt: "结合林女士的儿童安全、易清洁和视觉整洁需求判断。",
    options: [
      { id: "storage-closed", title: "高封闭收纳", description: "≥75%封闭，整洁且易维护", image: ai("OP-AI-008_静奢门墙柜一体宅.png"), tags: ["隐形", "整洁"], value: "高封闭" },
      { id: "storage-balanced", title: "均衡收纳", description: "展示与隐藏各有分工", image: ai("OP-AI-002_浅橡木亲子收纳宅.png"), tags: ["均衡", "灵活"], value: "均衡" },
      { id: "storage-open", title: "大量开放格", description: "高开放比例，展示感更强", image: ref("OP-PUB-001_97㎡北欧风情设计案例_AI演示图.png"), tags: ["展示", "开放"], value: "高开放" },
      { id: "storage-wall", title: "门墙柜一体", description: "柜体融入墙面，减少零碎感", image: ai("OP-AI-015_柔光意式收纳宅.png"), tags: ["一体化", "隐藏"], value: "高封闭" },
    ],
  },
  {
    key: "lighting",
    eyebrow: "06 · 灯光",
    title: "夜晚的家，想要怎样被照亮？",
    prompt: "灯光方案会同步校验预算和施工复杂度。",
    options: [
      { id: "light-main", title: "有主灯", description: "维护简单，照明效率直接", image: ai("OP-AI-006_银发友好暖木居.png"), tags: ["实用", "明亮"], value: "有主灯" },
      { id: "light-none", title: "无主灯", description: "多层次灯光，氛围细腻", image: ai("OP-AI-004_无界客餐厅轻奢宅.png"), tags: ["层次", "氛围"], value: "无主灯" },
      { id: "light-mixed", title: "混合照明", description: "主照明与局部氛围兼顾", image: ai("OP-AI-013_智能极简四口之家.png"), tags: ["均衡", "弹性"], value: "混合" },
      { id: "light-natural", title: "自然光优先", description: "减少遮挡，强调日间采光", image: ref("OP-PUB-023_69㎡木色生香北欧风两居_AI演示图.png"), tags: ["通透", "节能"], value: "混合" },
    ],
  },
  {
    key: "personality",
    eyebrow: "07 · 个性元素",
    title: "最后，为家留一个属于你的记忆点",
    prompt: "个性元素只做局部点缀，避免影响整体可交付性。",
    options: [
      { id: "personal-reading", title: "阅读角", description: "窗边留一处安静阅读位置", image: ai("OP-AI-009_东方留白书香之家.png"), tags: ["阅读", "安静"], value: "阅读角" },
      { id: "personal-child", title: "亲子成长墙", description: "可变收纳与成长展示", image: ai("OP-AI-002_浅橡木亲子收纳宅.png"), tags: ["亲子", "成长"], value: "亲子成长" },
      { id: "personal-pet", title: "宠物友好", description: "耐磨材质与共享动线", image: ai("OP-AI-005_双宠友好原木小家.png"), tags: ["宠物", "耐磨"], value: "宠物友好" },
      { id: "personal-tea", title: "东方茶叙", description: "一处克制的茶饮与会客场景", image: ai("OP-AI-014_东方茶叙适老雅居.png"), tags: ["茶叙", "东方"], value: "东方茶叙" },
    ],
  },
];

export const roundLabels = Object.fromEntries(
  preferenceRounds.map((round) => [round.key, round.eyebrow.replace(/^\d+ · /, "")]),
);
