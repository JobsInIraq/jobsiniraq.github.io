/**
 * Payscale Dashboard - YAML-Driven Translation System
 * Consumes translations from _data/ui-text.yml (via unified-i18n.js)
 * @version 3.0.0 - STABLE
 * @lastUpdated 2025-01-10
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
    currency = "I
