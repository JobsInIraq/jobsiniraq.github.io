/**
 * Unified I18n System for JobsInIraq
 * Handles all translations, language switching, and dashboard updates
 * Optimized for performance and future scalability
 * @version 2.0.0
 */

(function() {
  'use strict';
  
  // ============================================
  // CONFIGURATION
  // ============================================
  
  const CONFIG = {
    supportedLangs: ['en', 'ar', 'ckb'],
    rtlLangs: ['ar', 'ckb'],
    storageKey: 'siteLanguage',
    defaultLang: 'en'
  };
  
  // ============================================
  // TRANSLATIONS DATABASE
  // ============================================
  
  const TRANSLATIONS = {
    en: {
      // Navigation
      nav: {
        home: 'Home',
        process: 'Recruitment Process',
        payscale: 'Salary Guide',
        dashboard: 'Dashboard',
        about: 'About',
        jobs: 'Jobs',
        innovation: 'Innovation',
        contact: 'Contact'
      },
      
      // Dashboard
      dashboard: {
        title: 'Payscale Dashboard',
        caption: 'Data source: _data/db/salaries.json. All salaries are monthly unless stated.',
        theme: 'Theme',
        aiInsights: 'AI Insights',
        tableTitle: 'Data Table',
        tableCaption: 'Search, sort, and paginate. Rows are read as-is from _data/db/salaries.json.',
        reset: 'Reset filters',
        export: 'Export CSV',
        exportJson: 'Export JSON',
        print: 'Print view',
        cityLegend: 'City legend',
        categoryLegend: 'Category legend',
        median: 'Median',
        iqr: 'IQR (P25–P75)',
        sample: 'Sample size'
      },
      
      // Common
      common: {
        allCities: 'All cities',
        allCategories: 'All categories',
        allTypes: 'All types',
        allPeriods: 'All periods',
        selectLanguage: 'Select Language',
        results: (n) => `${n} result${n === 1 ? '' : 's'}`
      },
      
      // Table columns
      cols: {
        title: 'Title',
        category: 'Category',
        city: 'City',
        type: 'Type',
        period: 'Period',
        min: 'Min',
        max: 'Max',
        last: 'Last Verified',
        source: 'Source'
      }
    },
    
    ar: {
      nav: {
        home: 'الرئيسية',
        process: 'عملية التوظيف',
        payscale: 'دليل الرواتب',
        dashboard: 'لوحة التحكم',
        about: 'عن الموقع',
        jobs: 'الوظائف',
        innovation: 'الابتكار',
        contact: 'اتصل بنا'
      },
      
      dashboard: {
        title: 'لوحة الأجور',
        caption: 'مصدر البيانات: _data/db/salaries.json. جميع الرواتب شهرية ما لم يُذكر غير ذلك.',
        theme: 'الوضع',
        aiInsights: 'رؤى ذكية',
        tableTitle: 'جدول البيانات',
        tableCaption: 'بحث وفرز وتقسيم للصفحات. يتم قراءة الصفوف كما هي من _data/db/salaries.json.',
        reset: 'إعادة التصفية',
        export: 'تصدير CSV',
        exportJson: 'تصدير JSON',
        print: 'عرض الطباعة',
        cityLegend: 'دليل المدن',
        categoryLegend: 'دليل الفئات',
        median: 'الوسيط',
        iqr: 'المدى بين الرُبعين',
        sample: 'حجم العينة'
      },
      
      common: {
        allCities: 'كل المدن',
        allCategories: 'كل الفئات',
        allTypes: 'كل الأنواع',
        allPeriods: 'كل الفترات',
        selectLanguage: 'اختر اللغة',
        results: (n) => `${n} نتيجة`
      },
      
      cols: {
        title: 'العنوان',
        category: 'الفئة',
        city: 'المدينة',
        type: 'النوع',
        period: 'الفترة',
        min: 'الحد الأدنى',
        max: 'الحد الأقصى',
        last: 'آخر تحديث',
        source: 'المصدر'
      }
    },
    
    ckb: {
      nav: {
        home: 'سەرەتا',
        process: 'پرۆسەی دامەزراندن',
        payscale: 'ڕێبەری مووچە',
        dashboard: 'داشبۆرد',
        about: 'دەربارە',
        jobs: 'کارەکان',
        innovation: 'نوێکاری',
        contact: 'پەیوەندی'
      },
      
      dashboard: {
        title: 'داشبۆڕدی مووچەکان',
        caption: 'سەرچاوەی داتا: _data/db/salaries.json. هەموو مووچەکان مانگانەن.',
        theme: 'دووخور',
        aiInsights: 'ئاگادارییە هۆشیاڕانەکان',
        tableTitle: 'خشتەی داتا',
        tableCaption: 'گەڕان، پۆلەکردن و لاپەڕەکردن. داتاکان وەک خۆیان لە _data/db/salaries.json خوێندراون.',
        reset: 'دووبارەکردنەوە',
        export: 'هەناردەی CSV',
        exportJson: 'هەناردەی JSON',
        print: 'چاپکردن',
        cityLegend: 'ڕێبەری شار',
        categoryLegend: 'ڕێبەری پۆل',
        median: 'ناوەندێتی',
        iqr: 'نێوان چوارەکی یەکەم و سێیەم',
        sample: 'قەبارەی نموونە'
      },
      
      common: {
        allCities: 'هەموو شارەکان',
        allCategories: 'هەموو پۆلەکان',
        allTypes: 'هەموو جۆرەکان',
        allPeriods: 'هەموو ماوەکان',
        selectLanguage: 'هەڵبژاردنی زمان',
        results: (n) => `${n} دەرئەنجام`
      },
      
      cols: {
        title: 'ناونیشان',
        category: 'پۆل',
        city: 'شار',
        type: 'جۆر',
        period: 'ماوە',
        min: 'کەمترین',
        max: 'زۆرترین',
        last: 'دوا نوێکردنەوە',
        source: 'سەرچاوە'
      }
    }
  };
  
  // Category translations
  const CATEGORY_LABELS = {
    en: {
      "IT": "IT",
      "Human Resources": "Human Resources",
      "Procurement": "Procurement",
      "Sales": "Sales",
      "Design": "Design",
      "Engineering": "Engineering",
      "Finance": "Finance",
      "Management": "Management",
      "Marketing": "Marketing",
      "Business": "Business",
      "Customer Service": "Customer Service"
    },
    ar: {
      "IT": "تقنية المعلومات",
      "Human Resources": "الموارد البشرية",
      "Procurement": "المشتريات",
      "Sales": "المبيعات",
      "Design": "التصميم",
      "Engineering": "الهندسة",
      "Finance": "المالية",
      "Management": "الإدارة",
      "Marketing": "التسويق",
      "Business": "الأعمال",
      "Customer Service": "خدمة العملاء"
    },
    ckb: {
      "IT": "IT",
      "Human Resources": "سەرچاوەی مرۆیی",
      "Procurement": "کڕین",
      "Sales": "فرۆشتن",
      "Design": "دیزاین",
      "Engineering": "ئەندازیاری",
      "Finance": "دارایی",
      "Management": "بەڕێوەبردن",
      "Marketing": "بازاڕگەری",
      "Business": "بازرگانی",
      "Customer Service": "خزمەتگوزاری کڕیار"
    }
  };
  
  // City translations
  const CITY_LABELS = {
    en: {
      "Baghdad": "Baghdad",
      "Erbil": "Erbil",
      "Basra": "Basra",
      "Sulaymaniyah": "Sulaymaniyah",
      "Kirkuk": "Kirkuk",
      "Karbala": "Karbala"
    },
    ar: {
      "Baghdad": "بغداد",
      "Erbil": "أربيل",
      "Basra": "البصرة",
      "Sulaymaniyah": "السليمانية",
      "Kirkuk": "كركوك",
      "Karbala": "كربلاء"
    },
    ckb: {
      "Baghdad": "بەغداد",
      "Erbil": "هەولێر",
      "Basra": "بەصرە",
      "Sulaymaniyah": "سلێمانی",
      "Kirkuk": "کەرکوک",
      "Karbala": "کەربەلا"
    }
  };
  
  // Employment type translations
  const TYPE_LABELS = {
    en: {
      "Full-Time": "Full-Time",
      "Part-Time": "Part-Time",
      "Contract": "Contract"
    },
    ar: {
      "Full-Time": "دوام كامل",
      "Part-Time": "دوام جزئي",
      "Contract": "عقد"
    },
    ckb: {
      "Full-Time": "تەواوکات",
      "Part-Time": "کاتی",
      "Contract": "گرێبەست"
    }
  };
  
  // Period translations
  const PERIOD_LABELS = {
    en: {
      "monthly": "monthly",
      "hourly": "hourly",
      "daily": "daily"
    },
    ar: {
      "monthly": "شهري",
      "hourly": "بالساعة",
      "daily": "يومي"
    },
    ckb: {
      "monthly": "مانگانە",
      "hourly": "کاتژمێرێ",
      "daily": "ڕۆژانە"
    }
  };
  
  // ============================================
  // UNIFIED LANGUAGE MANAGER
  // ============================================
  
  class UnifiedI18nManager {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.isDashboardPage = this.checkDashboardPage();
      this.init();
    }
    
    getSavedLanguage() {
      const saved = localStorage.getItem(CONFIG.storageKey);
      return CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
    }
    
    checkDashboardPage() {
      return window.location.pathname.includes('payscale-dashboard');
    }
    
    init() {
      this.applyLanguage(this.currentLang, false);
      this.initializePicker();
      this.setupEventListeners();
      
      // Initialize dashboard if on dashboard page
      if (this.isDashboardPage) {
        this.initDashboard();
      }
    }
    
    // Translation function
    t(key) {
      const keys = key.split('.');
      let value = TRANSLATIONS[this.currentLang];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return typeof value === 'function' ? value : (value || key);
    }
    
    // Translate category
    translateCategory(category) {
      return CATEGORY_LABELS[this.currentLang]?.[category] || category;
    }
    
    // Translate city
    translateCity(city) {
      return CITY_LABELS[this.currentLang]?.[city] || city;
    }
    
    // Translate employment type
    translateType(type) {
      return TYPE_LABELS[this.currentLang]?.[type] || type;
    }
    
    // Translate period
    translatePeriod(period) {
      return PERIOD_LABELS[this.currentLang]?.[period] || period;
    }
    
    // Apply language
    applyLanguage(lang, broadcast = false) {
      if (!CONFIG.supportedLangs.includes(lang)) lang = CONFIG.defaultLang;
      
      // Set HTML attributes
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('data-locale', lang);
      
      // Apply RTL direction
      const isRTL = CONFIG.rtlLangs.includes(lang);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.body.classList.toggle('rtl', isRTL);
      
      // Store language preference
      localStorage.setItem(CONFIG.storageKey, lang);
      this.currentLang = lang;
      
      // Update all translations
      this.updateNavigationTranslations();
      this.updateDataAttributes();
      
      if (this.isDashboardPage) {
        this.updateDashboardTranslations();
      }
      
      // Update picker
      const picker = document.getElementById('globalLangPicker');
      if (picker && picker.value !== lang) {
        picker.value = lang;
      }
      
      // Broadcast change
      if (broadcast) {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { 
            language: lang,
            t: this.t.bind(this),
            translateCategory: this.translateCategory.bind(this),
            translateCity: this.translateCity.bind(this)
          }
        }));
      }
    }
    
    // Update navigation menu
    updateNavigationTranslations() {
      document.querySelectorAll('.greedy-nav .masthead__menu-item a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href === '/' || href === '/index.html') {
          link.textContent = this.t('nav.home');
        } else if (href.includes('/jobs')) {
          link.textContent = this.t('nav.jobs');
        } else if (href.includes('/process')) {
          link.textContent = this.t('nav.process');
        } else if (href.includes('/payscale/') && !href.includes('dashboard')) {
          link.textContent = this.t('nav.payscale');
        } else if (href.includes('/payscale-dashboard')) {
          link.textContent = this.t('nav.dashboard');
        } else if (href.includes('/innovation')) {
          link.textContent = this.t('nav.innovation');
        } else if (href.includes('/about') || href.includes('linkedin.com')) {
          link.textContent = this.t('nav.about');
        } else if (href.includes('/contact')) {
          link.textContent = this.t('nav.contact');
        }
      });
    }
    
    // Update elements with data-i18n attribute
    updateDataAttributes() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = this.t(key);
        
        if (typeof value === 'function') {
          // Skip functions, they need parameters
          return;
        }
        
        el.textContent = value;
      });
    }
    
    // Initialize dashboard
    initDashboard() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.updateDashboardTranslations();
        });
      } else {
        this.updateDashboardTranslations();
      }
    }
    
    // Update dashboard translations
    updateDashboardTranslations() {
      const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      updateText("t.title", this.t('dashboard.title'));
      updateText("t.caption", this.t('dashboard.caption'));
      updateText("t.theme", this.t('dashboard.theme'));
      updateText("t.aiInsights", this.t('dashboard.aiInsights'));
      updateText("t.tableTitle", this.t('dashboard.tableTitle'));
      updateText("t.tableCaption", this.t('dashboard.tableCaption'));
      updateText("t.reset", this.t('dashboard.reset'));
      updateText("t.export", this.t('dashboard.export'));
      updateText("t.exportJson", this.t('dashboard.exportJson'));
      updateText("t.print", this.t('dashboard.print'));
      updateText("t.cityLegend", this.t('dashboard.cityLegend'));
      updateText("t.categoryLegend", this.t('dashboard.categoryLegend'));

      // Update dropdowns
      this.setFirstOption(document.getElementById("f-city"), this.t('common.allCities'));
      this.setFirstOption(document.getElementById("f-category"), this.t('common.allCategories'));
      this.setFirstOption(document.getElementById("f-etype"), this.t('common.allTypes'));
      this.setFirstOption(document.getElementById("f-period"), this.t('common.allPeriods'));
      
      // Trigger dashboard refresh if functions exist
      if (window.populateFilters) window.populateFilters();
      if (window.applyFilters) window.applyFilters();
    }
    
    // Helper: set first option text
    setFirstOption(sel, text) {
      if (sel && sel.options.length) {
        sel.options[0].textContent = text;
      }
    }
    
    // Initialize picker
    initializePicker() {
      const picker = document.getElementById('globalLangPicker');
      if (!picker) return;
      
      picker.value = this.currentLang;
      
      picker.addEventListener('change', (e) => {
        this.applyLanguage(e.target.value, true);
      });
    }
    
    // Setup event listeners
    setupEventListeners() {
      window.addEventListener('languageChanged', (e) => {
        if (e.detail && e.detail.language && e.detail.language !== this.currentLang) {
          this.applyLanguage(e.detail.language, false);
        }
      });
    }
  }
  
  // ============================================
  // INITIALIZE & EXPORT GLOBALLY
  // ============================================
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n = new UnifiedI18nManager();
    });
  } else {
    window.i18n = new UnifiedI18nManager();
  }
  
  // Export global functions for easy access
  window.t = (key) => window.i18n?.t(key) || key;
  window.translateCategory = (cat) => window.i18n?.translateCategory(cat) || cat;
  window.translateCity = (city) => window.i18n?.translateCity(city) || city;
  window.translateType = (type) => window.i18n?.translateType(type) || type;
  window.translatePeriod = (period) => window.i18n?.translatePeriod(period) || period;
  
})();
