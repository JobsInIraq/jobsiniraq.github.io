/**
 * Payscale Dashboard - YAML-Driven Translation System
 * Consumes translations from _data/ui-text.yml (via unified-i18n.js)
 * @version 3.1.1 - PERIOD TRANSLATION FIX
 * @lastUpdated 2025-10-11
 */

// ============================================
// IMPORTS
// ============================================
import { Grid } from "https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.module.min.js";

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
if (themeBtn) {
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
 */
const t = (key) => {
  const fullKey = `payscale.${key}`;
  const translated = window.i18n?.t(fullKey);

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
 * Table column headers
 */
const th = (key) => {
  const fullKey = `table_headers.${key}`;
  const translated = window.i18n?.t(fullKey);
  return translated || key;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Currency conversion rates
const FX = { USD_IQD: 1310 };

const toIQD = (amt, cur) => cur === "USD" ? Math.round(amt * FX.USD_IQD) : amt;
const toUSD = (amt, cur) => cur === "IQD" ? Math.round(amt / FX.USD_IQD) : amt;

/**
 * Number formatting with locale support
 */
const numberFmt = (n, cur) => {
  if (n == null || !Number.isFinite(n)) return "—";

  const lang = getCurrentLang();
  const locale = lang === 'ar' ? 'ar-IQ' : lang === 'ckb' ? 'en-US' : 'en-US';
  const formatted = n.toLocaleString(locale);
  const suffix = cur === "USD" ? " USD/mo" : " IQD/mo";

  return formatted + suffix;
};

/**
 * Deep object access
 */
const get = (obj, path, dflt = null) => {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : dflt), obj ?? dflt);
};

/**
 * Parse numeric value safely
 */
const parseNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;

  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "." || cleaned === "-") return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num) : null;
};

/**
 * Statistical functions
 */
const median = (arr) => {
  if (!arr || arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

const percentile = (arr, p) => {
  if (!arr || arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  return lower === upper
    ? sorted[lower]
    : Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower));
};

/**
 * DOM helpers
 */
const setFirstOption = (selectEl, text) => {
  if (selectEl && selectEl.options && selectEl.options.length) {
    selectEl.options[0].textContent = text;
  }
};

const uniq = (arr) => {
  const lang = getCurrentLang();
  const locale = lang === 'ar' ? 'ar-IQ' : lang === 'ckb' ? 'ku' : 'en-US';

  return [...new Set(arr.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, locale)
  );
};

/**
 * Color generation (consistent per string)
 */
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
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

  const title = jd.jobTitle || "—";
  const category = jd.category || "—";
  const employment_type = (jd.position || "—").toString().replace(/0$/, "");
  const period = "monthly"; // Default period
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
    currency = "IQD";
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

  const medianEl = document.getElementById("kpi-median");
  const iqrEl = document.getElementById("kpi-iqr");
  const sampleEl = document.getElementById("kpi-sample");
  const resultEl = document.getElementById("resultCount");

  if (medianEl) {
    medianEl.textContent = `${t('median_salary')}: ${numberFmt(med, selectedCurrency)}`;
  }
  if (iqrEl) {
    iqrEl.textContent = `IQR (P25–P75): ${numberFmt(p25, selectedCurrency)} – ${numberFmt(p75, selectedCurrency)}`;
  }
  if (sampleEl) {
    sampleEl.textContent = `${t('sample_size')}: ${values.length}`;
  }
  if (resultEl) {
    resultEl.textContent = `${filtered.length} ${t('results')}`;
  }
};

// ============================================
// TABLE RENDERING
// ============================================

let gridInstance = null;

const updateTable = () => {
  const tableEl = document.getElementById("table");
  if (!tableEl) return;

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
    gridInstance.updateConfig({
      columns: [
        th('job_title'),
        th('category'),
        th('city'),
        th('employment_type'),
        th('salary'),
        th('source')
      ],
      data: tableData,
      language: {
        search: { placeholder: t('search_placeholder') },
        pagination: {
          previous: t('previous'),
          next: t('next'),
          showing: t('showing'),
          to: t('to'),
          of: t('of'),
          results: t('results')
        }
      }
    }).forceRender();
  } else {
    gridInstance = new Grid({
      columns: [
        th('job_title'),
        th('category'),
        th('city'),
        th('employment_type'),
        th('salary'),
        th('source')
      ],
      data: tableData,
      search: true,
      sort: true,
      pagination: { limit: 25 },
      language: {
        search: { placeholder: t('search_placeholder') },
        pagination: {
          previous: t('previous'),
          next: t('next'),
          showing: t('showing'),
          to: t('to'),
          of: t('of'),
          results: t('results')
        }
      }
    }).render(tableEl);
  }
};

// ============================================
// INSIGHTS GENERATION
// ============================================

const updateInsights = () => {
  const listEl = document.getElementById("insight-list");
  if (!listEl) return;

  const values = filtered.map(r => toIQD(r.amtMin, r.currency)).filter(v => v > 0);

  if (values.length === 0) {
    listEl.innerHTML = `<li>${t('no_data')}</li>`;
    return;
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const insights = [];

  if (avg > 1500000) {
    insights.push(t('insight_high_avg'));
  } else if (avg < 800000) {
    insights.push(t('insight_low_avg'));
  }

  const itJobs = filtered.filter(r => r.category === "IT").length;
  if (itJobs > filtered.length * 0.3) {
    insights.push(t('insight_it_dominant'));
  }

  const baghdadJobs = filtered.filter(r => r.city === "Baghdad").length;
  if (baghdadJobs > filtered.length * 0.4) {
    insights.push(t('insight_baghdad_dominant'));
  }

  if (insights.length === 0) {
    insights.push(t('insight_balanced'));
  }

  listEl.innerHTML = insights.map(txt => `<li>${txt}</li>`).join("");
};

// ============================================
// LEGENDS
// ============================================

const updateLegends = () => {
  const cityLegendEl = document.getElementById("legend-city");
  const catLegendEl = document.getElementById("legend-cat");

  if (cityLegendEl) {
    const cities = uniq(filtered.map(r => r.city));
    cityLegendEl.innerHTML = cities
      .map(c => `<span class="legend-chip"><span class="swatch" style="background:${colorFromString(c)}"></span>${translateCity(c)}</span>`)
      .join("");
  }

  if (catLegendEl) {
    const cats = uniq(filtered.map(r => r.category));
    catLegendEl.innerHTML = cats
      .map(c => `<span class="legend-chip"><span class="swatch" style="background:${colorFromString(c)}"></span>${translateCategory(c)}</span>`)
      .join("");
  }
};

// ============================================
// FILTER POPULATION
// ============================================

const populateFilters = () => {
  const cities = uniq(NORMALIZED.map(r => r.city));
  const cats = uniq(NORMALIZED.map(r => r.category));
  const types = uniq(NORMALIZED.map(r => r.employment_type));
  const periods = uniq(NORMALIZED.map(r => r.period));

  const citySelect = document.getElementById("f-city");
  const catSelect = document.getElementById("f-category");
  const typeSelect = document.getElementById("f-etype");
  const periodSelect = document.getElementById("f-period");

  // Populate cities
  if (citySelect) {
    // Clear ALL options except the first one
    while (citySelect.options.length > 1) {
      citySelect.remove(1);
    }
    // Add translated city options
    cities.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = translateCity(c);
      citySelect.appendChild(opt);
    });
  }

  // Populate categories
  if (catSelect) {
    while (catSelect.options.length > 1) {
      catSelect.remove(1);
    }
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = translateCategory(c);
      catSelect.appendChild(opt);
    });
  }

  // Populate employment types
  if (typeSelect) {
    while (typeSelect.options.length > 1) {
      typeSelect.remove(1);
    }
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = translateType(t);
      typeSelect.appendChild(opt);
    });
  }

  // Populate salary periods ✅ FIXED
  if (periodSelect) {
    // ✅ CRITICAL FIX: Clear ALL options including hardcoded ones
    while (periodSelect.options.length > 1) {
      periodSelect.remove(1);
    }
    // Add translated period options
    periods.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = translatePeriod(p);
      periodSelect.appendChild(opt);
    });
  }
};

/**
 * Update filter labels when language changes
 */
const updateFilterLabels = () => {
  setFirstOption(document.getElementById("f-city"), t('all_cities'));
  setFirstOption(document.getElementById("f-category"), t('all_categories'));
  setFirstOption(document.getElementById("f-etype"), t('all_types'));
  setFirstOption(document.getElementById("f-period"), t('all_periods'));
};

// ============================================
// EVENT LISTENERS
// ============================================

const attachEventListeners = () => {
  // Filter changes
  document.querySelectorAll(".filters select").forEach(sel => {
    sel.addEventListener("change", applyFilters);
  });

  // Currency toggle
  const currencySelect = document.getElementById("f-currency");
  if (currencySelect) {
    currencySelect.addEventListener("change", (e) => {
      selectedCurrency = e.target.value;
      updateView();
    });
  }

  // Reset filters
  const resetBtn = document.getElementById("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.querySelectorAll(".filters select").forEach(sel => {
        sel.selectedIndex = 0;
      });
      applyFilters();
    });
  }

  // Export CSV
  const csvBtn = document.getElementById("exportCsv");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
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
  }

  // Export JSON
  const jsonBtn = document.getElementById("exportJson");
  if (jsonBtn) {
    jsonBtn.addEventListener("click", () => {
      const json = JSON.stringify(filtered, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payscale-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Print
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Language change listener ✅ COMPLETE FIX
  window.addEventListener("languageChanged", () => {
    console.log("[Dashboard] Language changed, updating UI...");
    updateFilterLabels();
    populateFilters(); // This will now properly replace ALL options
    updateView();
  });
};

// ============================================
// INITIALIZATION
// ============================================

const initDashboard = () => {
  if (!window.i18n) {
    console.warn("[Dashboard] i18n not ready, retrying in 100ms...");
    setTimeout(initDashboard, 100);
    return;
  }

  console.log("[Dashboard] Initializing with", NORMALIZED.length, "salary records");

  // Initialize UI
  updateFilterLabels();
  populateFilters();
  updateView();
  attachEventListeners();

  console.log("[Dashboard] ✅ Loaded successfully");
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
