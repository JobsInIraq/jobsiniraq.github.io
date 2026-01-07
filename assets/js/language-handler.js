// Unified Language Manager for JobsInIraq
// Syncs language across ALL pages including dashboard

(function() {
  'use strict';
  
  const SUPPORTED_LANGS = ['en', 'ar', 'ku'];
  const RTL_LANGS = ['ar', 'ku'];
  const STORAGE_KEY = 'siteLanguage'; // Single source of truth
  
  class UnifiedLanguageManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.init();
    }
    
    getSavedLanguage() {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGS.includes(saved) ? saved : 'en';
    }
    
    init() {
      this.applyLanguage(this.currentLang);
      this.setupEventListeners();
      this.initializePicker();
    }
    
    applyLanguage(lang) {
      if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';
      
      // Set HTML attributes
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('data-locale', lang);
      
      // Apply RTL direction
      const isRTL = RTL_LANGS.includes(lang);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.body.classList.toggle('rtl', isRTL);
      
      // Update navigation text
      this.updateNavigationText(lang);
      
      // Store language preference
      localStorage.setItem(STORAGE_KEY, lang);
      this.currentLang = lang;
      
      // Broadcast change to all components (dashboard, etc.)
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang }
      }));
    }
    
    updateNavigationText(lang) {
      // Use the global translation object injected in head.html
      const translations = window.SITE_TRANSLATIONS;
      if (!translations || !translations[lang]) {
        console.warn('[i18n] No translations found for:', lang);
        return;
      }
  
      document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (key && translations[lang][key]) {
          element.textContent = translations[lang][key];
        }
      });
    }
    
    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      if (!picker) return;
      
      // Set initial value
      picker.value = this.currentLang;
      
      // Add change listener
      picker.addEventListener('change', (e) => {
        this.applyLanguage(e.target.value);
      });
    }
    
    setupEventListeners() {
      // Listen for language change events from dashboard or other components
      window.addEventListener('languageChanged', (e) => {
        if (e.detail && e.detail.language && e.detail.language !== this.currentLang) {
          this.applyLanguage(e.detail.language);
        }
      });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.languageManager = new UnifiedLanguageManager();
    });
  } else {
    window.languageManager = new UnifiedLanguageManager();
  }
})();