// assets/js/payscale-dashboard.js
// ES module. Handles: theme toggle, i18n (EN/AR/CKB with RTL), label translations,
// stats, charts, table, insights, export CSV/JSON, print view, legends.

// ---- imports (pinned versions; safe updates later when you choose) ----
import "https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js";
import { Grid, html } from "https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.module.min.js";

// ---- read data injected by Jekyll at build time (no extra fetch) ----
const RAW = JSON.parse(document.getElementById("payscale-data").textContent || "{}"); // { jobs: [...] }

// ---- theme setup ----
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
root.setAttribute("data-theme", savedTheme);
document.getElementById("themeToggle").addEventListener("click", () => {
  const t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
});

// ---- languages & UI strings ----
const STRINGS = {
  en: {
    title:"Payscale Dashboard", caption:"Data source: _data/db/salaries.json. All salaries are monthly unless stated.",
    theme:"Theme", aiInsights:"AI Insights",
    histogram:"Salary Distribution (Histogram)", byCity:"Median by City", byCategory:"Median by Category",
    tableTitle:"Data Table", tableCaption:"Search, sort, and paginate. Rows are read as-is from _data/db/salaries.json.",
    kpiMedian:(v)=>`Median: ${v}`, kpiIQR:(a,b)=>`IQR (P25–P75): ${a} – ${b}`, kpiSample:(n)=>`Sample size: ${n}`,
    allCities:"All cities", allCats:"All categories", allTypes:"All types", allPeriods:"All periods",
    reset:"Reset filters", export:"Export CSV", exportJson:"Export JSON", print:"Print view",
    results:(n)=>`${n} result${n===1?'':'s'}`, cityLegend:"City legend", categoryLegend:"Category legend",
    cols:{ title:"Title", category:"Category", city:"City", type:"Type", period:"Period", min:"Min", max:"Max", last:"Last Verified", source:"Source" }
  },
  ar: {
    title:"لوحة الأجور", caption:"مصدر البيانات: _data/db/salaries.json. جميع الرواتب شهرية ما لم يُذكر غير ذلك.",
    theme:"الوضع", aiInsights:"رؤى ذكية",
    histogram:"توزيع الرواتب (مخطط أعمدة)", byCity:"الوسيط حسب المدينة", byCategory:"الوسيط حسب الفئة",
    tableTitle:"جدول البيانات", tableCaption:"بحث وفرز وتقسيم للصفحات. يتم قراءة الصفوف كما هي من _data/db/salaries.json.",
    kpiMedian:(v)=>`الوسيط: ${v}`, kpiIQR:(a,b)=>`المدى بين الرُبعين: ${a} – ${b}`, kpiSample:(n)=>`حجم العينة: ${n}`,
    allCities:"كل المدن", allCats:"كل الفئات", allTypes:"كل الأنواع", allPeriods:"كل الفترات",
    reset:"إعادة التصفية", export:"تصدير CSV", exportJson:"تصدير JSON", print:"عرض الطباعة",
    results:(n)=>`${n} نتيجة`, cityLegend:"دليل المدن", categoryLegend:"دليل الفئات",
    cols:{ title:"العنوان", category:"الفئة", city:"المدينة", type:"النوع", period:"الفترة", min:"الحد الأدنى", max:"الحد الأقصى", last:"آخر تحديث", source:"المصدر" }
  },
  ckb: {
    title:"داشبۆڕدی مووچەکان", caption:"سەرچاوەی داتا: _data/db/salaries.json. هەموو مووچەکان مانگانەن تا ئەگەر جیاواز نەکراوە.",
    theme:"دووخور/ڕوناکا", aiInsights:"ئاگادارییە هۆشیاڕانەکان",
    histogram:"دابەشبوونی مووچە (هیستۆگرام)", byCity:"ناوەندێتی بە شار", byCategory:"ناوەندێتی بە پۆل",
    tableTitle:"خشتەی داتا", tableCaption:"گەڕان، پۆلەکردن و لاپەڕەکردن. داتاکان وەک خۆیان لە _data/db/salaries.json خوێندراون.",
    kpiMedian:(v)=>`ناوەندێتی: ${v}`, kpiIQR:(a,b)=>`نێوان چوارەکی یەکەم و سێیەم: ${a} – ${b}`, kpiSample:(n)=>`قەبارەی نموونە: ${n}`,
    allCities:"هەموو شارەکان", allCats:"هەموو پۆلەکان", allTypes:"هەموو جۆرەکان", allPeriods:"هەموو ماوەکان",
    reset:"دووبارەکردنەوەی پاڵاوتن", export:"هەناردەی CSV", exportJson:"هەناردەی JSON", print:"چاپکردن",
    results:(n)=>`${n} دەرئەنجام`, cityLegend:"ڕێبەری شار", categoryLegend:"ڕێبەری پۆل",
    cols:{ title:"ناونیشان", category:"پۆل", city:"شار", type:"جۆر", period:"ماوە", min:"کەمترین", max:"زۆرترین", last:"دوا نوێکردنەوە", source:"سەرچاوە" }
  }
};
const LOCALE_MAP = { en: "en", ar: "ar", ckb: "ckb" };
const langPicker = document.getElementById("langPicker");
const i18n = {
  cur: localStorage.getItem("lang") || "en",
  set(l){
    this.cur = l; localStorage.setItem("lang", l);
    const rtl = l === "ar" || l === "ckb";
    document.getElementById("app-root").setAttribute("dir", rtl ? "rtl" : "ltr");
    const S = STRINGS[l];
    document.getElementById("t.title").textContent = S.title;
    document.getElementById("t.caption").textContent = S.caption;
    document.getElementById("t.theme").textContent = S.theme;
    document.getElementById("t.aiInsights").textContent = S.aiInsights;
    document.getElementById("t.histogram").textContent = S.histogram;
    document.getElementById("t.byCity").textContent = S.byCity;
    document.getElementById("t.byCategory").textContent = S.byCategory;
    document.getElementById("t.tableTitle").textContent = S.tableTitle;
    document.getElementById("t.tableCaption").textContent = S.tableCaption;
    document.getElementById("t.reset").textContent = S.reset;
    document.getElementById("t.export").textContent = S.export;
    document.getElementById("t.exportJson").textContent = S.exportJson;
    document.getElementById("t.print").textContent = S.print;
    document.getElementById("t.cityLegend").textContent = S.cityLegend;
    document.getElementById("t.categoryLegend").textContent = S.categoryLegend;
    setFirstOption(document.getElementById("f-city"), S.allCities);
    setFirstOption(document.getElementById("f-category"), S.allCats);
    setFirstOption(document.getElementById("f-etype"), S.allTypes);
    setFirstOption(document.getElementById("f-period"), S.allPeriods);
    populateFilters(); applyFilters();
  }
};
langPicker.value = i18n.cur;
langPicker.addEventListener("change", (e)=> i18n.set(e.target.value));
i18n.set(i18n.cur);

// ---- translation maps for data labels (display only) ----
const LABELS = {
  category: {
    en: { "IT":"IT", "Human Resources":"Human Resources", "Procurement":"Procurement", "Sales":"Sales", "Design":"Design" },
    ar: { "IT":"تقنية المعلومات", "Human Resources":"الموارد البشرية", "Procurement":"المشتريات", "Sales":"المبيعات", "Design":"التصميم" },
    ckb:{ "IT":"IT", "Human Resources":"سەرچاوەی مرۆیی", "Procurement":"کڕین", "Sales":"فرۆشتن", "Design":"دیزاین" }
  },
  type: {
    en: { "Full-Time":"Full-Time", "Part-Time":"Part-Time", "Contract":"Contract" },
    ar: { "Full-Time":"دوام كامل", "Part-Time":"دوام جزئي", "Contract":"عقد" },
    ckb:{ "Full-Time":"فૂલ‌تایم", "Part-Time":"پارت‌تایم", "Contract":"کۆنترکت" }
  },
  city: {
    en: { "Baghdad":"Baghdad", "Erbil":"Erbil", "Basra":"Basra", "Sulaymaniyah":"Sulaymaniyah", "Kirkuk":"Kirkuk", "Karbala":"Karbala" },
    ar: { "Baghdad":"بغداد", "Erbil":"أربيل", "Basra":"البصرة", "Sulaymaniyah":"السليمانية", "Kirkuk":"كركوك", "Karbala":"كربلاء" },
    ckb:{ "Baghdad":"بەغداد", "Erbil":"هەولێر", "Basra":"بەصرە", "Sulaymaniyah":"سلێمانی", "Kirkuk":"کەرکوک", "Karbala":"کەربەلا" }
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
const median = (a)=>{ if(!a.length) return null; const s=[...a].sort((x,y)=>x-y), m=Math.floor(s.length/2); return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2); };
const percentile = (a,p)=>{ if(!a.length) return null; const s=[...a].sort((x,y)=>x-y), i=(p/100)*(s.length-1), lo=Math.floor(i), hi=Math.ceil(i); return lo===hi?s[lo]:Math.round(s[lo]+(s[hi]-s[lo])*(i-lo)); };
const setFirstOption = (sel,text)=>{ if(sel && sel.options.length) sel.options[0].textContent=text; };
const uniq = (arr)=> [...new Set(arr.filter(Boolean))].sort((a,b)=> a.localeCompare(b,currentLocale()));
const translate = (domain, raw)=> (LABELS[domain]?.[i18n.cur] || {})[raw] || raw;

// consistent color from string
const hashCode = (str)=> {
  let h=0; for(let i=0;i<str.length;i++){ h = (h<<5)-h + str.charCodeAt(i); h |= 0; }
  return h;
};
const colorFromString = (str)=> {
  const h = Math.abs(hashCode(str)) % 360;
  return `hsl(${h}, 60%, 55%)`;
};

const makeHistogram = (vals, buckets=12)=>{
  if(!vals.length) return {labels:[], data:[]};
  const min=Math.min(...vals), max=Math.max(...vals), span=Math.max(1, Math.ceil((max-min)/buckets));
  const edges=Array.from({length:buckets},(_,i)=>min+i*span), counts=new Array(buckets).fill(0);
  vals.forEach(v=>{ let idx=Math.floor((v-min)/span); if(idx>=buckets) idx=buckets-1; counts[idx]++; });
  const labels=edges.map((e,i)=>`${e.toLocaleString(currentLocale())} – ${(i===buckets-1?max:e+span-1).toLocaleString(currentLocale())}`);
  return {labels, data:counts};
};

// ---- normalize your rows (non-destructive) ----
const INPUT = Array.isArray(RAW?.jobs) ? RAW.jobs : [];
const normalizeRow = (row)=>{
  const job = row.job||{}, jd=get(job,"jobDetails",{})||{}, sal=get(job,"salary",{})||{}, loc=get(job,"location",{})||{}, src=get(job,"sources",{})||{};
  const portal=get(src,"jobPortal",{})||{}, socials=get(src,"socialMedia",{})||{};
  const title = jd.jobTitle||"—";
  const category = jd.category||"—";
  const employment_type = (jd.position||"—").toString().replace(/0$/,""); // cleans stray trailing 0
  const period = "monthly"; // your data is monthly by convention
  const city = loc.city||"—";
  const iqd = parseNum(sal.iqd), usd = parseNum(sal.usd);
  let currency=null, amtMin=null, amtMax=null;
  if(iqd && (!usd||usd===0)){ currency="IQD"; amtMin=iqd; amtMax=iqd; }
  else if(usd && (!iqd||iqd===0)){ currency="USD"; amtMin=usd; amtMax=usd; }
  else if(iqd && usd){ currency="IQD"; amtMin=iqd; amtMax=iqd; }
  else { currency="IQD"; }
  const source_ref = portal.link || portal.site || socials.telegram || socials.facebook || socials.linkedin || socials.instagram || socials.tiktok || get(src,"website","") || "";
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

// ---- populate filters (values = raw data; labels localized) ----
const populateFilters = ()=>{
  [fCity,fCat,fType].forEach(sel=>{ while(sel.options.length>1) sel.remove(1); });
  const cities = uniq(NORM.map(r=>r.city));
  const cats   = uniq(NORM.map(r=>r.category));
  const types  = uniq(NORM.map(r=>r.employment_type));
  cities.forEach(v=> fCity.insertAdjacentHTML("beforeend", `<option value="${v}">${translate("city", v)}</option>`));
  cats.forEach(v  => fCat.insertAdjacentHTML("beforeend",  `<option value="${v}">${translate("category", v)}</option>`));
  types.forEach(v => fType.insertAdjacentHTML("beforeend", `<option value="${v}">${translate("type", v)}</option>`));
};

// ---- render (KPIs, insights, legends, charts, table) ----
let histChart=null, cityChart=null, catChart=null, grid=null;
let lastFiltered = []; // keep last filtered rows for exports

const applyFilters = ()=>{
  const S = STRINGS[i18n.cur];
  const outCur=fCurrency.value, city=fCity.value, cat=fCat.value, et=fType.value, per=fPeriod.value||"";
  const filtered = NORM.filter(r=> (!city||r.city===city) && (!cat||r.category===cat) && (!et||r.employment_type===et) && (!per||r.period===per) );
  lastFiltered = filtered;

  // stats arrays in chosen currency
  const vals=[], byCity={}, byCat={};
  filtered.forEach(r=>{
    const x=(r.amtMin ?? r.amtMax); if(x==null) return;
    const v = outCur==="USD" ? toUSD(x, r.currency) : toIQD(x, r.currency);
    if(v && v>0){ vals.push(v); (byCity[r.city] ||= []).push(v); (byCat[r.category] ||= []).push(v); }
  });

  const med=median(vals), p25=percentile(vals,25), p75=percentile(vals,75);
  document.getElementById("kpi-median").textContent = S.kpiMedian(numberFmt(med,outCur));
  document.getElementById("kpi-iqr").textContent    = S.kpiIQR(numberFmt(p25,outCur), numberFmt(p75,outCur));
  document.getElementById("kpi-sample").textContent = S.kpiSample(vals.length.toLocaleString(LOCALE_MAP[i18n.cur]||"en"));
  resultCount.textContent = S.results(filtered.length);

  // insights (rule-based)
  const insights=[];
  if(med!=null) insights.push(`${S.kpiMedian(numberFmt(med,outCur))}; ${S.kpiIQR(numberFmt(p25,outCur), numberFmt(p75,outCur))}.`);
  Object.entries(byCity).forEach(([k,arr])=>{
    if(!arr.length) return;
    const m=median(arr);
    if(m!=null && med!=null){
      const d=Math.round((m/med-1)*100);
      if(d>=12) insights.push(`${translate("city",k)} +${d}% vs. median.`);
      if(d<=-12) insights.push(`${translate("city",k)} −${Math.abs(d)}% vs. median.`);
    }
    const c25=percentile(arr,25), c75=percentile(arr,75);
    if(c25!=null && c75!=null && (c75-c25)/(m||1) > 0.6) insights.push(`${translate("city",k)}: wide variation.`);
  });
  Object.entries(byCat).forEach(([k,arr])=>{
    if(arr.length>=10){
      const m=median(arr);
      if(med && m && m>=med*1.2) insights.push(`${translate("category",k)} trending higher than average.`);
      if(med && m && m<=med*0.8) insights.push(`${translate("category",k)} trending lower than average.`);
    }
  });
  document.getElementById("insight-list").innerHTML = insights.slice(0,8).map(t=>`<li>${t}</li>`).join("") || "<li>—</li>";

  // legends (consistent colors from names)
  const cityLegendItems = Object.keys(byCity).sort((a,b)=> a.localeCompare(b, currentLocale()));
  const catLegendItems = Object.keys(byCat).sort((a,b)=> a.localeCompare(b, currentLocale()));
  legendCityEl.innerHTML = cityLegendItems.map(raw => {
    const label = translate("city", raw);
    const color = colorFromString(raw);
    return `<span class="legend-chip"><span class="swatch" style="background:${color}"></span>${label}</span>`;
  }).join("");
  legendCatEl.innerHTML = catLegendItems.map(raw => {
    const label = translate("category", raw);
    const color = colorFromString(raw);
    return `<span class="legend-chip"><span class="swatch" style="background:${color}"></span>${label}</span>`;
  }).join("");

  // charts
  const ChartLib = window.Chart;
  const hist=makeHistogram(vals);
  const cityEntries=Object.entries(byCity).map(([k,v])=>[translate("city",k), median(v), k]).sort((a,b)=>b[1]-a[1]).slice(0,12);
  const catEntries =Object.entries(byCat ).map(([k,v])=>[translate("category",k), median(v), k]).sort((a,b)=>b[1]-a[1]).slice(0,12);
  const mkBar=(id,labels,data,keys,title)=>{
    const ctx=document.getElementById(id).getContext("2d");
    const existing=(id==="chart-hist"?histChart:id==="chart-city"?cityChart:catChart); if(existing) existing.destroy();
    const colors = keys ? keys.map(k=>colorFromString(k)) : undefined;
    const chart=new ChartLib(ctx,{ type:"bar", data:{labels,datasets:[{label:title,data, backgroundColor: colors}]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:(c)=>numberFmt(c.parsed.y||c.parsed,outCur)}} },
        scales:{ x:{ ticks:{ color:getComputedStyle(document.documentElement).getPropertyValue("--fg") } },
                 y:{ ticks:{ callback:(v)=> outCur==="USD" ? v.toLocaleString(LOCALE_MAP[i18n.cur]||"en")+" USD" : v.toLocaleString(LOCALE_MAP[i18n.cur]||"en")+" IQD",
                            color:getComputedStyle(document.documentElement).getPropertyValue("--fg") } } }
      }});
    if(id==="chart-hist") histChart=chart; else if(id==="chart-city") cityChart=chart; else catChart=chart;
  };
  mkBar("chart-hist", hist.labels, hist.data, null, "Count");
  mkBar("chart-city", cityEntries.map(d=>d[0]), cityEntries.map(d=>d[1]), cityEntries.map(d=>d[2]), "Median");
  mkBar("chart-cat",  catEntries.map(d=>d[0]),  catEntries.map(d=>d[1]),  catEntries.map(d=>d[2]),  "Median");

  // table
  const cols = [
    { name: S.cols.title }, { name: S.cols.category }, { name: S.cols.city }, { name: S.cols.type },
    { name: S.cols.period }, { name: S.cols.min }, { name: S.cols.max }, { name: S.cols.last }, { name: S.cols.source }
  ];
  const rows = filtered.map(r=>{
    const minOut = r.amtMin!=null ? (outCur==="USD"? toUSD(r.amtMin,r.currency) : toIQD(r.amtMin,r.currency)) : null;
    const maxOut = r.amtMax!=null ? (outCur==="USD"? toUSD(r.amtMax,r.currency) : toIQD(r.amtMax,r.currency)) : null;
    return [
      r.title,
      translate("category", r.category),
      translate("city", r.city),
      translate("type", r.employment_type),
      (LABELS.period?.[i18n.cur]?.[r.period] || r.period),
      numberFmt(minOut,outCur),
      numberFmt(maxOut,outCur),
      r.last_verified || "—",
      r.source_ref ? html(`<a href="${r.source_ref}" target="_blank" rel="noopener">↗</a>`) : "—"
    ];
  });
  if(grid) grid.updateConfig({ columns: cols, data: rows }).forceRender();
  else {
    grid = new Grid({ columns: cols, data: rows, search:true, sort:true, pagination:{ limit:20 } })
           .render(document.getElementById("table"));
  }
};

// export CSV (filtered view)
function exportCSV(){
  const S = STRINGS[i18n.cur];
  const outCur=fCurrency.value;
  const header = [S.cols.title,S.cols.category,S.cols.city,S.cols.type,S.cols.period,S.cols.min,S.cols.max,S.cols.last,S.cols.source];
  const rows = lastFiltered.map(r=>{
    const minOut = r.amtMin!=null ? (outCur==="USD"? toUSD(r.amtMin,r.currency) : toIQD(r.amtMin,r.currency)) : null;
    const maxOut = r.amtMax!=null ? (outCur==="USD"? toUSD(r.amtMax,r.currency) : toIQD(r.amtMax,r.currency)) : null;
    const src = r.source_ref || "";
    return [
      r.title, translate("category", r.category), translate("city", r.city), translate("type", r.employment_type),
      (LABELS.period?.[i18n.cur]?.[r.period] || r.period),
      numberFmt(minOut,outCur), numberFmt(maxOut,outCur),
      r.last_verified || "", src
    ];
  });
  const csvRows = [header].concat(rows.map(r=> r.map(x=> `"${String(x).replace(/"/g,'""')}"`).join(",")));
  const blob = new Blob([csvRows.join("\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="payscale_filtered.csv"; a.click();
  URL.revokeObjectURL(url);
}

// export JSON (filtered view, raw normalized data with selected currency values included)
function exportJSON(){
  const outCur=fCurrency.value;
  const payload = lastFiltered.map(r=>{
    const minOut = r.amtMin!=null ? (outCur==="USD"? toUSD(r.amtMin,r.currency) : toIQD(r.amtMin,r.currency)) : null;
    const maxOut = r.amtMax!=null ? (outCur==="USD"? toUSD(r.amtMax,r.currency) : toIQD(r.amtMax,r.currency)) : null;
    return {
      title: r.title,
      category: r.category,
      city: r.city,
      employment_type: r.employment_type,
      period: r.period,
      currency_display: outCur,
      amount_min_display: minOut,
      amount_max_display: maxOut,
      last_verified: r.last_verified,
      source_ref: r.source_ref
    };
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="payscale_filtered.json"; a.click();
  URL.revokeObjectURL(url);
}

// print view
function printView(){ window.print(); }

// debounce filter changes
let t=null; const go=()=>{ clearTimeout(t); t=setTimeout(applyFilters, 60); };
["f-city","f-category","f-etype","f-period","f-currency"].forEach(id=>{
  const el=document.getElementById(id); if(el) el.addEventListener("change", go);
});

// wire buttons
exportCsvBtn.addEventListener("click", exportCSV);
exportJsonBtn.addEventListener("click", exportJSON);
printBtn.addEventListener("click", printView);

// reset filters
document.getElementById("resetFilters").addEventListener("click", ()=>{
  document.getElementById("f-city").value = "";
  document.getElementById("f-category").value = "";
  document.getElementById("f-etype").value = "";
  document.getElementById("f-period").value = "";
  document.getElementById("f-currency").value = "IQD";
  applyFilters();
});

// init
populateFilters();
applyFilters();
