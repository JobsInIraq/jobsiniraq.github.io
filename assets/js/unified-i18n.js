/**
 * Unified I18n System for JobsInIraq
 * Consumes translations from _data/ui-text.yml (via Jekyll injection)
 * @version 3.0.0 - YAML-driven
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
      this.init();
    }
    
    getSavedLanguage() {
      const saved = localStorage.getItem(CONFIG.storageKey);
      return CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
    }
    
    init() {
      this.applyLanguage(this.currentLang, false);
      this.initializePicker();
      this.setupEventListeners();
    }
    
    // Access nested YAML values
    t(key) {
      const keys = key.split('.');
      let value = TRANSLATIONS[this.currentLang];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
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
  
  // Initialize
  const manager = new UnifiedI18nManager();
  
  // Export globally
  window.i18n = manager;
  window.translateCategory = (cat) => manager.translateCategory(cat);
  window.translateCity = (city) => manager.translateCity(city);
  window.translateType = (type) => manager.translateType(type);
  window.translatePeriod = (period) => manager.translatePeriod(period);
  
})();
