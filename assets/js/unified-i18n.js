/**
 * Unified I18n System for JobsInIraq
 * Enhanced with Smart Fallback, Fuzzy Matching & Translation Tracking
 * @version 5.0.0 - PRODUCTION READY
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
    defaultLang: 'en',
    devMode: false // Set to true to track missing translations
  };
  
  class UnifiedI18nManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.jobTitlesLoaded = false;
      this.jobTitlesCache = {}; // Store loaded job titles
      this.translationCache = new Map(); // Performance cache
      this.missingTranslations = new Map(); // Track missing keys
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
      
      // Expose missing translations in dev mode
      if (CONFIG.devMode) {
        window.getMissingTranslations = () => {
          return Object.fromEntries(this.missingTranslations);
        };
      }
    }
    
    /**
     * Load job titles from Jekyll injection or fallback sources
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
     * ✅ ENHANCED: Translate job title with multi-layer fallback
     */
    translateJobTitle(title) {
      if (!title || title === "—" || title === "" || title === null) {
        return title;
      }
      
      // Check cache first (performance optimization)
      const cacheKey = `${this.currentLang}:${title}`;
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey);
      }
      
      let result = null;
      
      // LAYER 1: Exact match in current language
      result = this.exactMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }
      
      // LAYER 2: Fuzzy match (handle variations)
      result = this.fuzzyMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }
      
      // LAYER 3: Partial match (e.g., "Senior Software Engineer" → "Software Engineer")
      result = this.partialMatch(title);
      if (result) {
        this.translationCache.set(cacheKey, result);
        return result;
      }
      
      // LAYER 4: Fallback to English (if not already English)
      if (this.currentLang !== 'en') {
        result = this.englishFallback(title);
        if (result) {
          this.translationCache.set(cacheKey, result);
          return result;
        }
      }
      
      // LAYER 5: Track missing translation
      this.trackMissing(title);
      
      // LAYER 6: Return original title (final fallback)
      this.translationCache.set(cacheKey, title);
      return title;
    }
    
    /**
     * ✅ NEW: Exact match translation
     */
    exactMatch(title) {
      const key = this.titleToKey(title);
      const fullKey = `job_titles.${key}`;
      const translated = this.t(fullKey);
      
      return (translated && translated !== fullKey) ? translated : null;
    }
    
    /**
     * ✅ NEW: Fuzzy match for common variations
     */
    fuzzyMatch(title) {
      const key = this.titleToKey(title);
      
      // Common variations and synonyms
      const fuzzyMappings = {
        // Abbreviations
        'qa_test': 'qa_tester',
        'qa': 'qa_tester',
        'quality_assurance': 'qa_engineer',
        'db_admin': 'database_administrator',
        'dba': 'database_administrator',
        'sys_admin': 'systems_administrator',
        'sysadmin': 'systems_administrator',
        'net_admin': 'network_administrator',
        'netadmin': 'network_administrator',
        
        // Developer variations
        'dev': 'developer',
        'software_dev': 'software_developer',
        'web_dev': 'web_developer',
        'frontend_dev': 'frontend_developer',
        'backend_dev': 'backend_developer',
        'fullstack_dev': 'fullstack_developer',
        
        // Engineer variations
        'sw_engineer': 'software_engineer',
        'swe': 'software_engineer',
        
        // Management variations
        'mgr': 'manager',
        'proj_mgr': 'project_manager',
        'pm': 'project_manager',
        'hr_mgr': 'hr_manager',
        
        // Other common variations
        'admin': 'administrator',
        'exec': 'executive',
        'specialist': 'specialist',
        'coord': 'coordinator',
        'rep': 'representative',
        'cust_service': 'customer_service_representative',
        'cust_support': 'customer_support_representative',
        'sales_exec': 'sales_executive',
        'sales_rep': 'sales_associate',
        'content_write': 'content_writer',
        'graphic_design': 'graphic_designer'
      };
      
      // Try direct fuzzy match
      for (const [pattern, replacement] of Object.entries(fuzzyMappings)) {
        if (key === pattern || key.includes(pattern)) {
          const fuzzyKey = `job_titles.${replacement}`;
          const translated = this.t(fuzzyKey);
          if (translated && translated !== fuzzyKey) {
            if (CONFIG.devMode) {
              console.log(`[i18n] Fuzzy match: "${title}" → "${replacement}"`);
            }
            return translated;
          }
        }
      }
      
      return null;
    }
    
    /**
     * ✅ NEW: Partial match for titles with prefixes/suffixes
     * Example: "Senior Software Engineer" matches "Software Engineer"
     */
    partialMatch(title) {
      const currentLangTitles = this.jobTitlesCache[this.currentLang] || {};
      const titleLower = title.toLowerCase();
      
      // Common prefixes to strip
      const prefixes = ['senior', 'junior', 'lead', 'principal', 'staff', 'associate', 'assistant', 'chief'];
      const suffixes = ['i', 'ii', 'iii', 'iv', 'v', '1', '2', '3', '4', '5'];
      
      // Try matching with stripped prefixes/suffixes
      for (const [key, translation] of Object.entries(currentLangTitles)) {
        const cleanTitle = key.replace(/_/g, ' ');
        
        // Check if title contains the job title
        if (titleLower.includes(cleanTitle) || cleanTitle.includes(titleLower.replace(/\b(senior|junior|lead|principal|staff|associate|assistant|chief)\b/gi, '').trim().toLowerCase())) {
          if (CONFIG.devMode) {
            console.log(`[i18n] Partial match: "${title}" → "${key}"`);
          }
          return translation;
        }
      }
      
      return null;
    }
    
    /**
     * ✅ NEW: Fallback to English translation
     */
    englishFallback(title) {
      const key = this.titleToKey(title);
      const englishTitle = this.jobTitlesCache['en']?.[key];
      
      if (englishTitle) {
        if (CONFIG.devMode) {
          console.log(`[i18n] English fallback: "${title}" → "${englishTitle}"`);
        }
        return englishTitle;
      }
      
      return null;
    }
    
    /**
     * ✅ NEW: Track missing translations
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
        
        // Log in development mode
        if (CONFIG.devMode) {
          console.warn(`[i18n] Missing translation: "${title}" (key: ${key}, lang: ${this.currentLang})`);
        }
        
        // Store in localStorage for later review
        const stored = JSON.parse(localStorage.getItem('i18n_missing') || '{}');
        stored[key] = {
          title,
          key,
          lang: this.currentLang,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('i18n_missing', JSON.stringify(stored));
      } else {
        // Increment count
        const entry = this.missingTranslations.get(key);
        entry.count++;
      }
    }
    
    /**
     * Convert job title string to translation key
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
    
    /**
     * ✅ NEW: Clear translation cache (call when language changes)
     */
    clearCache() {
      this.translationCache.clear();
      if (CONFIG.devMode) {
        console.log('[i18n] Translation cache cleared');
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
      
      // Clear cache when language changes
      this.clearCache();
      
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
  window.translateJobTitle = (title) => manager.translateJobTitle(title);
  
  // ✅ NEW: Development utilities
  if (CONFIG.devMode) {
    window.i18nDebug = {
      getMissingTranslations: () => Object.fromEntries(manager.missingTranslations),
      clearCache: () => manager.clearCache(),
      getCacheSize: () => manager.translationCache.size,
      testTranslation: (title) => {
        console.group(`Testing translation: "${title}"`);
        console.log('Key:', manager.titleToKey(title));
        console.log('Exact match:', manager.exactMatch(title));
        console.log('Fuzzy match:', manager.fuzzyMatch(title));
        console.log('Partial match:', manager.partialMatch(title));
        console.log('English fallback:', manager.englishFallback(title));
        console.log('Final result:', manager.translateJobTitle(title));
        console.groupEnd();
      }
    };
  }
  
})();
