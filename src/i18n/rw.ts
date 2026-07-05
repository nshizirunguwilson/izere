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
    scoreBreakdown: 'Igice cya buri kintu',
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
      auditTitle: "Igenzura ry'urunigi rw'amafaranga",
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

  tips: {
    helpLabel: 'Ubufasha',
    exampleLabel: 'Urugero',

    app: {
      title: 'Izere ni iki?',
      body: "Izere isoma amateka ya MoMo y'ubucuruzi akaguha amanota, inguzanyo ntarengwa, n'impamvu zoroheje zishobora kwemezwa na banki.",
      example: 'Iduka rishyiraho CSV yamezi 6. Izere ivuga Byemewe, inguzanyo RWF 2.5M, n\'impamvu zoroheje.',
    },
    upload: {
      title: 'Shyiraho amakuru',
      body: "Shyiraho cyangwa hitamo dosiye CSV yavanywe mu Mobile Money. Isomwa mu buryo bwa browser gusa. Nta kintu cyoherezwa kuri server.",
      example: 'Sohora mu MTN MoMo cyangwa Airtel Money, hanyuma ushyire hano dosiye.',
    },
    uploadColumns: {
      title: 'Inkingi zisabwa',
      body: "Buri murongo ni igikorwa kimwe. Dosiye isaba itariki, ID, ubwoko, uwishyuye, umubare, amafaranga y'imirimo, n'amafaranga asigaye.",
      example: '2026-01-05, TXN001, PAYMENT_RECEIVED, Customer, 15000, 75, 250000',
    },
    sampleHealthy: {
      title: 'Iduka rikora neza',
      body: "Urugero rw'ubucuruzi bufite ubwishyu buhoraho, amafaranga meza, n'amakuru asukuye. Koresha ugaragaze icyemezo cy'Byemewe.",
    },
    sampleSeasonal: {
      title: "Umucuruzi w'ibihe",
      body: "Urugero rw'ubucuruzi bufite amezi meza n'amezi mabi. Koresha ugaragaze icyemezo cyo gusuzuma, si ukwangirwa.",
    },
    sampleTampered: {
      title: 'Amakuru yahinduwe',
      body: "Urugero rw'idosiye umuntu yahinduye imibare ariko urunigi rw'amafaranga ntirukora. Koresha ugaragaze igenzura rya fraud.",
      example: "Umurongo 692 ugaragaza amafaranga asigaye atahura n'ibibarwa by'umurongo ubanjiriye.",
    },
    parseError: {
      title: 'Dosiye ntiyasomwe',
      body: "CSV irimo inkingi zibura, amatariki mabi, cyangwa ubwoko bw'ibikorwa butazwi. Kosora dosiye cyangwa ukoreshe urugero.",
    },
    integrityFail: {
      title: 'Igenzura yanze',
      body: "Dusubiramo buri gikorwa tugenzura niba amafaranga asigaye = ayari asanzwe + umubare − amafaranga y'imirimo. Nibiracitse, ntitanga amanota.",
      example: "Umuntu yongeye ibyinjira ariko ntago yahinduye inkingi y'amafaranga asigaye. Tubona umurongo utazwi.",
    },
    integrityTable: {
      title: "Imbonerahamwe y'igenzura",
      body: "Imirongo igaragaza aho ibibarwa byacitse. Ayari ategerejwe ni ibyo tubara. Ayanditswe ni ibyo dosiye ivuga.",
    },
    integrityExpected: {
      title: 'Ayari ategerejwe',
      body: "Amafaranga asigaye yari kugomba kuba niba wongeyeho iki gikorwa ku murongo ubanjiriye ukagabanyije amafaranga y'imirimo.",
    },
    integrityRecorded: {
      title: 'Ayanditswe',
      body: "Ibyo dosiye ivuga ko amafaranga asigaye ari. Nibitandukanye n'ibyo tubara, umurongo ugaragazwa mu mutuku.",
    },
    verified: {
      title: 'Amakuru yemejwe',
      body: "Urunigi rw'amafaranga rukora, amatariki akurikirana, nta nomero zisubiyemo. Birashoboka gupima.",
    },
    exportReport: {
      title: 'Sohora raporo',
      body: 'Capa cyangwa ubike iyi paji nka PDF kugira ngo uyishyire mu bubiko cyangwa uyisangize umukoresha inguzanyo.',
    },
    newStatement: {
      title: 'Tangira bushya',
      body: 'Siba dosiye iriho ushyireho ubundi bucuruzi cyangwa amakuru mashya.',
    },
    langToggle: {
      title: 'Ururimi',
      body: 'Hindura hagati y\'Icyongereza n\'Ikinyarwanda. Ubutumwa bwa ubufasha bukurikirana ururimi wahisemo.',
    },
    navDashboard: {
      title: 'Ahabanza',
      body: "Icyemezo nyamukuru: amanota, icyemezo, inguzanyo ntarengwa, ubushobozi bwo kwishyura, n'impamvu z'ingenzi.",
    },
    navMonthly: {
      title: 'Incamake ya buri kwezi',
      body: "Ibyinjira, ibisohoka, inyungu, n'iminsi y'ubucuruzi buri kwezi.",
    },
    navLoan: {
      title: 'Gusaba inguzanyo',
      body: 'Andika umubare n\'igihe urebe niba inguzanyo isabwa ihura n\'ibyo amakuru ya MoMo yemeza.',
      example: 'Saba RWF 2M mu mezi 6. Izere igera ubwishyu ku kwezi n\'ubushobozi bwo kwishyura.',
    },
    creditScore: {
      title: "Amanota y'inguzanyo",
      body: "Umubare kuva 0 kugeza 100 ugereranyije n'ibimenyetso bitanu bya MoMo. Hejuru bisobanura amafaranga meza. Uburemere ni urugero rwa demo.",
      example: "Amanota 85 hamwe n'Byemewe bisobanura ko ubucuruzi bushobora kubona inguzanyo y'imikoreshereze.",
    },
    verdict: {
      title: 'Icyemezo',
      body: "Byemewe (70+): ibimenyetso bimeze neza. Birasuzumwa (45–69): umuntu agomba gusuzuma. Byanzwe (munsi ya 45): amafaranga make. Ntibirapimwa: amateka make.",
      example: "Birasuzumwa ntabwo ari ukwangirwa. Bisobanura ko banki igomba kubaza ibindi bibazo.",
    },
    recommendedLimit: {
      title: 'Inguzanyo ntarengwa',
      body: "Inguzanyo ntarengwa dutanga ukurikije amakuru, hafi ya 2.5× inyungu isigara ku kwezi (ibyinjira bikagabanyijwe ibisohoka).",
      example: "Niba inyungu isigara RWF 400k ku kwezi, inguzanyo ≈ RWF 1M.",
    },
    repaymentCapacity: {
      title: 'Ubushobozi bwo kwishyura',
      body: "Ubwishyu bw'ukwezi ntarengwa tutekereza ko bashobora kwishyura, ntiburenze 30% by'inyungu isigara ku kwezi.",
      example: 'Inyungu RWF 500k/kwezi → ubushobozi hafi RWF 150k/kwezi.',
    },
    responsibleLending: {
      title: 'Inguzanyo iboneye',
      body: "Ntitanga ubwishyu bw'ukwezi burenze 30% by'inyungu isigara. Ibi birinda uwizigama kwigera.",
    },
    whyDecision: {
      title: "Impamvu z'iki cyemezo",
      body: "Impamvu eshatu z'ingenzi z'amanota, mu magambo yoroheje kugira ngo umukoresha inguzanyo abasobanurire umukiriya.",
    },
    scoreBreakdown: {
      title: 'Igice cya buri kintu',
      body: "Ibintu bitanu byegeranyanyijwe mu manota. Buri bar ni 0–100 kuri icyo kintu. Uburemere ni urugero rwa demo.",
    },
    subInflow: {
      title: 'Ibyinjira ku kwezi',
      body: "Amafaranga y'abakiriya aboneka ku kwezi mu gihe gisanzwe. Ibyinjira byinshi bihoraho bisobanura uwizigama umutekano.",
    },
    subRegularity: {
      title: "Guhoraho kw'ibyinjira",
      body: "Inshuro amafaranga aboneka mu minsi y'ubucuruzi. Idosiye yishyurwa iminsi 20/kwezi iruta iminsi 5.",
    },
    subBalanceFloor: {
      title: "Urwego rw'amafaranga",
      body: "Inshuro amafaranga ya MoMo yagumye hejuru ya RWF 10,000. Kugera hafi ya zeru bisobanura imitwarire y'amafaranga.",
    },
    subVolatility: {
      title: 'Ihindagurika',
      body: "Uko ibyinjira bihinduka ukwezi ku kundi. Amezi ahagaze aruta amezi ahindagurika cyane.",
      example: "Ibyinjira byinshi muri Werurwe n'ake muri Mata bigabanya amanota.",
    },
    subExpenseRatio: {
      title: 'Ibisohoka ku byinjira',
      body: "Igice cy'ibyinjira gikoreshwa mu bisohoka n'amafaranga y'imirimo. Kubika byinshi byinjira ni byiza.",
      example: "Gukoresha 50% ku bicuruzwa ni byiza; gukoresha 110% bisobanura igihombo.",
    },
    cashflowChart: {
      title: "Imigendekere y'amafaranga",
      body: "Uburebure bwa bar igaragaza amafaranga yinjiye buri kwezi. Koresha ubonere amezi make cyangwa iterambere.",
    },
    topCustomers: {
      title: 'Abakiriya ba mbere',
      body: "Abishyuye ubucuruzi cyane ukoresheje MoMo. Ifasha banki kubona niba ibyinjira biterwa n'umukiriya umwe.",
      example: "Niba 80% biva ku mukiriya umwe, kumubura byagora kwishyura.",
    },
    stressTest: {
      title: "Igerageza ry'ihungabana",
      body: "Sukura ugaragaze ibyinjira bigabanutse. Amanota n'inguzanyo bihinduka ako kanya urebe niba bakomeza kwishyura.",
      example: "Ku −20% by'ibyinjira, ubucuruzi bwa Birasuzumwa bushobora kugera ku Byanzwe.",
    },
    notScoreable: {
      title: 'Ntibirapimwa',
      body: "Hagati y'amezi 3 cyangwa ibikorwa birenze 40. Tegereza amateka menshi aho gutekereza.",
      example: "Iduka rishya rifite amasomo 6 gusa ya MoMo ribona ubu butumwa, si ukwangirwa.",
    },
    monthlySummary: {
      title: "Imbonerahamwe y'ukwezi",
      body: "Buri murongo ni ukwezi kumwe. Koresha urebe imibare iri inyuma y'amanota.",
    },
    colMonth: {
      title: 'Ukwezi',
      body: "Ukwezi kw'ikalendaro gukoranyijwe n'ibikorwa byose by'icyo gihe.",
    },
    colInflow: {
      title: 'Ibyinjira',
      body: "Ubwishyu bw'abakiriya n'igice cy'ibyinjira byoherejwe. Amafaranga y'umwenyine atibarwa nk'inyungu.",
    },
    colExpenses: {
      title: 'Ibisohoka',
      body: "Amafaranga yoherejwe n'amafaranga y'imirimo y'ibikorwa muri uko kwezi.",
    },
    colNet: {
      title: 'Inyungu',
      body: "Ibyinjira bikaganyijwe ibisohoka muri uko kwezi. Ibi ni ibyo ubucuruzi cyakiriye.",
      example: 'Ibyinjira RWF 800k, ibisohoka RWF 500k → inyungu RWF 300k.',
    },
    colSellingDays: {
      title: "Iminsi y'ubucuruzi",
      body: "Iminsi muri uko kwezi ubwishyu bw'abakiriya bwabonekemo nibura rimwe.",
    },
    loanRequest: {
      title: 'Gusuzuma gusaba inguzanyo',
      body: "Bigera ubwishyu bw'ukwezi ku nguzanyo isabwa n'ubushobozi bwo kwishyura buva mu makuru.",
    },
    loanAmount: {
      title: "Umubare w'inguzanyo",
      body: 'Amafaranga yose ubucuruzi bushaka guhabwa, mu RWF.',
      example: 'RWF 2,000,000 yo gukoresha mu bicuruzwa.',
    },
    loanTerm: {
      title: "Igihe cy'inguzanyo",
      body: "Amezi yo kwishyura. Igihe kirekire bisobanura ubwishyu buke buri kwezi.",
      example: 'RWF 2M mu mezi 12 aho mu mezi 6 bigabanya ubwishyu buri kwezi.',
    },
    loanVerdict: {
      title: 'Icyemezo cyo guhuza',
      body: "Birahuye: ubwishyu buri mu bushobozi. Birenzeho gake: birenze gato ariko hari igisubizo. Ntibihuye: ubwishyu burenze amafaranga tubona.",
    },
  },

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
