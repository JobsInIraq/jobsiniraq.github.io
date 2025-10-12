/**
 * AI Translation Service for Job Titles
 * Uses LibreTranslate (free, no API key needed for basic use)
 */

class AITranslator {
  constructor() {
    this.cache = this.loadCache();
    this.apiUrl = 'https://libretranslate.com/translate';
    this.fallbackEnabled = true;
  }

  /**
   * Load cached translations from localStorage
   */
  loadCache() {
    try {
      const cached = localStorage.getItem('job_translations');
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
      return {};
    }
  }

  /**
   * Save translations to localStorage
   */
  saveCache() {
    try {
      localStorage.setItem('job_translations', JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(text, targetLang) {
    return `${text}|${targetLang}`;
  }

  /**
   * Main translation function
   */
  async translate(text, targetLang) {
    // Don't translate if already in target language
    if (targetLang === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, targetLang);
    if (this.cache[cacheKey]) {
      console.log(`✅ Using cached translation: "${text}" → "${this.cache[cacheKey]}"`);
      return this.cache[cacheKey];
    }

    // Try LibreTranslate API
    try {
      const translation = await this.callLibreTranslate(text, targetLang);
      
      // Cache the result
      this.cache[cacheKey] = translation;
      this.saveCache();
      
      console.log(`🤖 AI Translation: "${text}" → "${translation}" (${targetLang})`);
      return translation;
      
    } catch (error) {
      console.error('Translation failed:', error);
      
      // Fallback: return original text
      if (this.fallbackEnabled) {
        console.warn(`⚠️ Showing original text: "${text}"`);
        return text;
      }
      
      throw error;
    }
  }

  /**
   * Call LibreTranslate API
   */
  async callLibreTranslate(text, targetLang) {
    // LibreTranslate uses different codes for Kurdish
    const langMap = {
      'ar': 'ar',    // Arabic
      'ckb': 'ar',   // Kurdish → use Arabic (LibreTranslate limitation)
      'en': 'en'     // English
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: langMap[targetLang] || 'ar',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(texts, targetLang) {
    const results = [];
    
    for (const text of texts) {
      const translation = await this.translate(text, targetLang);
      results.push(translation);
      
      // Small delay to avoid rate limiting
      await this.sleep(100);
    }
    
    return results;
  }

  /**
   * Helper: sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {};
    localStorage.removeItem('job_translations');
    console.log('✅ Translation cache cleared');
  }

  /**
   * Export cache as YAML for manual review
   */
  exportCacheAsYAML(lang) {
    const entries = Object.entries(this.cache)
      .filter(([key]) => key.endsWith(`|${lang}`))
      .map(([key, value]) => {
        const originalText = key.split('|')[0];
        const yamlKey = this.textToYAMLKey(originalText);
        return `${yamlKey}: "${value}"`;
      });

    const yaml = entries.join('\n');
    console.log(`\n# AI Translations for ${lang}:\n${yaml}\n`);
    return yaml;
  }

  /**
   * Convert text to YAML key format
   */
  textToYAMLKey(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove special chars
      .replace(/\s+/g, '_')      // Spaces to underscores
      .replace(/_+/g, '_')       // Collapse multiple underscores
      .replace(/^_|_$/g, '');    // Trim underscores
  }
}

// Initialize global instance
window.aiTranslator = new AITranslator();

console.log('✅ AI Translator loaded successfully');
