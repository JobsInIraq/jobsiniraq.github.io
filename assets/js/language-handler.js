// Global Language Handler for JobsInIraq
// Syncs language across all pages including custom dashboard

(function() {
  'use strict';
  
  const SUPPORTED_LANGS = ['en', 'ar', 'ckb'];
  const RTL_LANGS = ['ar', 'ckb'];
  
  // Translation strings for UI elements
  const UI_STRINGS = {
    en: {
      home: 'Home',
      jobs: 'Jobs',
      payscale: 'Salary Guide',
      dashboard: 'Dashboard',
      process: 'Recruitment Process',
      innovation: 'Innovation',
      about: 'About',
      contact: 'Contact'
    },
    ar: {
      home: 'الرئيسية',
      jobs: 'الوظائف',
      payscale: 'دليل الرواتب',
      dashboard: 'لوحة التحكم',
      process: 'عملية التوظيف',
      innovation: 'الابتكار',
      about: 'عن الموقع',
      contact: 'اتصل بنا'
    },
    ckb: {
      home: 'سەرەتا',
      jobs: 'کارەکان',
      payscale: 'ڕێبەری مووچە',
      dashboard: 'داشبۆرد',
      process: 'پرۆسەی دامەزراندن',
      innovation: 'داهێنان',
      about: 'دەربارە',
      contact: 'پەیوەندی'
    }
  };
  
  class LanguageManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.init();
    }
    
    getSavedLanguage() {
      const saved = localStorage.getItem('siteLanguage');
      return SUPPORTED_LANGS.includes(saved) ? saved : 'en';
    }
    
    init() {
      this.applyLanguage(this.currentLang);
      this.setupEventListeners();
    }
    
    applyLanguage(lang) {
      // Set HTML attributes
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('data-locale', lang);
      
      // Apply RTL direction
      if (RTL_LANGS.includes(lang)) {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
      }
      
      // Update navigation text if elements exist
      this.updateNavigationText(lang);
      
      // Store language preference
      localStorage.setItem('siteLanguage', lang);
      this.currentLang = lang;
    }
    
    updateNavigationText(lang) {
      const strings = UI_STRINGS[lang];
      if (!strings) return;
      
      // Update navigation links by matching href patterns
      document.querySelectorAll('.greedy-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === '/' || href === '/index.html') link.textContent = strings.home;
        else if (href.includes('/jobs')) link.textContent = strings.jobs;
        else if (href.includes('/payscale/') && !href.includes('dashboard')) link.textContent = strings.payscale;
        else if (href.includes('/payscale-dashboard')) link.textContent = strings.dashboard;
        else if (href.includes('/process')) link.textContent = strings.process;
        else if (href.includes('/innovation')) link.textContent = strings.innovation;
        else if (href.includes('/about')) link.textContent = strings.about;
        else if (href.includes('/contact')) link.textContent = strings.contact;
      });
    }
    
    setupEventListeners() {
      // Listen for language change events
      window.addEventListener('languageChanged', (e) => {
        if (e.detail && e.detail.language) {
          this.applyLanguage(e.detail.language);
        }
      });
      
      // Sync with dashboard language picker if on dashboard page
      const dashboardPicker = document.getElementById('langPicker');
      if (dashboardPicker) {
        dashboardPicker.value = this.currentLang;
        dashboardPicker.addEventListener('change', (e) => {
          this.applyLanguage(e.target.value);
          window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: e.target.value }
          }));
        });
      }
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LanguageManager());
  } else {
    new LanguageManager();
  }
})();
