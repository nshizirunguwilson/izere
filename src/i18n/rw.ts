import type { Dict } from './en';
import type { Reason } from '../lib/types';

// Kinyarwanda copy: working draft, please review wording before the demo.

const rwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;

export const rw: Dict = {
  tagline: "Amateka ya Mobile Money → icyemezo cy'inguzanyo cyizewe",

  nav: {
    menu: 'Urutonde',
    dashboard: 'Ahabanza',
    monthly: 'Incamake ya buri kwezi',
    loan: 'Gusaba inguzanyo',
  },

  shell: {
    newStatement: 'Tangira bushya',
    exportReport: 'Sohora raporo',
  },

  dashboard: {
    scoreLabel: "Amanota y'inguzanyo",
    cashflow: "Imigendekere y'amafaranga",
    whyTitle: "Impamvu z'iki cyemezo",
  },

  customers: {
    title: 'Abakiriya ba mbere',
    payments: (n: number) => `ubwishyu ${n}`,
  },

  loan: {
    title: 'Gusaba inguzanyo',
    subtitle: "Ese inguzanyo isabwa ihuye n'icyo amakuru yemeza? Inyungu ya 2% ku kwezi.",
    amount: 'Umubare (RWF)',
    term: 'Igihe (amezi, 1-24)',
    verdicts: { MATCH: 'Birahuye', STRETCH: 'Birenzeho gake', MISMATCH: 'Ntibihuye' },
    summary: (payment: number, capacity: number, ratioPct: string) =>
      `Ubwishyu ${rwf(payment)} ku kwezi ugereranyije n'ubushobozi bwa ${rwf(capacity)} ku kwezi (${ratioPct} by'ubushobozi)`,
    fits: "Iki cyifuzo gihuye n'ibigaragara mu mafaranga. Nta gitangwa gisimbura gikenewe.",
    counterOffer: (term: number, max: number) =>
      `Igitangwa gisimbura: mu mezi ${term}, amafaranga yemeza kugeza kuri ${rwf(max)}`,
    counterKeepTerm: (amount: number, minTerm: number) =>
      `, cyangwa ugumane ${rwf(amount)} wongera igihe kikagera ku mezi ${minTerm}.`,
    counterNoTerm: (amount: number) =>
      `; nta gihe kitarenze amezi 24 gituma ${rwf(amount)} yishyurwa.`,
    invalidAmount: 'Andika umubare urenze 0.',
    invalidTerm: "Igihe kigomba kuba umubare wuzuye hagati y'ukwezi 1 na 24.",
    reason: {
      farExceedsEvidence: 'Umubare usabwa urenze kure icyo ibigaragara mu mafaranga byemeza',
    },
  },

  upload: {
    drop: "Shyira hano dosiye CSV y'amakuru ya MoMo",
    columns: 'date, txn_id, type, counterparty, amount, fee, balance',
    choose: 'Hitamo dosiye',
    orSample: 'Cyangwa ukoreshe urugero:',
    samples: {
      healthy: 'Iduka rikora neza',
      seasonal: "Umucuruzi w'ibihe",
      tampered: 'Amakuru yahinduwe',
    },
  },

  parseErrorTitle: (name: string) => `Ntibyashobotse gusoma ${name}`,

  integrity: {
    failTitle: 'Amakuru yanze igenzura, nta manota atangwa',
    brokenRows: (rows: string) =>
      `Urunigi rw'amafaranga rwacitse ku murongo ${rows}: amafaranga asigaye yanditse ntahura n'ayari asanzwe wongeyeho iki gikorwa.`,
    duplicates: (ids: string) => `Nomero z'ibikorwa zisubiyemo: ${ids}`,
    outOfOrder: (rows: string) => `Ibikorwa bidakurikirana ku matariki ku murongo ${rows}`,
    advice:
      "Aya makuru asa n'ayahinduwe cyangwa atuzuye. Saba ubucuruzi kongera gusohora amakuru mashya mbere yo gusuzuma.",
    verified: (name: string, count: number) =>
      `${name} yagenzuwe: ibikorwa ${count}, urunigi rw'amafaranga rwuzuye, nta byasubiyemo, amatariki akurikirana.`,
    table: {
      row: 'Umurongo',
      date: 'Itariki',
      description: 'Ibisobanuro',
      type: 'Ubwoko',
      amount: 'Umubare',
      expected: 'Ayari ategerejwe',
      recorded: 'Ayanditswe',
      hidden: (n: number) => `… imirongo ${n} ihishwe …`,
      mismatch: (off: number) => `itandukaniro: ${rwf(off)}`,
    },
  },

  verdict: {
    APPROVE: 'Byemewe',
    REVIEW: 'Birasuzumwa',
    DECLINE: 'Byanzwe',
    NOT_SCOREABLE: 'Ntibirapimwa',
  },

  subs: {
    inflow: 'Ibyinjira ku kwezi',
    regularity: "Guhoraho kw'ibyinjira",
    balanceFloor: "Urwego rw'amafaranga",
    volatility: 'Ihindagurika',
    expenseRatio: 'Ibisohoka ku byinjira',
  },

  results: {
    title: (name: string) => `Icyemezo cy'inguzanyo: ${name}`,
    of100: 'kuri 100',
    baseline: (score: number, verdict: string) => `Itangiriro: ${score} (${verdict})`,
    recommendedLimit: 'Inguzanyo ntarengwa itangwa',
    limitFormula: (multiplier: number, mean: number) =>
      `${multiplier}× by'inyungu isigara ku kwezi (${rwf(mean)})`,
    capacity: (x: number) => `Ubushobozi bwo kwishyura ku kwezi: ${rwf(x)}`,
    responsible: "Inguzanyo iboneye: ntirenza 30% by'inyungu isigara ku kwezi",
    weightsNote:
      "Uburemere ni urugero (25 / 20 / 20 / 20 / 15). Moderi nyayo izigira ku bisubizo by'inguzanyo.",
    showSummary: 'Erekana incamake ya buri kwezi',
    hideSummary: 'Hisha incamake ya buri kwezi',
    monthlySummary: 'Incamake ya buri kwezi',
    table: {
      month: 'Ukwezi',
      inflow: 'Ibyinjira',
      expenses: 'Ibisohoka',
      net: 'Inyungu',
      sellingDays: "Iminsi y'ubucuruzi",
    },
    notScoreable: 'Ntibirapimwa',
    notScoreableSub:
      'Nta mateka ahagije yo gupima ubu bucuruzi mu buryo bukwiye. Ntabwo ari ukwangirwa.',
  },

  stress: {
    title: "Igerageza ry'ihungabana",
    subtitle: 'Ese ibyinjira biramutse bigabanutse, bakomeza kwishyura? Hindura urebe ako kanya.',
    shock: "Igabanuka ry'ibyinjira",
    stressedScore: "Amanota nyuma y'ihungabana",
    capacity: 'Ubushobozi bwo kwishyura',
    limit: 'Inguzanyo ntarengwa',
    perMonth: ' ku kwezi',
  },

  months: [
    'Mutarama',
    'Gashyantare',
    'Werurwe',
    'Mata',
    'Gicurasi',
    'Kamena',
    'Nyakanga',
    'Kanama',
    'Nzeri',
    'Ukwakira',
    'Ugushyingo',
    'Ukuboza',
  ],

  reason: (r: Reason): string => {
    switch (r.key) {
      case 'inflow':
        return `Ugereranyije, amafaranga yinjira ku kwezi ni ${rwf(r.mean)} mu mezi ${r.months}`;
      case 'sellingDays':
        return `Ubwishyu bw'abakiriya bugera ku minsi ${r.days} kuri ${r.of} y'ubucuruzi buri kwezi`;
      case 'lowBalance':
        return r.share === 0
          ? `Amafaranga yagumye hejuru ya ${rwf(10_000)} igihe cyose`
          : `Amafaranga yamanutse munsi ya ${rwf(10_000)} kuri ${pct(r.share)} by'iminsi`;
      case 'volatility':
        return `Ibyinjira bihindagurika ${pct(r.swing)} ukwezi ku kundi`;
      case 'spending':
        return Number.isFinite(r.ratio)
          ? `Mu kwezi gisanzwe, ${pct(r.ratio)} by'ibyinjira bikoreshwa mu bisohoka n'amafaranga y'imirimo`
          : 'Ibisohoka biruta ibyinjira mu kwezi gisanzwe';
      case 'notEnoughHistory':
        return `Hari amezi ${r.months} gusa n'ibikorwa ${r.txns} biboneka; gupima bisaba nibura amezi 3 n'ibikorwa 40`;
      case 'keepReceivingPayments':
        return "Komeza wakire ubwishyu bw'abakiriya ukoresheje MoMo kugira ngo amateka yiyongere";
      case 'comeBackLater':
        return "Garuka igihe amezi 3 cyangwa arenga y'ibikorwa azaba yanditswe";
    }
  },
};
