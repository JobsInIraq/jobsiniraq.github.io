/**
 * Payscale Dashboard - YAML-Driven Translation System
 * Consumes translations from _data/ui-text.yml (via unified-i18n.js)
 * @version 3.0.1 - COMPLETE & FIXED
 * @lastUpdated 2025-10-11
 */

// ============================================
// IMPORTS
// ============================================
import { Grid, html } from "https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.module.min.js";

// Add Grid.js CSS dynamically
const gridCSS = document.createElement('link');
gridCSS.rel = 'stylesheet';
gridCSS.href = 'https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/theme/mermaid.min.css';
document.head.appendChild(gridCSS);

// ============================================
// DATA LOADING
// ============================================
const dataEl = document.getElementById("payscale-data");
const RAW = dataEl ? JSON.parse(dataEl.textContent || "{}") : {};

// ============================================
// THEME MANAGEMENT
// ============================================
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
root.setAttribute("data-theme", savedTheme);

const themeBtn = document.getElementById("themeToggle");
if(themeBtn) {
  themeBtn.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// ============================================
// TRANSLATION SYSTEM (YAML-DRIVEN)
// ============================================

/**
 * Translation helper - Uses YAML paths from ui-text.yml
 * Format: payscale.{key} (e.g., payscale.title, payscale.median_salary)
 */
const t = (key) => {
  const fullKey = `payscale.${key}`;
  const translated = window.i18n?.t(fullKey);

  // Debug in development
  if (!translated || translated === fullKey) {
    console.warn(`[i18n] Missing translation key: ${fullKey}`);
  }

  return translated || key;
};

/**
 * Get current language code
 */
const getCurrentLang = () => window.i18n?.currentLang || "en";

/**
 * Translation helpers using YAML structure
 * Maps to: job_categories.{key}, cities.{key}, employment_types.{key}, salary_periods.{key}
 */
const translateCategory = (cat) => {
  if (!cat || cat === "—") return cat;
  const translated = window.i18n?.t(`job_categories.${cat}`);
  return translated || cat;
};

const translateCity = (city) => {
  if (!city || city === "—") return city;
  const translated = window.i18n?.t(`cities.${city}`);
  return translated || city;
};

const translateType = (type) => {
  if (!type || type === "—") return type;
  const translated = window.i18n?.t(`employment_types.${type}`);
  return translated || type;
};

const translatePeriod = (period) => {
  if (!period || period === "—") return period;
  const translated = window.i18n?.t(`salary_periods.${period}`);
  return translated || period;
};

/**
 * Table column headers - Uses table_headers.{key} from YAML
 */
const th = (key) => {
  const fullKey = `table_headers.${key}`;
  const translated = window.i18n?.t(fullKey);
  return translated || key;
};

/**
 * Generic translation dispatcher
 */
const translate = (domain, raw) => {
  if (!raw || raw === "—") return raw;

  switch(domain) {
    case 'category':
      return translateCategory(raw);
    case 'city':
      return translateCity(raw);
    case 'type':
      return translateType(raw);
    case 'period':
      return translatePeriod(raw);
    default:
      return raw;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Currency conversion
const FX = { USD_IQD: 1310 };

const toIQD = (amt, cur) => cur === "USD" ? Math.round(amt * FX.USD_IQD) : amt;
const toUSD = (amt, cur) => cur === "IQD" ? Math.round(amt / FX.USD_IQD) : amt;

// Number formatting with locale support
const currentLocale = () => getCurrentLang();

const numberFmt = (n, cur) => {
  if (n == null) return "—";

  const formatted = n.toLocaleString(currentLocale());
  const suffix = cur === "USD" ? " USD/mo" : " IQD/mo";

  return formatted + suffix;
};

// Deep object access
const get = (obj, path, dflt = null) => {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : dflt), obj ?? dflt);
};

// Parse numeric value
const parseNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;

  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "." || cleaned === "-") return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num) : null;
};

// Statistical functions
const median = (arr) => {
  if (!arr.length) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

const percentile = (arr, p) => {
  if (!arr.length) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  return lower === upper
    ? sorted[lower]
    : Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower));
};

// DOM helpers
const setFirstOption = (selectEl, text) => {
  if (selectEl && selectEl.options.length) {
    selectEl.options[0].textContent = text;
  }
};

const uniq = (arr) => {
  return [...new Set(arr.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, currentLocale())
  );
};

// Color generation (consistent per string)
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
};

const colorFromString = (str) => {
  const hue = Math.abs(hashCode(str)) % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

// ============================================
// DATA NORMALIZATION
// ============================================

const INPUT = Array.isArray(RAW?.jobs) ? RAW.jobs : [];

const normalizeRow = (row) => {
  const job = row.job || {};
  const jd = get(job, "jobDetails", {}) || {};
  const sal = get(job, "salary", {}) || {};
  const loc = get(job, "location", {}) || {};
  const src = get(job, "sources", {}) || {};
  const portal = get(src, "jobPortal", {}) || {};
  const socials = get(src, "socialMedia", {}) || {};

  const title = jd.jobTitle || "—";
  const category = jd.category || "—";
  const employment_type = (jd.position || "—").toString().replace(/0$/, "");
  const period = "monthly";
  const city = loc.city || "—";

  // Salary parsing
  const iqd = parseNum(sal.iqd);
  const usd = parseNum(sal.usd);
  let currency = null;
  let amtMin = null;
  let amtMax = null;

  if (iqd && (!usd || usd === 0)) {
    currency = "IQD";
    amtMin = iqd;
    amtMax = iqd;
  } else if (usd && (!iqd || iqd === 0)) {
    currency = "USD";
    amtMin = usd;
    amtMax = usd;
  } else if (iqd && usd) {
    currency = "IQD";
    amtMin = iqd;
    amtMax = iqd;
  } else {
    currency = "IQD"; // Default fallback
    amtMin = 0;
    amtMax = 0;
  }

  return {
    id: row.jobID || "—",
    title,
    category,
    employment_type,
    period,
    city,
    currency,
    amtMin,
    amtMax,
    portal: portal.site || "—",
    link: portal.link || "",
    raw: row
  };
};

const NORMALIZED = INPUT.map(normalizeRow);

// ============================================
// FILTER & STATE MANAGEMENT
// ============================================

let filtered = [...NORMALIZED];
let selectedCurrency = "IQD";

const applyFilters = () => {
  const cityVal = document.getElementById("f-city")?.value || "";
  const catVal = document.getElementById("f-category")?.value || "";
  const typeVal = document.getElementById("f-etype")?.value || "";
  const periodVal = document.getElementById("f-period")?.value || "";

  filtered = NORMALIZED.filter(row => {
    if (cityVal && row.city !== cityVal) return false;
    if (catVal && row.category !== catVal) return false;
    if (typeVal && row.employment_type !== typeVal) return false;
    if (periodVal && row.period !== periodVal) return false;
    return true;
  });

  updateView();
};

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

const updateView = () => {
  updateKPIs();
  updateTable();
  updateInsights();
  updateLegends();
};

const updateKPIs = () => {
  const values = filtered
    .map(r => selectedCurrency === "USD" ? toUSD(r.amtMin, r.currency) : toIQD(r.amtMin, r.currency))
    .filter(v => v > 0);

  const med = median(values);
  const p25 = percentile(values, 25);
  const p75 = percentile(values, 75);

  document.getElementById("kpi-median").textContent = 
    `${t('median_salary') || 'Median'}: ${numberFmt(med, selectedCurrency)}`;
  document.getElementById("kpi-iqr").textContent = 
    `IQR (P25–P75): ${numberFmt(p25, selectedCurrency)} – ${numberFmt(p75, selectedCurrency)}`;
  document.getElementById("kpi-sample").textContent = 
    `${t('sample_size') || 'Sample size'}: ${values.length}`;
  document.getElementById("resultCount").textContent = 
    `${filtered.length} ${t('results') || 'results'}`;
};

// ============================================
// TABLE RENDERING
// ============================================

let gridInstance = null;

const updateTable = () => {
  const tableData = filtered.map(row => [
    row.title,
    translateCategory(row.category),
    translateCity(row.city),
    translateType(row.employment_type),
    numberFmt(
      selectedCurrency === "USD" ? toUSD(row.amtMin, row.currency) : toIQD(row.amtMin, row.currency),
      selectedCurrency
    ),
    row.portal
  ]);

  if (gridInstance) {
    gridInstance.updateConfig({ data: tableData }).forceRender();
  } else {
    gridInstance = new Grid({
      columns: [
        th('job_title') || 'Job Title',
        th('category') || 'Category',
        th('city') || 'City',
        th('employment_type') || 'Type',
        th('salary') || 'Salary',
        th('source') || 'Source'
      ],
      data: tableData,
      search: true,
      sort: true,
      pagination: { limit: 25 },
      language: {
        search: { placeholder: t('search_placeholder') || 'Search...' },
        pagination: {
          previous: t('previous') || 'Previous',
          next: t('next') || 'Next',
          showing: t('showing') || 'Showing',
          to: t('to') || 'to',
          of: t('of') || 'of',
          results: t('results') || 'results'
        }
      }
    }).render(document.getElementById("table"));
  }
};

// ============================================
// INSIGHTS GENERATION
// ============================================

const updateInsights = () => {
  const values = filtered.map(r => toIQD(r.amtMin, r.currency)).filter(v => v > 0);
  
  if (values.length === 0) {
    document.getElementById("insight-list").innerHTML = '<li>No data available for insights</li>';
    return;
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  const insights = [];
  
  if (avg > 1500000) {
    insights.push(t('insight_high_avg') || 'Average salary is above 1.5M IQD');
  } else if (avg < 800000) {
    insights.push(t('insight_low_avg') || 'Average salary is below 800K IQD');
  }
  
  const itJobs = filtered.filter(r => r.category === "IT").length;
  if (itJobs > filtered.length * 0.3) {
    insights.push(t('insight_it_dominant') || 'IT jobs dominate this dataset (>30%)');
  }

  const baghdadJobs = filtered.filter(r => r.city === "Baghdad").length;
  if (baghdadJobs > filtered.length * 0.4) {
    insights.push(t('insight_baghdad_dominant') || 'Baghdad has the most job listings (>40%)');
  }

  if (insights.length === 0) {
    insights.push(t('insight_balanced') || 'Dataset shows balanced distribution across categories and cities');
  }

  const list = document.getElementById("insight-list");
  list.innerHTML = insights.map(txt => `<li>${txt}</li>`).join("");
};

// ============================================
// LEGENDS
// ============================================

const updateLegends = () => {
  const cities = uniq(filtered.map(r => r.city));
  const cats = uniq(filtered.map(r => r.category));

  document.getElementById("legend-city").innerHTML = cities
    .map(c => `<span class="legend-chip"><span class="swatch" style="background:${colorFromString(c)}"></span>${translateCity(c)}</span>`)
    .join("");

  document.getElementById("legend-cat").innerHTML = cats
    .map(c => `<span class="legend-chip"><span class="swatch" style="background:${colorFromString(c)}"></span>${translateCategory(c)}</span>`)
    .join("");
};

// ============================================
// FILTER POPULATION
// ============================================

const populateFilters = () => {
  const cities = uniq(NORMALIZED.map(r => r.city));
  const cats = uniq(NORMALIZED.map(r => r.category));
  const types = uniq(NORMALIZED.map(r => r.employment_type));

  const citySelect = document.getElementById("f-city");
  const catSelect = document.getElementById("f-category");
  const typeSelect = document.getElementById("f-etype");

  // Clear existing options (except first)
  if (citySelect) {
    while (citySelect.options.length > 1) citySelect.remove(1);
    cities.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = translateCity(c);
      citySelect.appendChild(opt);
    });
  }

  if (catSelect) {
    while (catSelect.options.length > 1) catSelect.remove(1);
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = translateCategory(c);
      catSelect.appendChild(opt);
    });
  }

  if (typeSelect) {
    while (typeSelect.options.length > 1) typeSelect.remove(1);
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = translateType(t);
      typeSelect.appendChild(opt);
    });
  }
};

// ============================================
// EVENT LISTENERS
// ============================================

// Filter changes
document.querySelectorAll(".filters select").forEach(sel => {
  sel.addEventListener("change", applyFilters);
});

// Currency toggle
document.getElementById("f-currency")?.addEventListener("change", (e) => {
  selectedCurrency = e.target.value;
  updateView();
});

// Reset filters
document.getElementById("resetFilters")?.addEventListener("click", () => {
  document.querySelectorAll(".filters select").forEach(sel => {
    sel.selectedIndex = 0;
  });
  applyFilters();
});

// Export CSV
document.getElementById("exportCsv")?.addEventListener("click", () => {
  const csv = [
    ["Title", "Category", "City", "Type", "Salary", "Source"].join(","),
    ...filtered.map(r => [
      `"${r.title}"`,
      `"${r.category}"`,
      `"${r.city}"`,
      `"${r.employment_type}"`,
      `"${r.amtMin} ${r.currency}"`,
      `"${r.portal}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payscale-data-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Export JSON
document.getElementById("exportJson")?.addEventListener("click", () => {
  const json = JSON.stringify(filtered, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payscale-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Print
document.getElementById("printBtn")?.addEventListener("click", () => {
  window.print();
});

// Language change listener
window.addEventListener("languageChanged", () => {
  // Update all translations
  setFirstOption(document.getElementById("f-city"), t('all_cities') || 'All cities');
  setFirstOption(document.getElementById("f-category"), t('all_categories') || 'All categories');
  setFirstOption(document.getElementById("f-etype"), t('all_types') || 'All types');
  setFirstOption(document.getElementById("f-period"), t('all_periods') || 'All periods');
  
  populateFilters();
  updateView();
});

// ============================================
// INITIALIZATION
// ============================================

// Wait for i18n to be ready
const initDashboard = () => {
  if (!window.i18n) {
    console.warn("[Dashboard] i18n not ready, retrying in 100ms...");
    setTimeout(initDashboard, 100);
    return;
  }

  console.log("[Dashboard] Initializing with", NORMALIZED.length, "salary records");
  
  populateFilters();
  updateView();

  console.log("[Dashboard] ✅ Loaded successfully");
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
