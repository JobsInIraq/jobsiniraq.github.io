// assets/js/payscale-dashboard.js
// ES module. Handles: theme toggle, label translations,
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

// ---- Use global i18n system ----
const t = (key) => window.i18n?.t(`dashboard.${key}`) || key;
const getCurrentLang = () => window.i18n?.currentLang || "en";

// Translation helpers using global system
const translateCategory = (cat) => window.translateCategory?.(cat) || cat;
const translateCity = (city) => window.translateCity?.(city) || city;
const translateType = (type) => window.translateType?.(type) || type;
const translatePeriod = (period) => window.translatePeriod?.(period) || period;

const translate = (domain, raw) => {
  if (domain === 'category') return translateCategory(raw);
  if (domain === 'city') return translateCity(raw);
  if (domain === 'type') return translateType(raw);
  if (domain === 'period') return translatePeriod(raw);
  return raw;
};

// ---- helpers ----
const FX = { USD_IQD: 1310 };
const currentLocale = () => getCurrentLang();
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
  
  // Update filter labels
  setFirstOption(fCity, t('allCities'));
  setFirstOption(fCat, t('allCategories'));
  setFirstOption(fType, t('allTypes'));
  setFirstOption(fPeriod, t('allPeriods'));
};

// ---- render ----
let grid=null;
let lastFiltered = [];

const applyFilters = ()=>{
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
  
  updateKPI("kpi-median", `${t('median')}: ${numberFmt(med, outCur)}`);
  updateKPI("kpi-iqr", `${t('iqr')}: ${numberFmt(p25, outCur)} – ${numberFmt(p75, outCur)}`);
  updateKPI("kpi-sample", `${t('sampleSize')}: ${vals.length}`);
  
  if(resultCount) resultCount.textContent = `${filtered.length} ${t('results')}`;

  // Insights
  const insights = [];
  if(vals.length){
    const topCity = Object.entries(byCity).sort((a,b)=>median(b[1])-median(a[1]))[0];
    const topCat = Object.entries(byCat).sort((a,b)=>median(b[1])-median(a[1]))[0];
    if(topCity) insights.push(`${t('highestCity')}: ${translate("city",topCity[0])} (${numberFmt(median(topCity[1]), outCur)})`);
    if(topCat) insights.push(`${t('highestCategory')}: ${translate("category",topCat[0])} (${numberFmt(median(topCat[1]), outCur)})`);
  }
  
  const insightList = document.getElementById("insight-list");
  if(insightList) {
    insightList.innerHTML = insights.length ? insights.map(i=>`<li>${i}</li>`).join("") : `<li>${t('noData')}</li>`;
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
      t('colCategory'),
      t('colTitle'),
      t('colCity'),
      t('colType'),
      t('colPeriod'),
      t('colSalary'),
      t('colLastVerified'),
      t('colSource')
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
    const outCur = fCurrency ? fCurrency.value : "IQD";
    const header = [t('colCategory'), t('colTitle'), t('colCity'), t('colType'), t('colPeriod'), t('colSalary'), t('colLastVerified'), t('colSource')].join(",");
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

// Listen for global language changes
window.addEventListener('languageChanged', () => {
  populateFilters();
  applyFilters();
});

// Initialize on load
populateFilters();
applyFilters();
