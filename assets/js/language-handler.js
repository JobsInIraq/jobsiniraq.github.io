// Unified Language Manager for JobsInIraq
// Syncs language across ALL pages including dashboard

(function() {
  'use strict';
  
  const SUPPORTED_LANGS = ['en', 'ar', 'ku'];
  const RTL_LANGS = ['ar', 'ku'];
  const STORAGE_KEY = 'siteLanguage'; // Single source of truth
  
  // Translation strings for navigation
  // const UI_STRINGS = {
  //   en: {
  //     home: 'Home',
  //     process: 'Recruitment Process',
  //     payscale: 'Salary Guide',
  //     dashboard: 'Dashboard',
  //     about: 'About'
  //   },
  //   ar: {
  //     home: 'الرئيسية',
  //     process: 'عملية التوظيف',
  //     payscale: 'دليل الرواتب',
  //     dashboard: 'لوحة التحكم',
  //     about: 'عن الموقع'
  //   },
  //   ku: {
  //     home: 'سەرەتا',
  //     process: 'پرۆسەی دامەزراندن',
  //     payscale: 'ڕێبەری مووچە',
  //     dashboard: 'داشبۆرد',
  //     about: 'دەربارە'
  //   }
  // };
  
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
      const translations = window.siteTranslations;
  
  document.querySelectorAll('.masthead__menu-item a').forEach(link => {
    const key = link.getAttribute('data-i18n-key'); // Add this attribute to your HTML links
    if (translations[key] && translations[key][lang]) {
      link.textContent = translations[key][lang];
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
