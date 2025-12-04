/** 
 * Payscale Dashboard - Complete & Stable Build 
 * @version 4.2.1 – FINAL RELEASE
 */

// ============================================
// IMPORTS
// ============================================
import { Grid } from "/assets/vendor/gridjs/gridjs.module.min.js";

// ============================================
// WAIT FOR I18N
// ============================================
const waitForI18n = () => {
  return new Promise((resolve) => {
    if (window.i18n) return resolve();

    const maxAttempts = 50;
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;

      if (window.i18n) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};

// ============================================
// DATA LOADING (SAFE)
// ============================================
const dataEl = document.getElementById("payscale-data");
let RAW = {};

try {
  RAW = dataEl ? JSON.parse(dataEl.textContent || "{}") : {};
} catch (e) {
  console.error("❌ JSON parse failed:", e);
  RAW = { jobs: [] };
}

console.log("Jobs loaded:", RAW?.jobs?.length || 0);

// ============================================
// THEME
// ============================================
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
root.setAttribute("data-theme", savedTheme);

document.getElementById("themeToggle")?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// ============================================
// TRANSLATION HELPERS
// ============================================
const t = (key) => {
  if (!window.i18n) return key;
  const full = `payscale.${key}`;
  const out = window.i18n.t(full);
  return out && out !== full ? out : key;
};

const getCurrentLang = () => window.i18n?.currentLang || "en";
const translateCategory = (v) => window.i18n?.t(`job_categories.${v}`) || v;
const translateCity = (v) => window.i18n?.t(`cities.${v}`) || v;
const translateType = (v) => window.i18n?.t(`employment_types.${v}`) || v;
const translatePeriod = (v) => window.i18n?.t(`salary_periods.${v}`) || v;

const translateJobTitle = (title) => {
  if (!window.i18n?.translateJobTitle) return title;
  return window.i18n.translateJobTitle(title);
};

const th = (key) => window.i18n?.t(`table_headers.${key}`) || key;

// ============================================
// UTILITIES
// ============================================
const FX = { USD_IQD: 1310 };
const toIQD = (n, cur) => cur === "USD" ? Math.round(n * FX.USD_IQD) : n;
const toUSD = (n, cur) => cur === "IQD" ? Math.round(n / FX.USD_IQD) : n;

const numberFmt = (n, cur) => {
  if (n == null || !Number.isFinite(n)) return "—";
  const lang = getCurrentLang();
  const loc = lang === "ar" ? "ar-IQ" : "en-US";
  const suffix = cur === "USD" ? " USD/mo" : " IQD/mo";
  return n.toLocaleString(loc) + suffix;
};

const get = (o, p, d = null) => p.split(".").reduce((a, k) => (a && k in a ? a[k] : d), o);
const parseNum = (v) => {
  if (!v) return null;
  const clean = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n) : null;
};

const median = (arr) => {
  if (!arr?.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const percentile = (arr, p) => {
  if (!arr?.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const i = (p / 100) * (s.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return lo === hi ? s[lo] : Math.round(s[lo] + (s[hi] - s[lo]) * (i - lo));
};

const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();

// ============================================
// NORMALIZATION
// ============================================
const INPUT = Array.isArray(RAW?.jobs) ? RAW.jobs : [];

const normalizeRow = (row) => {
  const job = row.job || {};
  const jd = get(job, "jobDetails", {});
  const sal = get(job, "salary", {});
  const loc = get(job, "location", {});
  const src = get(job, "sources", {});
  const portal = get(src, "jobPortal", {});

  const title = jd.jobTitle || "—";
  const cat = jd.category || "—";
  const employment = (jd.position || "—").toString().replace(/0$/, "");
  const period = "monthly";
  const city = loc.city || "—";

  const iqd = parseNum(sal.iqd);
  const usd = parseNum(sal.usd);

  let currency, min, max;
  if (iqd) {
    currency = "IQD";
    min = max = iqd;
  } else if (usd) {
    currency = "USD";
    min = max = usd;
  } else {
    currency = "IQD";
    min = max = 0;
  }

  return {
    id: row.jobID || "—",
    title,
    category: cat,
    employment_type: employment,
    period,
    city,
    currency,
    amtMin: min,
    amtMax: max,
    portal: portal.site || "—",
    link: portal.link || "",
    raw: row
  };
};

const NORMALIZED = INPUT.map(normalizeRow);

// ============================================
// STATE
// ============================================
let filtered = [...NORMALIZED];
let selectedCurrency = "IQD";

// ============================================
// KPI UPDATE
// ============================================
const updateKPIs = () => {
  const values = filtered
    .map((r) => selectedCurrency === "USD" ? toUSD(r.amtMin, r.currency) : toIQD(r.amtMin, r.currency))
    .filter((v) => v > 0);

  const med = median(values);
  const p25 = percentile(values, 25);
  const p75 = percentile(values, 75);

  document.getElementById("kpi-median").textContent =
    `${t("median_salary")}: ${numberFmt(med, selectedCurrency)}`;

  document.getElementById("kpi-iqr").textContent =
    `IQR (P25–P75): ${numberFmt(p25, selectedCurrency)} – ${numberFmt(p75, selectedCurrency)}`;

  document.getElementById("kpi-sample").textContent =
    `${t("sample_size")}: ${values.length}`;

  document.getElementById("resultCount").textContent =
    `${filtered.length} ${t("results")}`;
};

// ============================================
// TABLE RENDER
// ============================================
let gridInstance = null;

const updateTable = () => {
  const tableEl = document.getElementById("table");
  if (!tableEl) return;

  const rows = filtered.map((r) => [
    translateJobTitle(r.title),
    translateCategory(r.category),
    translateCity(r.city),
    translateType(r.employment_type),
    numberFmt(
      selectedCurrency === "USD" ? toUSD(r.amtMin, r.currency) : toIQD(r.amtMin, r.currency),
      selectedCurrency
    ),
    r.portal
  ]);

  const config = {
    columns: [
      th("job_title"),
      th("category"),
      th("city"),
      th("employment_type"),
      th("salary"),
      th("source")
    ],
    data: rows,
    search: true,
    sort: true,
    pagination: { limit: 25 },
    language: {
      search: { placeholder: t("search_placeholder") },
      pagination: {
        previous: t("previous"),
        next: t("next"),
        showing: t("showing"),
        to: t("to"),
        of: t("of"),
        results: t("results")
      }
    }
  };

  if (gridInstance) {
    gridInstance.updateConfig(config).forceRender();
  } else {
    gridInstance = new Grid(config).render(tableEl);
  }
};

// ============================================
// INSIGHTS
// ============================================
const updateInsights = () => {
  const el = document.getElementById("insight-list");
  if (!el) return;

  const values = filtered
    .map((r) => toIQD(r.amtMin, r.currency))
    .filter((n) => n > 0);

  if (!values.length) {
    el.innerHTML = `<li>${t("no_data")}</li>`;
    return;
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const insights = [];

  if (avg > 1500000) insights.push(t("insight_high_avg"));
  else if (avg < 800000) insights.push(t("insight_low_avg"));

  if (filtered.filter((r) => r.category === "IT").length > filtered.length * 0.3)
    insights.push(t("insight_it_dominant"));

  if (filtered.filter((r) => r.city === "Baghdad").length > filtered.length * 0.4)
    insights.push(t("insight_baghdad_dominant"));

  if (!insights.length) insights.push(t("insight_balanced"));

  el.innerHTML = insights.map((i) => `<li>${i}</li>`).join("");
};

// ============================================
// LEGENDS
// ============================================
const updateLegends = () => {
  const cityEl = document.getElementById("legend-city");
  const catEl = document.getElementById("legend-cat");

  if (cityEl) {
    cityEl.innerHTML = uniq(filtered.map((r) => r.city))
      .map((c) => `<span class="legend-item"><span class="dot"></span>${translateCity(c)}</span>`)
      .join("");
  }

  if (catEl) {
    catEl.innerHTML = uniq(filtered.map((r) => r.category))
      .map((c) => `<span class="legend-item"><span class="dot"></span>${translateCategory(c)}</span>`)
      .join("");
  }
};

// ============================================
// FILTERS
// ============================================
const applyFilters = () => {
  const city = document.getElementById("f-city")?.value || "";
  const cat = document.getElementById("f-category")?.value || "";
  const type = document.getElementById("f-etype")?.value || "";
  const period = document.getElementById("f-period")?.value || "";

  filtered = NORMALIZED.filter((r) => {
    if (city && r.city !== city) return false;
    if (cat && r.category !== cat) return false;
    if (type && r.employment_type !== type) return false;
    if (period && r.period !== period) return false;
    return true;
  });

  updateView();
};

const populateFilters = () => {
  const cityEl = document.getElementById("f-city");
  const catEl = document.getElementById("f-category");

  if (cityEl) {
    cityEl.innerHTML = `<option value="">${t("all_cities")}</option>`;
    uniq(NORMALIZED.map((r) => r.city)).forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = translateCity(c);
      cityEl.appendChild(o);
    });
  }

  if (catEl) {
    catEl.innerHTML = `<option value="">${t("all_categories")}</option>`;
    uniq(NORMALIZED.map((r) => r.category)).forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = translateCategory(c);
      catEl.appendChild(o);
    });
  }
};

// ============================================
// CURRENCY TOGGLE
// ============================================
document.getElementById("f-currency")?.addEventListener("change", (e) => {
  selectedCurrency = e.tar
