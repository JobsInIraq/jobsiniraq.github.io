/**
 * Unified Language Handler for JobsInIraq
 * Manages multi-language support (English, Arabic, Kurdish)
 * with RTL direction switching
 * 
 * @version 2.0.0 - Production Ready
 * @lastUpdated 2026-01-09
 * 
 * FEATURES:
 * - Persistent language preference via localStorage
 * - RTL/LTR direction switching
 * - Navigation text translation
 * - Custom event broadcasting for component sync
 * - Debug logging (can be disabled)
 * - Graceful fallbacks
 * 
 * COMPATIBILITY:
 * - Works with Jekyll's SITE_TRANSLATIONS from ui-text.yml
 * - Works with data-i18n-key attributes in masthead
 * - Works with globalLangPicker select element
 * - Triggers languageChanged events for dashboard sync
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  const CONFIG = {
    supportedLangs: ['en', 'ar', 'ku'],
    rtlLangs: ['ar', 'ku'],
    storageKey: 'siteLanguage',
    defaultLang: 'en',
    debug: false // Set to true for console logging
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  
  /**
   * Safe console logging (only when debug is enabled)
   */
  function log(type, ...args) {
    if (!CONFIG.debug) return;
    const prefix = '[i18n]';
    switch (type) {
      case 'info':
        console.log(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  /**
   * Check if a language is RTL
   */
  function isRTL(lang) {
    return CONFIG.rtlLangs.includes(lang);
  }

  /**
   * Validate language code
   */
  function isValidLang(lang) {
    return CONFIG.supportedLangs.includes(lang);
  }

  // ============================================================
  // UNIFIED LANGUAGE MANAGER CLASS
  // ============================================================
  
  class UnifiedLanguageManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.initialized = false;
      this.init();
    }

    /**
     * Get saved language from localStorage with fallback
     */
    getSavedLanguage() {
      try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (isValidLang(saved)) {
          return saved;
        }
      } catch (e) {
        log('warn', 'localStorage unavailable:', e.message);
      }
      return CONFIG.defaultLang;
    }

    /**
     * Initialize the language manager
     */
    init() {
      log('info', 'Initializing language manager...');
      log('info', 'Current language:', this.currentLang);
      log('info', 'RTL mode:', isRTL(this.currentLang));

      // Apply language immediately (before DOM is fully ready)
      this.applyLanguage(this.currentLang);

      // Setup DOM-dependent features when ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.onDOMReady();
        });
      } else {
        // DOM already ready
        this.onDOMReady();
      }

      this.initialized = true;
      log('info', 'Language manager initialized');
    }

    /**
     * Called when DOM is ready
     */
    onDOMReady() {
      this.initializePicker();
      this.setupEventListeners();
      this.updateNavigationText(this.currentLang);
    }

    /**
     * Apply language settings to the document
     */
    applyLanguage(lang) {
      // Validate language
      if (!isValidLang(lang)) {
        log('warn', 'Invalid language:', lang, '- falling back to', CONFIG.defaultLang);
        lang = CONFIG.defaultLang;
      }

      const rtl = isRTL(lang);

      // --------------------------------------------------------
      // 1. SET HTML ELEMENT ATTRIBUTES (Critical for CSS)
      // --------------------------------------------------------
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('data-locale', lang);

      // --------------------------------------------------------
      // 2. SET BODY ATTRIBUTES (Additional CSS hooks)
      // --------------------------------------------------------
      if (document.body) {
        document.body.setAttribute('data-locale', lang);
        document.body.setAttribute('data-rtl', rtl ? 'true' : 'false');
        
        // Toggle CSS classes for additional styling options
        document.body.classList.toggle('rtl', rtl);
        document.body.classList.toggle('ltr', !rtl);
      }

      // --------------------------------------------------------
      // 3. UPDATE NAVIGATION TEXT
      // --------------------------------------------------------
      this.updateNavigationText(lang);

      // --------------------------------------------------------
      // 4. SAVE PREFERENCE
      // --------------------------------------------------------
      try {
        localStorage.setItem(CONFIG.storageKey, lang);
      } catch (e) {
        log('warn', 'Could not save language preference:', e.message);
      }

      // --------------------------------------------------------
      // 5. UPDATE STATE
      // --------------------------------------------------------
      this.currentLang = lang;

      // --------------------------------------------------------
      // 6. BROADCAST CHANGE EVENT
      // --------------------------------------------------------
      this.broadcastChange(lang, rtl);

      log('info', 'Language applied:', lang, '| RTL:', rtl);
    }

    /**
     * Update navigation text from translations
     */
    updateNavigationText(lang) {
      const translations = window.SITE_TRANSLATIONS;
      
      if (!translations) {
        log('warn', 'SITE_TRANSLATIONS not found on window');
        return;
      }

      const langTranslations = translations[lang];
      if (!langTranslations) {
        log('warn', 'No translations found for language:', lang);
        return;
      }

      // --------------------------------------------------------
      // Update elements with data-i18n-key attribute
      // Used in masthead.html for navigation links
      // --------------------------------------------------------
      const elements = document.querySelectorAll('[data-i18n-key]');
      log('info', 'Found translatable elements:', elements.length);

      elements.forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (key && langTranslations[key]) {
          element.textContent = langTranslations[key];
        }
      });

      // --------------------------------------------------------
      // Update elements with data-i18n attribute (generic)
      // Supports nested keys like "payscale.median_salary"
      // --------------------------------------------------------
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = this.getNestedTranslation(langTranslations, key);
        
        if (value) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = value;
          } else {
            element.textContent = value;
          }
        }
      });
    }

    /**
     * Get nested translation value (e.g., "payscale.median_salary")
     */
    getNestedTranslation(obj, key) {
      if (!key || !obj) return null;
      
      const keys = key.split('.');
      let value = obj;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return null;
        }
      }

      return typeof value === 'string' ? value : null;
    }

    /**
     * Initialize the language picker dropdown
     */
    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      
      if (!picker) {
        log('warn', 'Language picker (#globalLangPicker) not found');
        return;
      }

      // Set current value
      picker.value = this.currentLang;

      // Add change listener
      picker.addEventListener('change', (e) => {
        const newLang = e.target.value;
        log('info', 'Picker changed to:', newLang);
        this.applyLanguage(newLang);
      });

      log('info', 'Language picker initialized');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
      // Listen for language change events from other components
      // (e.g., dashboard, external widgets)
      window.addEventListener('languageChanged', (e) => {
        if (e.detail && e.detail.language && e.detail.language !== this.currentLang) {
          log('info', 'External language change detected:', e.detail.language);
          this.applyLanguage(e.detail.language);
        }
      });

      // Handle browser back/forward navigation
      window.addEventListener('popstate', () => {
        const saved = this.getSavedLanguage();
        if (saved !== this.currentLang) {
          this.applyLanguage(saved);
        }
      });
    }

    /**
     * Broadcast language change event
     */
    broadcastChange(lang, rtl) {
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: {
          language: lang,
          isRTL: rtl,
          timestamp: Date.now()
        }
      }));
    }

    // ============================================================
    // PUBLIC API METHODS
    // ============================================================

    /**
     * Get current language
     */
    getLanguage() {
      return this.currentLang;
    }

    /**
     * Set language programmatically
     */
    setLanguage(lang) {
      this.applyLanguage(lang);
    }

    /**
     * Check if current language is RTL
     */
    isRTL() {
      return isRTL(this.currentLang);
    }

    /**
     * Get translation by key
     */
    t(key) {
      const translations = window.SITE_TRANSLATIONS;
      if (!translations || !translations[this.currentLang]) {
        return key;
      }
      return this.getNestedTranslation(translations[this.currentLang], key) || key;
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
      return [...CONFIG.supportedLangs];
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  // Create global instance
  window.languageManager = new UnifiedLanguageManager();

  // Also expose as window.i18n for compatibility with unified-i18n.js
  window.i18n = window.languageManager;

  log('info', 'Language handler ready. Use window.languageManager or window.i18n');

})();