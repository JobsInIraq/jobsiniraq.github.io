/**
 * Unified Language Handler for JobsInIraq
 * Manages multi-language support (English, Arabic, Kurdish)
 * with RTL direction switching and NAVIGATION REORDERING
 * 
 * @version 3.1.0 - Production Ready with Complete Nav Reorder Fix
 * @lastUpdated 2025-01-11
 * 
 * FEATURES:
 * - Persistent language preference via localStorage
 * - RTL/LTR direction switching
 * - Navigation text translation
 * - NAVIGATION DOM REORDERING for RTL (fixes greedy-nav plugin issue)
 * - MutationObserver to handle greedy-nav resize events
 * - Proper cleanup and teardown
 * - Custom event broadcasting for component sync
 * - Debug logging (can be disabled)
 * - Graceful fallbacks
 * 
 * COMPATIBILITY:
 * - Works with Jekyll's SITE_TRANSLATIONS from ui-text.yml
 * - Works with data-i18n-key attributes in masthead
 * - Works with globalLangPicker select element
 * - Works with Minimal Mistakes greedy-nav plugin
 * - Triggers languageChanged events for dashboard sync
 * 
 * IMPORTANT: The CSS must NOT use flex-direction: row-reverse on .visible-links
 * because this JavaScript handles DOM reversal. Using both would cancel out.
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
      
      // Store original navigation order for restoration
      this.originalVisibleItems = [];
      this.originalHiddenItems = [];
      this.navObserver = null;
      this.isReordering = false; // Prevent observer recursion
      this.resizeTimeout = null;
      
      this.init();
    }

    /**
     * Get saved language from localStorage with fallback
     */
    getSavedLanguage() {
      try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved && isValidLang(saved)) {
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
      log('info', 'Initializing language manager v3.1.0...');
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
      // Cache original navigation order FIRST (before any reordering)
      this.cacheOriginalNavOrder();
      
      this.initializePicker();
      this.setupEventListeners();
      this.updateNavigationText(this.currentLang);
      
      // Apply navigation order based on current language
      if (isRTL(this.currentLang)) {
        this.reverseNavigationForRTL();
      }
      
      // Setup observer for greedy-nav plugin changes
      this.setupNavObserver();
    }

    // ============================================================
    // NAVIGATION REORDERING (KEY FIX FOR RTL)
    // ============================================================

    /**
     * Cache the original LTR order of navigation items
     * Stores references to actual DOM elements for reliable restoration
     */
    cacheOriginalNavOrder() {
      const visibleLinks = document.querySelector('.greedy-nav .visible-links');
      const hiddenLinks = document.querySelector('.greedy-nav .hidden-links');
      
      if (!visibleLinks) {
        log('warn', 'Could not find .visible-links for caching');
        return;
      }

      // Store deep clones of the original items to preserve their state
      const visibleItems = visibleLinks.querySelectorAll(':scope > li');
      const hiddenItems = hiddenLinks ? hiddenLinks.querySelectorAll(':scope > li') : [];

      // Cache using a unique identifier (href or data-i18n-key)
      this.originalVisibleItems = Array.from(visibleItems).map(li => ({
        key: this.getNavItemKey(li),
        html: li.outerHTML
      }));

      this.originalHiddenItems = Array.from(hiddenItems).map(li => ({
        key: this.getNavItemKey(li),
        html: li.outerHTML
      }));

      log('info', 'Cached original nav order:', this.originalVisibleItems.length, 'visible,', this.originalHiddenItems.length, 'hidden items');
    }

    /**
     * Get a unique key for a navigation item
     */
    getNavItemKey(li) {
      const link = li.querySelector('a');
      if (link) {
        return link.getAttribute('data-i18n-key') || 
               link.getAttribute('href') || 
               link.textContent.trim();
      }
      return li.textContent.trim();
    }

    /**
     * Reverse navigation items for RTL display
     */
    reverseNavigationForRTL() {
      const visibleLinks = document.querySelector('.greedy-nav .visible-links');
      const hiddenLinks = document.querySelector('.greedy-nav .hidden-links');
      
      if (!visibleLinks) {
        log('warn', 'Could not find .visible-links for RTL reversal');
        return;
      }

      // Prevent observer from triggering during our changes
      this.isReordering = true;

      // Reverse visible links
      this.reverseContainerItems(visibleLinks);
      
      // Reverse hidden links if they exist
      if (hiddenLinks) {
        this.reverseContainerItems(hiddenLinks);
      }

      // Mark as reversed
      visibleLinks.setAttribute('data-rtl-reversed', 'true');
      if (hiddenLinks) {
        hiddenLinks.setAttribute('data-rtl-reversed', 'true');
      }

      log('info', 'Navigation reversed for RTL');

      // Clear reordering flag after DOM settles
      setTimeout(() => {
        this.isReordering = false;
      }, 100);
    }

    /**
     * Reverse the order of li elements within a container
     */
    reverseContainerItems(container) {
      const items = Array.from(container.querySelectorAll(':scope > li'));
      
      if (items.length <= 1) return;

      // Remove all items
      items.forEach(item => item.remove());

      // Re-add in reverse order
      items.reverse().forEach(item => {
        container.appendChild(item);
      });
    }

    /**
     * Restore original LTR order from cached data
     */
    restoreOriginalNavOrder() {
      const visibleLinks = document.querySelector('.greedy-nav .visible-links');
      const hiddenLinks = document.querySelector('.greedy-nav .hidden-links');
      
      if (!visibleLinks) {
        log('warn', 'Could not find .visible-links for LTR restoration');
        return;
      }

      // Prevent observer from triggering during our changes
      this.isReordering = true;

      // Check if we have cached order
      if (this.originalVisibleItems.length === 0) {
        log('warn', 'No cached nav order to restore, attempting simple reversal');
        // Just reverse again to undo
        if (visibleLinks.getAttribute('data-rtl-reversed') === 'true') {
          this.reverseContainerItems(visibleLinks);
          visibleLinks.removeAttribute('data-rtl-reversed');
        }
        if (hiddenLinks && hiddenLinks.getAttribute('data-rtl-reversed') === 'true') {
          this.reverseContainerItems(hiddenLinks);
          hiddenLinks.removeAttribute('data-rtl-reversed');
        }
        setTimeout(() => { this.isReordering = false; }, 100);
        return;
      }

      // Get all current items from both containers
      const allCurrentItems = new Map();
      
      // Collect from visible
      visibleLinks.querySelectorAll(':scope > li').forEach(li => {
        const key = this.getNavItemKey(li);
        allCurrentItems.set(key, li);
      });

      // Collect from hidden
      if (hiddenLinks) {
        hiddenLinks.querySelectorAll(':scope > li').forEach(li => {
          const key = this.getNavItemKey(li);
          allCurrentItems.set(key, li);
        });
      }

      // Clear both containers
      visibleLinks.innerHTML = '';
      if (hiddenLinks) {
        hiddenLinks.innerHTML = '';
      }

      // Rebuild visible links in original order
      this.originalVisibleItems.forEach(cached => {
        const currentLi = allCurrentItems.get(cached.key);
        if (currentLi) {
          visibleLinks.appendChild(currentLi);
          allCurrentItems.delete(cached.key);
        }
      });

      // Rebuild hidden links in original order
      if (hiddenLinks) {
        this.originalHiddenItems.forEach(cached => {
          const currentLi = allCurrentItems.get(cached.key);
          if (currentLi) {
            hiddenLinks.appendChild(currentLi);
            allCurrentItems.delete(cached.key);
          }
        });

        // Any remaining items go to hidden (greedy-nav might have moved them)
        allCurrentItems.forEach(li => {
          hiddenLinks.appendChild(li);
        });
      }

      // Remove reversed markers
      visibleLinks.removeAttribute('data-rtl-reversed');
      if (hiddenLinks) {
        hiddenLinks.removeAttribute('data-rtl-reversed');
      }

      log('info', 'Navigation restored to LTR order');

      // Clear reordering flag after DOM settles
      setTimeout(() => {
        this.isReordering = false;
      }, 100);
    }

    /**
     * Update navigation order based on RTL/LTR mode
     */
    updateNavigationOrder(rtl) {
      if (rtl) {
        this.reverseNavigationForRTL();
      } else {
        this.restoreOriginalNavOrder();
      }
    }

    /**
     * Setup MutationObserver to watch for greedy-nav plugin changes
     * The greedy-nav plugin moves items between visible-links and hidden-links on resize
     * We need to re-apply RTL reversal after it does this
     */
    setupNavObserver() {
      const visibleLinks = document.querySelector('.greedy-nav .visible-links');
      const hiddenLinks = document.querySelector('.greedy-nav .hidden-links');
      
      if (!visibleLinks) {
        log('warn', 'Could not find .visible-links for observer setup');
        return;
      }

      // Disconnect existing observer if any
      this.disconnectNavObserver();

      // Create new observer
      this.navObserver = new MutationObserver((mutations) => {
        // Ignore if we're the ones doing the reordering
        if (this.isReordering) return;

        // Check if children were added/removed (greedy-nav plugin activity)
        const hasChildChanges = mutations.some(m => 
          m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)
        );
        
        if (hasChildChanges && isRTL(this.currentLang)) {
          log('info', 'Greedy-nav changed items, re-applying RTL order');
          
          // Small delay to let greedy-nav finish its work
          setTimeout(() => {
            // Reset the reversed flags
            visibleLinks.removeAttribute('data-rtl-reversed');
            if (hiddenLinks) {
              hiddenLinks.removeAttribute('data-rtl-reversed');
            }
            this.reverseNavigationForRTL();
          }, 50);
        }
      });

      // Observe both visible and hidden links containers
      const observerConfig = { childList: true, subtree: false };
      
      this.navObserver.observe(visibleLinks, observerConfig);
      if (hiddenLinks) {
        this.navObserver.observe(hiddenLinks, observerConfig);
      }

      log('info', 'Navigation observer setup complete');
    }

    /**
     * Disconnect the navigation observer (cleanup)
     */
    disconnectNavObserver() {
      if (this.navObserver) {
        this.navObserver.disconnect();
        this.navObserver = null;
        log('info', 'Navigation observer disconnected');
      }
    }

    // ============================================================
    // LANGUAGE APPLICATION
    // ============================================================

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
      const previousLang = this.currentLang;
      const wasRTL = isRTL(previousLang);

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
      // 4. UPDATE NAVIGATION ORDER (RTL FIX)
      // Only if direction actually changed and DOM is ready
      // --------------------------------------------------------
      if (this.initialized && rtl !== wasRTL) {
        this.updateNavigationOrder(rtl);
      }

      // --------------------------------------------------------
      // 5. SAVE PREFERENCE
      // --------------------------------------------------------
      try {
        localStorage.setItem(CONFIG.storageKey, lang);
      } catch (e) {
        log('warn', 'Could not save language preference:', e.message);
      }

      // --------------------------------------------------------
      // 6. UPDATE STATE
      // --------------------------------------------------------
      this.currentLang = lang;

      // --------------------------------------------------------
      // 7. BROADCAST CHANGE EVENT
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

      // Handle window resize (greedy-nav plugin triggers)
      // Debounced to avoid excessive calls
      window.addEventListener('resize', () => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
          if (isRTL(this.currentLang)) {
            const visibleLinks = document.querySelector('.greedy-nav .visible-links');
            const hiddenLinks = document.querySelector('.greedy-nav .hidden-links');
            
            // Reset reversed flags so we can re-apply
            if (visibleLinks) {
              visibleLinks.removeAttribute('data-rtl-reversed');
            }
            if (hiddenLinks) {
              hiddenLinks.removeAttribute('data-rtl-reversed');
            }
            
            this.reverseNavigationForRTL();
          }
        }, 250);
      });

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        this.destroy();
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

    /**
     * Cleanup method for proper teardown
     */
    destroy() {
      // Clear any pending timeouts
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }

      // Disconnect observer
      this.disconnectNavObserver();

      // Reset state
      this.isReordering = false;

      log('info', 'Language manager destroyed');
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

    /**
     * Force re-apply navigation order (useful for external calls)
     */
    refreshNavigationOrder() {
      this.updateNavigationOrder(isRTL(this.currentLang));
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  // Create global instance
  window.languageManager = new UnifiedLanguageManager();

  // Also expose as window.i18n for compatibility with unified-i18n.js
  window.i18n = window.languageManager;

  log('info', 'Language handler v3.1.0 ready. Use window.languageManager or window.i18n');

})();