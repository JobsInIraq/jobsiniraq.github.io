/**
 * Unified I18n System for JobsInIraq
 * Simple YAML-only translation system (NO AI)
 * @version 4.2.0 - PRODUCTION READY (YAML ONLY, SYNCHRONOUS)
 * @lastUpdated 2025-10-12
 */

(function() {
  'use strict';

  // Use translations injected from YAML
  const TRANSLATIONS = window.SITE_TRANSLATIONS || {};
  const JOB_TITLES = window.JOB_TITLES_TRANSLATIONS || {};
  const CONFIG = window.I18N_CONFIG || {
    supportedLangs: ['en', 'ar', 'ckb'],
    rtlLangs: ['ar', 'ckb'],
    storageKey: 'siteLanguage',
    defaultLang: 'en',
    devMode: false
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
      console.log('[i18n] Initializing...');
      console.log('[i18n] Available translations:', Object.keys(TRANSLATIONS));
      console.log('[i18n] Available job titles:', Object.keys(JOB_TITLES));
      
      this.applyLanguage(this.currentLang, false);
      this.initializePicker();
      this.setupEventListeners();

      if (CONFIG.devMode) {
        window.getMissingTranslations = () => {
          return Object.fromEntries(this.missingTranslations);
        };
      }

      console.log('[i18n] ✅ Initialization complete');
    }

    /**
     * Main translation function - accesses nested YAML values
     */
    t(key) {
      const keys = key.split('.');
      let value = TRANSLATIONS[this.currentLang];

      for (const k of keys) {
        value = value?.[k];
      }

      if (!value || value === key) {
        // Try job titles
        const jobTitleValue = JOB_TITLES[this.currentLang]?.[keys[keys.length - 1]];
        if (jobTitleValue) return jobTitleValue;

        // Track missing
        if (CONFIG.devMode) {
          console.warn(`[i18n] Missing translation: ${key} (lang: ${this.currentLang})`);
        }
      }

      return value || key;
    }

    /**
     * ✅ SIMPLE SYNCHRONOUS Job Title Translation (YAML only)
     */
    translateJobTitle(title) {
      if (!title || title === "—" || title === "" || title === null) {
        return title;
      }

      // Check cache first
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

    /**
     * Exact match translation
     */
    exactMatch(title) {
      const key = this.titleToKey(title);
      const translated = JOB_TITLES[this.currentLang]?.[key];

      if (translated) {
        if (CONFIG.devMode) {
          console.log(`[i18n] ✅ Exact match: "${title}" → "${translated}"`);
        }
        return translated;
      }

      return null;
    }

    /**
     * Fuzzy match for common variations
     */
    fuzzyMatch(title) {
      const key = this.titleToKey(title);

      const fuzzyMappings = {
        'qa_test': 'qa_tester',
        'qa': 'qa_tester',
        'quality_assurance': 'qa_engineer',
        'db_admin': 'database_administrator',
        'dba': 'database_administrator',
        'sys_admin': 'systems_administrator',
        'sysadmin': 'systems_administrator',
        'dev': 'developer',
        'software_dev': 'software_developer',
        'web_dev': 'web_developer',
        'frontend_dev': 'frontend_developer',
        'backend_dev': 'backend_developer',
        'mgr': 'manager',
        'proj_mgr': 'project_manager',
        'pm': 'project_manager'
      };

      for (const [pattern, replacement] of Object.entries(fuzzyMappings)) {
        if (key === pattern || key.includes(pattern)) {
          const translated = JOB_TITLES[this.currentLang]?.[replacement];
          if (translated) {
            if (CONFIG.devMode) {
              console.log(`[i18n] 🔍 Fuzzy match: "${title}" → "${replacement}"`);
            }
            return translated;
          }
        }
      }

      return null;
    }

    /**
     * Partial match for titles with prefixes/suffixes
     */
    partialMatch(title) {
      const currentLangTitles = JOB_TITLES[this.currentLang] || {};
      const titleLower = title.toLowerCase();

      for (const [key, translation] of Object.entries(currentLangTitles)) {
        const cleanTitle = key.replace(/_/g, ' ');

        if (titleLower.includes(cleanTitle) || 
            cleanTitle.includes(titleLower.replace(/\b(senior|junior|lead|principal)\b/gi, '').trim())) {
          if (CONFIG.devMode) {
            console.log(`[i18n] 🎯 Partial match: "${title}" → "${key}"`);
          }
          return translation;
        }
      }

      return null;
    }

    /**
     * Fallback to English translation
     */
    englishFallback(title) {
      const key = this.titleToKey(title);
      const englishTitle = JOB_TITLES['en']?.[key];

      if (englishTitle) {
        if (CONFIG.devMode) {
          console.log(`[i18n] 🇬🇧 English fallback: "${title}" → "${englishTitle}"`);
        }
        return englishTitle;
      }

      return null;
    }

    /**
     * Track missing translations
     */
    trackMissing(title) {
      const key = this.titleToKey(title);

      if (!this.missingTranslations.has(key)) {
        this.missingTranslations.set(key, {
          original: title,
          key: key,
          language: this.currentLang,
          count: 1,
          firstSeen: new Date().toISOString()
        });

        if (CONFIG.devMode) {
          console.warn(`[i18n] ⚠️ Missing: "${title}" (key: ${key}, lang: ${this.currentLang})`);
        }
      }
    }

    /**
     * Convert job title to translation key
     */
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

    /**
     * Clear translation cache
     */
    clearCache() {
      this.translationCache.clear();
      if (CONFIG.devMode) {
        console.log('[i18n] Cache cleared');
      }
    }

    // Shorthand helpers
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

      document.documentElement.setAttribute('lang', lang);

      const isRTL = CONFIG.rtlLangs.includes(lang);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

      localStorage.setItem(CONFIG.storageKey, lang);
      this.currentLang = lang;

      this.clearCache();

      this.updateNavigationTranslations();
      this.updateDashboardTranslations();

      const picker = document.getElementById('globalLangPicker');
      if (picker && picker.value !== lang) {
        picker.value = lang;
      }

      if (broadcast) {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: lang, isRTL: isRTL }
        }));
        console.log(`[i18n] Language changed to: ${lang}`);
      }
    }

    updateNavigationTranslations() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translated;
        } else {
          el.textContent = translated;
        }
      });
    }

    updateDashboardTranslations() {
      // Placeholder for dashboard-specific translations
      // Dashboard will handle its own translations via window.i18n.t()
    }

    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      if (!picker) {
        if (CONFIG.devMode) {
          console.warn('[i18n] Language picker not found');
        }
        return;
      }

      picker.value = this.currentLang;

      picker.addEventListener('change', (e) => {
        this.applyLanguage(e.target.value, true);
      });

      console.log('[i18n] Language picker initialized');
    }

    setupEventListeners() {
      // Handle browser back/forward
      window.addEventListener('popstate', () => {
        const saved = this.getSavedLanguage();
        if (saved !== this.currentLang) {
          this.applyLanguage(saved, false);
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n = new UnifiedI18nManager();
    });
  } else {
    window.i18n = new UnifiedI18nManager();
  }
})();
