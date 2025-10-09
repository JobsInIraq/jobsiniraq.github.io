// assets/js/payscale-dashboard.js
// ES module. Handles: theme toggle, i18n (EN/AR/CKB with RTL), label translations,
// stats, table, insights, export CSV/JSON, print view, legends.

// ---- imports ----
import { Grid, html } from "https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.module.min.js";

// Add Grid.js CSS dynamically
const gridCSS = document.createElement('link');
gridCSS.rel = 'stylesheet';
gridCSS.href = 'https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/theme/mermaid.min.css';
document.head.appendChild(gridCSS);

// ---- read data injected by Jekyll at build time ----
const dataEl = document.getElementById("payscale-data");
const RAW = dataEl ? JSON.parse(dataEl.textContent || "{}") : {};

// ---- theme setup ----
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
root.setAttribute("data-theme", savedTheme);

const themeBtn = document.getElementById("themeToggle");
if(themeBtn) {
  themeBtn.addEventListener("click", () => {
    const t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  });
}

// ---- languages & UI strings ----
const STRINGS = {
  en: {
    title:"Payscale Dashboard", 
    caption:"Data source: _data/db/salaries.json. All salaries are monthly unless stated.",
    theme:"Theme", aiInsights:"AI Insights",
    tableTitle:"Data Table", 
    tableCaption:"Search, sort, and paginate. Rows are read as-is from _data/db/salaries.json.",
    kpiMedian:(v)=>`Median: ${v}`, 
    kpiIQR:(a,b)=>`IQR (P25–P75): ${a} – ${b}`, 
    kpiSample:(n)=>`Sample size: ${n}`,
    allCities:"All cities", allCats:"All categories", allTypes:"All types", allPeriods:"All periods",
    reset:"Reset filters", export:"Export CSV", exportJson:"Export JSON", print:"Print view",
    results:(n)=>`${n} result${n===1?'':'s'}`, 
    cityLegend:"City legend", categoryLegend:"Category legend",
    cols:{ title:"Title", category:"Category", city:"City", type:"Type", period:"Period", min:"Min", max:"Max", last:"Last Verified", source:"Source" }
  },
  ar: {
    title:"لوحة الأجور", 
    caption:"مصدر البيانات: _data/db/salaries.json. جميع الرواتب شهرية ما لم يُذكر غير ذلك.",
    theme:"الوضع", aiInsights:"رؤى ذكية",
    tableTitle:"جدول البيانات", 
    tableCaption:"بحث وفرز وتقسيم للصفحات. يتم قراءة الصفوف كما هي من _data/db/salaries.json.",
    kpiMedian:(v)=>`الوسيط: ${v}`, 
    kpiIQR:(a,b)=>`المدى بين الرُبعين: ${a} – ${b}`, 
    kpiSample:(n)=>`حجم العينة: ${n}`,
    allCities:"كل المدن", allCats:"كل الفئات", allTypes:"كل الأنواع", allPeriods:"كل الفترات",
    reset:"إعادة التصفية", export:"تصدير CSV", exportJson:"تصدير JSON", print:"عرض الطباعة",
    results:(n)=>`${n} نتيجة`, 
    cityLegend:"دليل المدن", categoryLegend:"دليل الفئات",
    cols:{ title:"العنوان", category:"الفئة", city:"المدينة", type:"النوع", period:"الفترة", min:"الحد الأدنى", max:"الحد الأقصى", last:"آخر تحديث", source:"المصدر" }
  },
  ckb: {
    title:"داشبۆڕدی مووچەکان", 
    caption:"سەرچاوەی داتا: _data/db/salaries.json. هەموو مووچەکان مانگانەن تا ئەگەر جیاواز نەکراوە.",
    theme:"دووخور/ڕوناکا", aiInsights:"ئاگادارییە هۆشیاڕانەکان",
    tableTitle:"خشتەی داتا", 
    tableCaption:"گەڕان، پۆلەکردن و لاپەڕەکردن. داتاکان وەک خۆیان لە _data/db/salaries.json خوێندراون.",
    kpiMedian:(v)=>`ناوەندێتی: ${v}`, 
    kpiIQR:(a,b)=>`نێوان چوارەکی یەکەم و سێیەم: ${a} – ${b}`, 
    kpiSample:(n)=>`قەبارەی نموونە: ${n}`,
    allCities:"هەموو شارەکان", allCats:"هەموو پۆلەکان", allTypes:"هەموو جۆرەکان", allPeriods:"هەموو ماوەکان",
    reset:"دووبارەکردنەوەی پاڵاوتن", export:"هەناردەی CSV", exportJson:"هەناردەی JSON", print:"چاپکردن",
    results:(n)=>`${n} دەرئەنجام`, 
    cityLegend:"ڕێبەری شار", categoryLegend:"ڕێبەری پۆل",
    cols:{ title:"ناونیشان", category:"پۆل", city:"شار", type:"جۆر", period:"ماوە", min:"کەمترین", max:"زۆرترین", last:"دوا نوێکردنەوە", source:"سەرچاوە" }
  }
};

const LOCALE_MAP = { en: "en", ar: "ar", ckb: "ckb" };
const langPicker = document.getElementById("langPicker");

const i18n = {
  cur: localStorage.getItem("lang") || "en",
  set(l){
    this.cur = l; 
    localStorage.setItem("lang", l);
    const rtl = l === "ar" || l === "ckb";
    const appRoot = document.getElementById("app-root");
    if(appRoot) appRoot.setAttribute("dir", rtl ? "rtl" : "ltr");
    
    const S = STRINGS[l];
    const updateText = (id, text) => {
      const el = document.getElementById(id);
      if(el) el.textContent = text;
    };
    
    updateText("t.title", S.title);
    updateText("t.caption", S.caption);
    updateText("t.theme", S.theme);
    updateText("t.aiInsights", S.aiInsights);
    updateText("t.tableTitle", S.tableTitle);
    updateText("t.tableCaption", S.tableCaption);
    updateText("t.reset", S.reset);
    updateText("t.export", S.export);
    updateText("t.exportJson", S.exportJson);
    updateText("t.print", S.print);
    updateText("t.cityLegend", S.cityLegend);
    updateText("t.categoryLegend", S.categoryLegend);
    
    setFirstOption(document.getElementById("f-city"), S.allCities);
    setFirstOption(document.getElementById("f-category"), S.allCats);
    setFirstOption(document.getElementById("f-etype"), S.allTypes);
    setFirstOption(document.getElementById("f-period"), S.allPeriods);
    
    populateFilters(); 
    applyFilters();
  }
};

if(langPicker) {
  langPicker.value = i18n.cur;
  langPicker.addEventListener("change", (e)=> i18n.set(e.target.value));
}

// ---- translation maps for data labels ----
const LABELS = {
  category: {
    en: { 
      "IT":"IT", 
      "Human Resources":"Human Resources", 
      "Procurement":"Procurement", 
      "Sales":"Sales", 
      "Design":"Design",
      "Engineering":"Engineering",
      "Finance":"Finance",
      "Management":"Management",
      "Marketing":"Marketing",
      "Business":"Business",
      "Customer Service":"Customer Service"
    },
    ar: { 
      "IT":"تقنية المعلومات", 
      "Human Resources":"الموارد البشرية", 
      "Procurement":"المشتريات", 
      "Sales":"المبيعات", 
      "Design":"التصميم",
      "Engineering":"الهندسة",
      "Finance":"المالية",
      "Management":"الإدارة",
      "Marketing":"التسويق",
      "Business":"الأعمال",
      "Customer Service":"خدمة العملاء"
    },
    ckb:{ 
      "IT":"IT", 
      "Human Resources":"سەرچاوەی مرۆیی", 
      "Procurement":"کڕین", 
      "Sales":"فرۆشتن", 
      "Design":"دیزاین",
      "Engineering":"ئەندازیاری",
      "Finance":"دارایی",
      "Management":"بەڕێوەبردن",
      "Marketing":"بازاڕگەری",
      "Business":"بازرگانی",
      "Customer Service":"خزمەتگوزاری کڕیار"
    }
  },
  type: {
    en: { "Full-Time":"Full-Time", "Part-Time":"Part-Time", "Contract":"Contract" },
    ar: { "Full-Time":"دوام كامل", "Part-Time":"دوام جزئي", "Contract":"عقد" },
    ckb:{ "Full-Time":"تەواوکات", "Part-Time":"کاتی", "Contract":"گرێبەست" }
  },
  city: {
    en: { 
      "Baghdad":"Baghdad", "Erbil":"Erbil", "Basra":"Basra", 
      "Sulaymaniyah":"Sulaymaniyah", "Kirkuk":"Kirkuk", "Karbala":"Karbala" 
    },
    ar: { 
      "Baghdad":"بغداد", "Erbil":"أربيل", "Basra":"البصرة", 
      "Sulaymaniyah":"السليمانية", "Kirkuk":"كركوك", "Karbala":"كربلاء" 
    },
    ckb:{ 
      "Baghdad":"بەغداد", "Erbil":"هەولێر", "Basra":"بەصرە", 
      "Sulaymaniyah":"سلێمانی", "Kirkuk":"کەرکوک", "Karbala":"کەربەلا" 
    }
  },
  period: {
    en: { "monthly":"monthly", "hourly":"hourly", "daily":"daily" },
    ar: { "monthly":"شهري", "hourly":"بالساعة", "daily":"يومي" },
    ckb:{ "monthly":"مانگانە", "hourly":"کاتژمێرێ", "daily":"ڕۆژانە" }
  }
};

// ---- helpers ----
const FX = { USD_IQD: 1310 };
const currentLocale = () => LOCALE_MAP[i18n.cur] || "en";
const numberFmt = (n, cur) => n == null ? "—" : (cur === "USD" ? n.toLocaleString(currentLocale())+" USD/mo" : n.toLocaleString(currentLocale())+" IQD/mo");
const toIQD = (amt, cur) => cur === "USD" ? Math.round(amt * FX.USD_IQD) : amt;
const toUSD = (amt, cur) => cur === "IQD" ? Math.round(amt / FX.USD_IQD) : amt;
const get = (obj, path, dflt=null) => path.split(".").reduce((o,k)=> (o && k in o ? o[k] : dflt), obj ?? dflt);

const parseNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;
  const c = String(v).replace(/[^0-9.\-]/g, "");
  if (!c || c==="." || c==="-" ) return null;
  const n = Number(c);
  return Number.isFinite(n) ? Math.round(n) : null;
};

const median = (a)=>{ 
  if(!a.length) return null; 
  const s=[...a].sort((x,y)=>x-y); 
  const m=Math.floor(s.length/2); 
  return s.length%2 ? s[m] : Math.round((s[m-1]+s[m])/2); 
};

const percentile = (a,p)=>{ 
  if(!a.length) return null; 
  const s=[...a].sort((x,y)=>x-y);
  const i=(p/100)*(s.length-1);
  const lo=Math.floor(i), hi=Math.ceil(i); 
  return lo===hi ? s[lo] : Math.round(s[lo]+(s[hi]-s[lo])*(i-lo)); 
};

const setFirstOption = (sel,text)=>{ 
  if(sel && sel.options.length) sel.options[0].textContent=text; 
};

const uniq = (arr)=> [...new Set(arr.filter(Boolean))].sort((a,b)=> a.localeCompare(b,currentLocale()));

const translate = (domain, raw)=> (LABELS[domain]?.[i18n.cur] || {})[raw] || raw;

// consistent color from string
const hashCode = (str)=> {
  let h=0; 
  for(let i=0;i<str.length;i++){ 
    h = (h<<5)-h + str.charCodeAt(i); 
    h |= 0; 
  }
  return h;
};

const colorFromString = (str)=> {
  const h = Math.abs(hashCode(str)) % 360;
  return `hsl(${h}, 60%, 55%)`;
};

// ---- normalize rows ----
const INPUT = Array.isArray(RAW?.jobs) ? RAW.jobs : [];

const normalizeRow = (row)=>{
  const job = row.job||{};
  const jd=get(job,"jobDetails",{})||{};
  const sal=get(job,"salary",{})||{};
  const loc=get(job,"location",{})||{};
  const src=get(job,"sources",{})||{};
  const portal=get(src,"jobPortal",{})||{};
  const socials=get(src,"socialMedia",{})||{};
  
  const title = jd.jobTitle||"—";
  const category = jd.category||"—";
  const employment_type = (jd.position||"—").toString().replace(/0$/,"");
  const period = "monthly";
  const city = loc.city||"—";
  
  const iqd = parseNum(sal.iqd), usd = parseNum(sal.usd);
  let currency=null, amtMin=null, amtMax=null;
  
  if(iqd && (!usd||usd===0)){ 
    currency="IQD"; amtMin=iqd; amtMax=iqd; 
  }
  else if(usd && (!iqd||iqd===0)){ 
    currency="USD"; amtMin=usd; amtMax=usd; 
  }
  else if(iqd && usd){ 
    currency="IQD"; amtMin=iqd; amtMax=iqd; 
  }
  else { 
    currency="IQD"; 
  }
  
  const source_ref = portal.link || portal.site || socials.telegram || socials.facebook || 
                     socials.linkedin || socials.instagram || socials.tiktok || 
                     get(src,"website","") || "";
  const last_verified = row.updated_at || row.created_at || "";
  
  return { raw:row, title, category, city, employment_type, period, currency, amtMin, amtMax, last_verified, source_ref };
};

const NORM = INPUT.map(normalizeRow);

// ---- DOM refs ----
const fCity = document.getElementById("f-city");
const fCat  = document.getElementById("f-category");
const fType = document.getElementById("f-etype");
const fPeriod = document.getElementById("f-period");
const fCurrency = document.getElementById("f-currency");
const resultCount = document.getElementById("resultCount");
const exportCsvBtn = document.getElementById("exportCsv");
const exportJsonBtn = document.getElementById("exportJson");
const resetBtn = document.getElementById("resetFilters");
const printBtn = document.getElementById("printBtn");
const legendCityEl = document.getElementById("legend-city");
const legendCatEl = document.getElementById("legend-cat");

// ---- populate filters ----
const populateFilters = ()=>{
  [fCity,fCat,fType].forEach(sel=>{ 
    if(sel) {
      while(sel.options.length>1) sel.remove(1); 
    }
  });
  
  const cities = uniq(NORM.map(r=>r.city));
  const cats   = uniq(NORM.map(r=>r.category));
  const types  = uniq(NORM.map(r=>r.employment_type));
  
  if(fCity) cities.forEach(v=> fCity.insertAdjacentHTML("beforeend", `<option value="${v}">${translate("city", v)}</option>`));
  if(fCat) cats.forEach(v  => fCat.insertAdjacentHTML("beforeend",  `<option value="${v}">${translate("category", v)}</option>`));
  if(fType) types.forEach(v => fType.insertAdjacentHTML("beforeend", `<option value="${v}">${translate("type", v)}</option>`));
};

// ---- render ----
let grid=null;
let lastFiltered = [];

const applyFilters = ()=>{
  const S = STRINGS[i18n.cur];
  const outCur = fCurrency ? fCurrency.value : "IQD";
  const city = fCity ? fCity.value : "";
  const cat = fCat ? fCat.value : "";
  const et = fType ? fType.value : "";
  const per = fPeriod ? (fPeriod.value || "") : "";
  
  const filtered = NORM.filter(r=> 
    (!city||r.city===city) && 
    (!cat||r.category===cat) && 
    (!et||r.employment_type===et) && 
    (!per||r.period===per)
  );
  
  lastFiltered = filtered;

  // stats arrays in chosen currency
  const vals=[], byCity={}, byCat={};
  
  filtered.forEach(r=>{
    const x=(r.amtMin ?? r.amtMax); 
    if(x==null) return;
    const v = outCur==="USD" ? toUSD(x, r.currency) : toIQD(x, r.currency);
    vals.push(v);
    
    if(!byCity[r.city]) byCity[r.city]=[];
    byCity[r.city].push(v);
    
    if(!byCat[r.category]) byCat[r.category]=[];
    byCat[r.category].push(v);
  });

  // KPIs
  const med = median(vals);
  const p25 = percentile(vals,25);
  const p75 = percentile(vals,75);
  
  const updateKPI = (id, text) => {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  };
  
  updateKPI("kpi-median", S.kpiMedian(numberFmt(med, outCur)));
  updateKPI("kpi-iqr", S.kpiIQR(numberFmt(p25, outCur), numberFmt(p75, outCur)));
  updateKPI("kpi-sample", S.kpiSample(vals.length));
  
  if(resultCount) resultCount.textContent = S.results(filtered.length);

  // Insights
  const insights = [];
  if(vals.length){
    const topCity = Object.entries(byCity).sort((a,b)=>median(b[1])-median(a[1]))[0];
    const topCat = Object.entries(byCat).sort((a,b)=>median(b[1])-median(a[1]))[0];
    if(topCity) insights.push(`Highest median city: ${translate("city",topCity[0])} (${numberFmt(median(topCity[1]), outCur)})`);
    if(topCat) insights.push(`Highest median category: ${translate("category",topCat[0])} (${numberFmt(median(topCat[1]), outCur)})`);
  }
  
  const insightList = document.getElementById("insight-list");
  if(insightList) {
    insightList.innerHTML = insights.length ? insights.map(i=>`<li>${i}</li>`).join("") : "<li>No data</li>";
  }

  // Legends
  const cityColors = uniq(filtered.map(r=>r.city)).map(c=>({label:translate("city",c), color:colorFromString(c)}));
  const catColors = uniq(filtered.map(r=>r.category)).map(c=>({label:translate("category",c), color:colorFromString(c)}));
  
  if(legendCityEl) {
    legendCityEl.innerHTML = cityColors.map(({label,color})=>
      `<span class="legend-chip"><span class="swatch" style="background:${color}"></span>${label}</span>`
    ).join("");
  }
  
  if(legendCatEl) {
    legendCatEl.innerHTML = catColors.map(({label,color})=>
      `<span class="legend-chip"><span class="swatch" style="background:${color}"></span>${label}</span>`
    ).join("");
  }

  // Table
  renderTable(filtered, outCur);
};

const renderTable = (rows, outCur)=>{
  const S = STRINGS[i18n.cur];
  const tableEl = document.getElementById("table");
  if(!tableEl) return;
  
  const data = rows.map(r=>{
    const amt = r.amtMin ?? r.amtMax;
    const display = amt ? numberFmt(outCur==="USD" ? toUSD(amt,r.currency) : toIQD(amt,r.currency), outCur) : "—";
    return [
      translate("category",r.category),
      r.title,
      translate("city",r.city),
      translate("type",r.employment_type),
      translate("period",r.period),
      display,
      r.last_verified,
      r.source_ref ? html(`<a href="${r.source_ref}" target="_blank">🔗</a>`) : "—"
    ];
  });

  if(grid) grid.destroy();
  
  grid = new Grid({
    columns: [
      S.cols.category,
      S.cols.title,
      S.cols.city,
      S.cols.type,
      S.cols.period,
      "Salary",
      S.cols.last,
      S.cols.source
    ],
    data,
    search: true,
    sort: true,
    pagination: { enabled: true, limit: 20 }
  }).render(tableEl);
};

// ---- Exports ----
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

if(exportCsvBtn) {
  exportCsvBtn.addEventListener("click", ()=>{
    const S = STRINGS[i18n.cur];
    const outCur = fCurrency ? fCurrency.value : "IQD";
    const header = [S.cols.category, S.cols.title, S.cols.city, S.cols.type, S.cols.period, "Salary", S.cols.last, S.cols.source].join(",");
    const rows = lastFiltered.map(r=>{
      const amt = r.amtMin ?? r.amtMax;
      const display = amt ? numberFmt(outCur==="USD" ? toUSD(amt,r.currency) : toIQD(amt,r.currency), outCur) : "—";
      return [
        `"${translate("category",r.category)}"`,
        `"${r.title}"`,
        `"${translate("city",r.city)}"`,
        `"${translate("type",r.employment_type)}"`,
        `"${translate("period",r.period)}"`,
        `"${display}"`,
        `"${r.last_verified}"`,
        `"${r.source_ref}"`
      ].join(",");
    });
    downloadFile([header, ...rows].join("\n"), "payscale-data.csv", "text/csv");
  });
}

if(exportJsonBtn) {
  exportJsonBtn.addEventListener("click", ()=>{
    downloadFile(JSON.stringify(lastFiltered.map(r=>r.raw), null, 2), "payscale-data.json", "application/json");
  });
}

if(resetBtn) {
  resetBtn.addEventListener("click", ()=>{
    if(fCity) fCity.value = "";
    if(fCat) fCat.value = "";
    if(fType) fType.value = "";
    if(fPeriod) fPeriod.value = "";
    if(fCurrency) fCurrency.value = "IQD";
    applyFilters();
  });
}

if(printBtn) {
  printBtn.addEventListener("click", ()=> window.print());
}

// Filter change listeners
[fCity, fCat, fType, fPeriod, fCurrency].forEach(el=>{
  if(el) el.addEventListener("change", applyFilters);
});

// Initialize
i18n.set(i18n.cur);
