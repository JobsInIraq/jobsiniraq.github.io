/**
 * Unified I18n System for JobsInIraq
 * Consumes translations from _data/ui-text.yml + _data/job-titles/*.yml (via Jekyll injection)
 * @version 4.0.0 - COMPLETE WITH JOB TITLES SUPPORT
 * @lastUpdated 2025-10-11
 */

(function() {
  'use strict';
  
  // Use translations injected from YAML
  const TRANSLATIONS = window.SITE_TRANSLATIONS || {};
  const CONFIG = window.I18N_CONFIG || {
    supportedLangs: ['en', 'ar', 'ckb'],
    rtlLangs: ['ar', 'ckb'],
    storageKey: 'siteLanguage',
    defaultLang: 'en'
  };
  
  class UnifiedI18nManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.jobTitlesLoaded = false;
      this.jobTitlesCache = {}; // Store loaded job titles
      this.init();
    }
    
    getSavedLanguage() {
      const saved = localStorage.getItem(CONFIG.storageKey);
      return CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
    }
    
    async init() {
      // Load job titles asynchronously
      await this.loadJobTitles();
      
      // Apply language and initialize UI
      this.applyLanguage(this.currentLang, false);
      this.initializePicker();
      this.setupEventListeners();
    }
    
    /**
     * ✅ NEW: Load job titles from separate YAML files
     * Loads all languages in parallel for better performance
     */
    async loadJobTitles() {
      if (this.jobTitlesLoaded) return;
      
      try {
        console.log('[i18n] Loading job title translations...');
        
        // Check if job titles are already injected by Jekyll
        if (window.JOB_TITLES_TRANSLATIONS) {
          this.jobTitlesCache = window.JOB_TITLES_TRANSLATIONS;
          this.jobTitlesLoaded = true;
          console.log('[i18n] ✅ Job titles loaded from Jekyll injection');
          return;
        }
        
        // Fallback: Load from separate JSON files (if available)
        const urls = CONFIG.supportedLangs.map(lang => 
          `/assets/data/job-titles-${lang}.json`
        );
        
        const responses = await Promise.allSettled(
          urls.map(url => fetch(url).then(r => r.ok ? r.json() : null))
        );
        
        // Process results
        CONFIG.supportedLangs.forEach((lang, index) => {
          const result = responses[index];
          if (result.status === 'fulfilled' && result.value) {
            this.jobTitlesCache[lang] = result.value;
          } else {
            console.warn(`[i18n] Could not load job titles for ${lang}`);
            this.jobTitlesCache[lang] = {}; // Empty fallback
          }
        });
        
        this.jobTitlesLoaded = true;
        console.log('[i18n] ✅ Job titles loaded successfully');
        
      } catch (error) {
        console.error('[i18n] Error loading job titles:', error);
        this.jobTitlesLoaded = true; // Mark as loaded to prevent retry loop
      }
    }
    
    /**
     * Access nested YAML values with job titles support
     */
    t(key) {
      const keys = key.split('.');
      
      // Check if requesting job title
      if (keys[0] === 'job_titles') {
        const titleKey = keys.slice(1).join('.');
        const jobTitle = this.jobTitlesCache[this.currentLang]?.[titleKey];
        if (jobTitle) return jobTitle;
      }
      
      // Fall back to main translations
      let value = TRANSLATIONS[this.currentLang];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    }
    
    /**
     * ✅ NEW: Translate job title with smart key conversion
     */
    translateJobTitle(title) {
      if (!title || title === "—") return title;
      
      // Convert title to translation key
      const key = this.titleToKey(title);
      const fullKey = `job_titles.${key}`;
      const translated = this.t(fullKey);
      
      // Return translated version or original if not found
      return (translated && translated !== fullKey) ? translated : title;
    }
    
    /**
     * ✅ NEW: Convert job title string to translation key
     * Example: "Software Engineer" → "software_engineer"
     */
    titleToKey(title) {
      return title
        .toLowerCase()
        .replace(/[()]/g, '')           // Remove parentheses
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .replace(/&/g, 'and')           // Replace & with "and"
        .replace(/-/g, '_')             // Replace hyphens with underscores
        .replace(/[^a-z0-9_]/g, '')     // Remove special characters
        .replace(/_+/g, '_')            // Remove duplicate underscores
        .replace(/^_|_$/g, '')          // Remove leading/trailing underscores
        .trim();
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
      
      this.updateNavigationTranslations();
      this.updateDashboardTranslations();
      
      const picker = document.getElementById('globalLangPicker');
      if (picker && picker.value !== lang) {
        picker.value = lang;
      }
      
      if (broadcast) {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: lang }
        }));
      }
    }
    
    updateNavigationTranslations() {
      document.querySelectorAll('.greedy-nav .masthead__menu-item a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href === '/' || href === '/index.html') {
          link.textContent = this.t('navigation.home');
        } else if (href.includes('/jobs')) {
          link.textContent = this.t('navigation.jobs');
        } else if (href.includes('/payscale/')) {
          link.textContent = this.t('navigation.payscale');
        } else if (href.includes('/payscale-dashboard')) {
          link.textContent = this.t('navigation.dashboard');
        } else if (href.includes('/process')) {
          link.textContent = this.t('navigation.recruitment_process');
        } else if (href.includes('/innovation')) {
          link.textContent = this.t('navigation.innovation');
        } else if (href.includes('/about')) {
          link.textContent = this.t('navigation.about');
        } else if (href.includes('/contact')) {
          link.textContent = this.t('navigation.contact');
        }
      });
    }
    
    updateDashboardTranslations() {
      const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      
      updateText("t.title", this.t('payscale.title'));
      updateText("t.caption", this.t('payscale.all_salaries_monthly'));
      updateText("t.theme", this.t('payscale.theme_toggle'));
      updateText("t.aiInsights", this.t('payscale.ai_insights'));
      updateText("t.tableTitle", this.t('payscale.data_table'));
      updateText("t.tableCaption", this.t('payscale.table_description'));
      updateText("t.reset", this.t('payscale.reset_filters'));
      updateText("t.export", this.t('payscale.export_csv'));
      updateText("t.exportJson", this.t('payscale.export_json'));
      updateText("t.print", this.t('payscale.print_report'));
      updateText("t.cityLegend", this.t('payscale.city_legend'));
      updateText("t.categoryLegend", this.t('payscale.category_legend'));
    }
    
    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      if (!picker) return;
      
      picker.value = this.currentLang;
      picker.addEventListener('change', (e) => {
        this.applyLanguage(e.target.value, true);
      });
    }
    
    setupEventListeners() {
      window.addEventListener('storage', (e) => {
        if (e.key === CONFIG.storageKey && e.newValue !== this.currentLang) {
          this.applyLanguage(e.newValue, false);
        }
      });
    }
  }
  
  // Initialize (async-safe)
  const manager = new UnifiedI18nManager();
  
  // Export globally
  window.i18n = manager;
  window.translateCategory = (cat) => manager.translateCategory(cat);
  window.translateCity = (city) => manager.translateCity(city);
  window.translateType = (type) => manager.translateType(type);
  window.translatePeriod = (period) => manager.translatePeriod(period);
  window.translateJobTitle = (title) => manager.translateJobTitle(title); // ✅ NEW
  
})();
