/**
 * Payscale Dashboard - Complete i18n with Async AI Job Title Translation
 * @version 5.0.0 - PRODUCTION READY WITH AI SUPPORT
 * @lastUpdated 2025-10-12
 */

// ============================================
// IMPORTS
// ============================================
import { Grid } from "https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.module.min.js";

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
// TRANSLATION SYSTEM (ENHANCED WITH AI)
// ============================================

const t = (key) => {
  const fullKey = `payscale.${key}`;
  const translated = window.i18n?.t(fullKey);
  if (!translated || translated === fullKey) {
    console.warn(`[i18n] Missing translation key: ${fullKey}`);
  }
  return translated || key;
};

const getCurrentLang = () => window.i18n?.currentLang || "en";

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
 * ✅ ENHANCED: Async Job Title Translation with AI Fallback
 * Now supports both YAML translations and AI translation
 */
const translateJobTitle = async (title) => {
  if (!title || title === "—") return title;
  
  // Check if i18n system is available
  if (!window.i18n || typeof window.i18n.translateJobTitle !== 'function') {
    console.warn('[Dashboard] i18n not available, using original title');
    return title;
  }
  
  try {
    // Use unified i18n system (supports YAML + AI fallback)
    const translated = await window.i18n.translateJobTitle(title);
    return translated || title;
  } catch (error) {
    console.error('[Dashboard] Translation failed:', error);
    return title; // Fallback to original
  }
};

/**
 * ✅ NEW: Batch translate all job titles (for performance)
 */
const translateJobTitlesBatch = async (titles) => {
  if (!titles || titles.length === 0) return [];
  
  try {
    // Translate all titles in parallel (FAST!)
    const translationPromises = titles.map(title => translateJobTitle(title));
    return await Promise.all(translationPromises);
  } catch (error) {
    console.error('[Dashboard] Batch translation failed:', error);
    return titles; // Return originals on error
  }
};

const th = (key) => {
  const fullKey = `table_headers.${key}`;
  const translated = window.i18n?.t(fullKey);
  return translated || key;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const FX = { USD_IQD: 1310 };

const toIQD = (amt, cur) => cur === "USD" ? Math.round(amt * FX.USD_IQD) : amt;
const toUSD = (amt, cur) => cur === "IQD" ? Math.round(amt / FX.USD_IQD) : amt;

const numberFmt = (n, cur) => {
  if (n == null || !Number.isFinite(n)) return "—";

  const lang = getCurrentLang();
  const locale = lang === 'ar' ? 'ar-IQ' : lang === 'ckb' ? 'en-US' : 'en-US';
  const formatted = n.toLocaleString(locale);
  const suffix = cur === "USD" ? " USD/mo" : " IQD/mo";

  return formatted + suffix;
};

const get = (obj, path, dflt = null) => {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : dflt), obj ?? dflt);
};

const parseNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;

  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "." || cleaned === "-") return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num) : null;
};

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
  const period = "monthly";
  const city = loc.city || "—";

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
let translatedTitlesCache = new Map(); // Cache translated titles

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
// UI UPDATE FUNCTIONS (ENHANCED WITH ASYNC)
// ============================================

const updateView = async () => {
  updateKPIs();
  await updateTable(); // Now async
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
// TABLE RENDERING (ASYNC WITH AI TRANSLATION)
// ============================================

let gridInstance = null;

/**
 * ✅ ENHANCED: Async table rendering with AI translation
 */
const updateTable = async () => {
  const tableEl = document.getElementById("table");
  if (!tableEl) return;

  // Show loading indicator
  if (!gridInstance) {
    tableEl.innerHTML = '<div style="padding:2rem;text-align:center;">⏳ Loading translations...</div>';
  }

  try {
    // Step 1: Extract unique job titles
    const uniqueTitles = [...new Set(filtered.map(row => row.title))];
    
    // Step 2: Translate all unique titles in parallel (FAST!)
    const lang = getCurrentLang();
    const cacheKey = `${lang}_titles`;
    
    // Check if already translated for this language
    if (!translatedTitlesCache.has(cacheKey)) {
      const translatedTitles = await translateJobTitlesBatch(uniqueTitles);
      
      // Build lookup map
      const titleMap = new Map();
      uniqueTitles.forEach((title, index) => {
        titleMap.set(title, translatedTitles[index]);
      });
      
      translatedTitlesCache.set(cacheKey, titleMap);
    }
    
    const titleMap = translatedTitlesCache.get(cacheKey);
    
    // Step 3: Build table data using translated titles
    const tableData = filtered.map(row => [
      titleMap.get(row.title) || row.title, // Use cached translation
      translateCategory(row.category),
      translateCity(row.city),
      translateType(row.employment_type),
      numberFmt(
        selectedCurrency === "USD" ? toUSD(row.amtMin, row.currency) : toIQD(row.amtMin, row.currency),
        selectedCurrency
      ),
      row.portal
    ]);

    // Step 4: Render or update Grid.js
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
  } catch (error) {
    console.error('[Dashboard] Table rendering failed:', error);
    
    // Fallback: render without translations
    const fallbackData = filtered.map(row => [
      row.title, // Original title
      row.category,
      row.city,
      row.employment_type,
      numberFmt(
        selectedCurrency === "USD" ? toUSD(row.amtMin, row.currency) : toIQD(row.amtMin, row.currency),
        selectedCurrency
      ),
      row.portal
    ]);
    
    if (gridInstance) {
      gridInstance.updateConfig({ data: fallbackData }).forceRender();
    } else {
      gridInstance = new Grid({
        columns: ['Job Title', 'Category', 'City', 'Type', 'Salary', 'Source'],
        data: fallbackData,
        search: true,
        sort: true,
        pagination: { limit: 25 }
      }).render(tableEl);
    }
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

  listEl.innerHTML = insights.map(ins => `<li>${ins}</li>`).join("");
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
      .map(city => {
        const color = colorFromString(city);
        const translated = translateCity(city);
        return `<span class="legend-item"><span class="dot" style="background:${color}"></span>${translated}</span>`;
      })
      .join("");
  }

  if (catLegendEl) {
    const cats = uniq(filtered.map(r => r.category));
    catLegendEl.innerHTML = cats
      .map(cat => {
        const color = colorFromString(cat);
        const translated = translateCategory(cat);
        return `<span class="legend-item"><span class="dot" style="background:${color}"></span>${translated}</span>`;
      })
      .join("");
  }
};

// ============================================
// FILTER UI INITIALIZATION
// ============================================

const populateFilters = () => {
  const cityEl = document.getElementById("f-city");
  const catEl = document.getElementById("f-category");
  const etypeEl = document.getElementById("f-etype");
  const periodEl = document.getElementById("f-period");

  if (cityEl) {
    setFirstOption(cityEl, t('all_cities'));
    const cities = uniq(NORMALIZED.map(r => r.city));
    cities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = translateCity(city);
      cityEl.appendChild(opt);
    });
  }

  if (catEl) {
    setFirstOption(catEl, t('all_categories'));
    const cats = uniq(NORMALIZED.map(r => r.category));
    cats.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = translateCategory(cat);
      catEl.appendChild(opt);
    });
  }

  if (etypeEl) {
    setFirstOption(etypeEl, t('all_types'));
    const types = uniq(NORMALIZED.map(r => r.employment_type));
    types.forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = translateType(type);
      etypeEl.appendChild(opt);
    });
  }

  if (periodEl) {
    setFirstOption(periodEl, t('all_periods'));
    const periods = uniq(NORMALIZED.map(r => r.period));
    periods.forEach(period => {
      const opt = document.createElement("option");
      opt.value = period;
      opt.textContent = translatePeriod(period);
      periodEl.appendChild(opt);
    });
  }
};

// ============================================
// CURRENCY TOGGLE
// ============================================

const initCurrencyToggle = () => {
  const currencyEl = document.getElementById("f-currency");
  if (!currencyEl) return;

  currencyEl.addEventListener("change", (e) => {
    selectedCurrency = e.target.value;
    updateView();
  });
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

const exportCSV = () => {
  const headers = [th('job_title'), th('category'), th('city'), th('employment_type'), th('salary'), th('source')];
  const rows = filtered.map(row => [
    row.title, // Original title for export
    row.category,
    row.city,
    row.employment_type,
    numberFmt(selectedCurrency === "USD" ? toUSD(row.amtMin, row.currency) : toIQD(row.amtMin, row.currency), selectedCurrency),
    row.portal
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `payscale_data_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

const exportJSON = () => {
  const jsonData = JSON.stringify(filtered, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `payscale_data_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
};

// ============================================
// PRINT FUNCTION
// ============================================

const printView = () => {
  window.print();
};

// ============================================
// EVENT LISTENERS
// ============================================

const initEventListeners = () => {
  document.getElementById("f-city")?.addEventListener("change", applyFilters);
  document.getElementById("f-category")?.addEventListener("change", applyFilters);
  document.getElementById("f-etype")?.addEventListener("change", applyFilters);
  document.getElementById("f-period")?.addEventListener("change", applyFilters);
  
  document.getElementById("resetFilters")?.addEventListener("click", () => {
    document.getElementById("f-city").value = "";
    document.getElementById("f-category").value = "";
    document.getElementById("f-etype").value = "";
    document.getElementById("f-period").value = "";
    applyFilters();
  });

  document.getElementById("exportCsv")?.addEventListener("click", exportCSV);
  document.getElementById("exportJson")?.addEventListener("click", exportJSON);
  document.getElementById("printBtn")?.addEventListener("click", printView);
  
  // ✅ NEW: Listen for language changes
  window.addEventListener('languageChanged', async (event) => {
    console.log('[Dashboard] Language changed to:', event.detail.language);
    
    // Clear translation cache for new language
    translatedTitlesCache.clear();
    
    // Re-populate filters with new translations
    populateFilters();
    
    // Re-render everything with new translations
    await updateView();
  });
};

// ============================================
// UI TRANSLATIONS
// ============================================

const translateUI = () => {
  const elements = {
    "t.title": t('title'),
    "t.theme": t('theme'),
    "t.caption": t('caption'),
    "t.reset": t('reset_filters'),
    "t.export": t('export_csv'),
    "t.exportJson": t('export_json'),
    "t.print": t('print'),
    "t.aiInsights": t('ai_insights'),
    "t.cityLegend": t('city_legend'),
    "t.categoryLegend": t('category_legend'),
    "t.tableTitle": t('table_title'),
    "t.tableCaption": t('table_caption')
  };

  Object.entries(elements).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
};

// ============================================
// INITIALIZATION (ASYNC)
// ============================================

/**
 * ✅ NEW: Wait for i18n system to be ready
 */
const waitForI18n = (timeout = 5000) => {
  return new Promise((resolve) => {
    if (window.i18n) {
      resolve();
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.i18n) {
        clearInterval(checkInterval);
        console.log('[Dashboard] i18n system ready');
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.warn('[Dashboard] i18n timeout - proceeding without full i18n support');
        resolve();
      }
    }, 100);
  });
};

/**
 * ✅ MAIN INITIALIZATION (Now async)
 */
const init = async () => {
  console.log('[Dashboard] Initializing...');
  
  // Wait for i18n to be ready
  await waitForI18n();
  
  // Initialize UI
  translateUI();
  populateFilters();
  initCurrencyToggle();
  initEventListeners();
  
  // Initial render (async)
  await updateView();
  
  console.log('[Dashboard] ✅ Initialization complete');
};

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
