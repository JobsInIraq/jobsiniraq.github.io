# ============================================
# Translation Filter for Jekyll
# Accesses YAML data files efficiently
# Performance: O(1) lookup, no JavaScript needed
# ============================================



module Jekyll
  module TranslateFilter
    SUPPORTED_LANGS = ['en', 'ar', 'ku'].freeze

    def t(key, lang = nil)
      current_lang = normalize_lang(lang || page_lang)
      site_data = Jekyll.sites[0].data

      # Check ui_text
      value = dig_data(site_data['ui_text']&.[](current_lang.to_s), key.split('.'))
      return value if value

      # Check job_titles
      value = site_data['job_titles']&.[](current_lang.to_s)&.[](key.to_s)
      value || key
    end

    def t_job(title, lang = nil)
      current_lang = normalize_lang(lang || page_lang)
      site_data = Jekyll.sites[0].data
      site_data['job_titles']&.[](current_lang.to_s)&.[](title.to_s) || title
    end

    private

    def normalize_lang(lang)
      SUPPORTED_LANGS.include?(lang) ? lang : 'en'
    end

    def page_lang
      @context.registers[:page]['lang']
    end

    def dig_data(data, keys)
      keys.reduce(data) { |acc, k| acc&.[](k.to_s) }
    end
  end
end

Liquid::Template.register_filter(Jekyll::TranslateFilter)








# module Jekyll
#   module TranslateFilter
#     def t(key, lang = nil)
#       # Get current language from page or site config
#       current_lang = lang || @context.registers[:page]['lang'] || Jekyll.sites[0].config['lang'] || 'en'
      
#       # Supported languages
#       supported_langs = ['en', 'ar', 'ku']
#       current_lang = 'en' unless supported_langs.include?(current_lang)
      
#       # Split nested keys like "nav.home" → ['nav', 'home']
#       keys = key.split('.')
      
#       # Access site data
#       site = Jekyll.sites[0]
      
#       # Try ui-text first
#       value = site.data['ui_text']&.[current_lang.to_s]
#       keys.each { |k| value = value&.[k.to_s] } if value
      
#       return value if value
      
#       # Try job-titles if not found in ui-text
#       value = site.data['job_titles']&.[current_lang.to_s]&.[key.to_s]
#       return value if value
      
#       # Fallback to key itself if not found
#       key
#     end
    
#     # Shortcut for job title translation
#     def t_job(title, lang = nil)
#       current_lang = lang || @context.registers[:page]['lang'] || 'en'
#       supported_langs = ['en', 'ar', 'ku']
#       current_lang = 'en' unless supported_langs.include?(current_lang)
      
#       site = Jekyll.sites[0]
#       translated = site.data['job_titles']&.[current_lang.to_s]&.[title.to_s]
#       translated || title
#     end
#   end
# end

# Liquid::Template.register_filter(Jekyll::TranslateFilter)
