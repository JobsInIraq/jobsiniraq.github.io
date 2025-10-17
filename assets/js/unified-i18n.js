/**
 * Unified I18n System for JobsInIraq
 * Simple YAML-only translation system
 * @version 4.2.0 - PRODUCTION READY (YAML ONLY)
 * @lastUpdated 2025-10-12
 */

(function() {
  'use strict';

  const TRANSLATIONS = window.SITE_TRANSLATIONS || {};
  const JOB_TITLES = window.JOB_TITLES_TRANSLATIONS || {};
  const CONFIG = window.I18N_CONFIG || {
    supportedLangs: ['en', 'ar', 'ku'],
    rtlLangs: ['ar', 'ku'],
    storageKey: 'siteLanguage',
    defaultLang: 'en',
    devMode: true
  };

  class UnifiedI18nManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.translationCache = new Map();
      this.missingTranslations = new Map();
      this.init();
    }

    getSavedLanguage() {
      const saved = localStorage.getItem(CONFIG.storageKey);
      return CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
    }

    init() {
      console.log('[i18n] 🚀 Initializing...');
      console.log('[i18n] Available UI translations:', Object.keys(TRANSLATIONS));
      console.log('[i18n] Available job titles:', Object.keys(JOB_TITLES));
      console.log('[i18n] Current language:', this.currentLang);
      
      // Apply language immediately
      this.applyLanguage(this.currentLang, false);
      
      // Initialize picker when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initializePicker();
          this.setupEventListeners();
        });
      } else {
        this.initializePicker();
        this.setupEventListeners();
      }

      console.log('[i18n] ✅ Initialization complete');
    }

    /**
     * Main translation function
     */
    t(key) {
      const keys = key.split('.');
      let value = TRANSLATIONS[this.currentLang];

      for (const k of keys) {
        value = value?.[k];
      }

      if (!value || value === key) {
        const jobTitleValue = JOB_TITLES[this.currentLang]?.[keys[keys.length - 1]];
        if (jobTitleValue) return jobTitleValue;

        if (CONFIG.devMode) {
          console.warn(`[i18n] Missing: ${key} (lang: ${this.currentLang})`);
        }
      }

      return value || key;
    }

    /**
     * ✅ Synchronous Job Title Translation (YAML only)
     */
    translateJobTitle(title) {
      if (!title || title === "—" || title === "" || title === null) {
        return title;
      }

      const cacheKey = `${this.currentLang}:${title}`;
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey);
      }

      let result = null;

      // LAYER 1: Exact match
      result = this.exactMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }

      // LAYER 2: Fuzzy match
      result = this.fuzzyMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }

      // LAYER 3: Partial match
      result = this.partialMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }

      // LAYER 4: English fallback
      if (this.currentLang !== 'en') {
        result = this.englishFallback(title);
        if (result) {
          this.translationCache.set(cacheKey, result);
          return result;
        }
      }

      // LAYER 5: Track missing
      this.trackMissing(title);

      // LAYER 6: Return original
      this.translationCache.set(cacheKey, title);
      return title;
    }

    exactMatch(title) {
      const key = this.titleToKey(title);
      const translated = JOB_TITLES[this.currentLang]?.[key];

      if (translated) {
        if (CONFIG.devMode) {
          console.log(`[i18n] ✅ Exact: "${title}" → "${translated}"`);
        }
        return translated;
      }

      return null;
    }

    fuzzyMatch(title) {
      const key = this.titleToKey(title);

      const fuzzyMappings = {
        'qa_test': 'qa_tester',
        'qa': 'qa_tester',
        'db_admin': 'database_administrator',
        'dba': 'database_administrator',
        'sys_admin': 'systems_administrator',
        'dev': 'developer',
        'software_dev': 'software_developer',
        'mgr': 'manager',
        'pm': 'project_manager'
      };

      for (const [pattern, replacement] of Object.entries(fuzzyMappings)) {
        if (key === pattern || key.includes(pattern)) {
          const translated = JOB_TITLES[this.currentLang]?.[replacement];
          if (translated) {
            if (CONFIG.devMode) {
              console.log(`[i18n] 🔍 Fuzzy: "${title}" → "${replacement}"`);
            }
            return translated;
          }
        }
      }

      return null;
    }

    partialMatch(title) {
      const currentLangTitles = JOB_TITLES[this.currentLang] || {};
      const titleLower = title.toLowerCase();

      for (const [key, translation] of Object.entries(currentLangTitles)) {
        const cleanTitle = key.replace(/_/g, ' ');

        if (titleLower.includes(cleanTitle)) {
          if (CONFIG.devMode) {
            console.log(`[i18n] 🎯 Partial: "${title}" → "${key}"`);
          }
          return translation;
        }
      }

      return null;
    }

    englishFallback(title) {
      const key = this.titleToKey(title);
      const englishTitle = JOB_TITLES['en']?.[key];

      if (englishTitle) {
        if (CONFIG.devMode) {
          console.log(`[i18n] 🇬🇧 English fallback: "${title}"`);
        }
        return englishTitle;
      }

      return null;
    }

    trackMissing(title) {
      const key = this.titleToKey(title);

      if (!this.missingTranslations.has(key)) {
        this.missingTranslations.set(key, {
          original: title,
          key: key,
          language: this.currentLang,
          count: 1
        });

        if (CONFIG.devMode) {
          console.warn(`[i18n] ⚠️ Missing: "${title}" (key: ${key})`);
        }
      }
    }

    titleToKey(title) {
      return title
        .toLowerCase()
        .replace(/[()]/g, '')
        .replace(/\s+/g, '_')
        .replace(/&/g, 'and')
        .replace(/-/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .trim();
    }

    clearCache() {
      this.translationCache.clear();
    }

    translateCategory(cat) {
      return this.t(`job_categories.${cat}`) || cat;
    }

    translateCity(city) {
      return this.t(`cities.${city}`) || city;
    }

    translateType(type) {
      return this.t(`employment_types.${type}`) || type;
    }

    translatePeriod(period) {
      return this.t(`salary_periods.${period}`) || period;
    }

    applyLanguage(lang, broadcast = false) {
      if (!CONFIG.supportedLangs.includes(lang)) lang = CONFIG.defaultLang;

      console.log(`[i18n] Applying language: ${lang}`);

      document.documentElement.setAttribute('lang', lang);

      const isRTL = CONFIG.rtlLangs.includes(lang);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

      localStorage.setItem(CONFIG.storageKey, lang);
      this.currentLang = lang;

      this.clearCache();

      this.updateNavigationTranslations();

      const picker = document.getElementById('globalLangPicker');
      if (picker && picker.value !== lang) {
        picker.value = lang;
      }

      if (broadcast) {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: lang, isRTL: isRTL }
        }));
        console.log(`[i18n] ✅ Language changed to: ${lang}`);
      }
    }

    updateNavigationTranslations() {
  // Update [data-i18n] elements (for dynamic content)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = this.t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translated;
    } else {
      el.textContent = translated;
    }
  });

  // ✅ FAST: Update navigation menu with data attributes
  document.querySelectorAll('[data-i18n-nav]').forEach(el => {
    const translatedTitle = el.getAttribute(`data-title-${this.currentLang}`);
    if (translatedTitle) {
      el.textContent = translatedTitle;
    }
  });
}

    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      if (!picker) {
        console.warn('[i18n] ⚠️ Language picker (#globalLangPicker) not found');
        return;
      }

      picker.value = this.currentLang;

      picker.addEventListener('change', (e) => {
        console.log('[i18n] Language picker changed to:', e.target.value);
        this.applyLanguage(e.target.value, true);
      });

      console.log('[i18n] ✅ Language picker initialized');
    }

    setupEventListeners() {
      window.addEventListener('popstate', () => {
        const saved = this.getSavedLanguage();
        if (saved !== this.currentLang) {
          this.applyLanguage(saved, false);
        }
      });
    }
  }

  // Initialize immediately (synchronous)
  window.i18n = new UnifiedI18nManager();
  console.log('[i18n] ✅ window.i18n ready');

})();
