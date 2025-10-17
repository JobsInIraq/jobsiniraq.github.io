/**
 * ============================================
 * JOBS IN IRAQ - SEARCH & FILTER SYSTEM
 * ============================================
 * Purpose: Real-time search and filtering for job resources
 * Version: 1.0.0
 * Compatibility: All modern browsers
 * Dependencies: None (vanilla JavaScript)
 * 
 * Features:
 * - Real-time search by name/keyword
 * - Filter by language
 * - Filter by type (portal/agency/group)
 * - Filter by region
 * - Highlight matching results
 * - Mobile responsive
 * 
 * Usage:
 * 1. Import in HTML: <script src="/assets/js/search-filter.js"></script>
 * 2. Initialize: new SearchFilterSystem()
 * 3. Data auto-loads from page tables
 * ============================================
 */

class SearchFilterSystem {
  constructor(options = {}) {
    // Configuration
    this.options = {
      searchInputId: options.searchInputId || 'search-input',
      filterLanguageId: options.filterLanguageId || 'filter-language',
      filterTypeId: options.filterTypeId || 'filter-type',
      filterRegionId: options.filterRegionId || 'filter-region',
      resetBtnId: options.resetBtnId || 'reset-filters-btn',
      tableSelector: options.tableSelector || '.table-modern',
      minChars: options.minChars || 2,
      caseSensitive: options.caseSensitive || false,
      highlightMatches: options.highlightMatches || true,
      ...options
    };

    // State
    this.state = {
      searchTerm: '',
      selectedLanguage: '',
      selectedType: '',
      selectedRegion: '',
      originalData: [],
      filteredData: [],
      totalResults: 0
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the search/filter system
   */
  init() {
    console.log('[SearchFilter] Initializing...');
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup: Get DOM elements and attach event listeners
   */
  setup() {
    console.log('[SearchFilter] Setting up DOM elements and events...');

    // Get DOM elements
    this.searchInput = document.getElementById(this.options.searchInputId);
    this.filterLanguage = document.getElementById(this.options.filterLanguageId);
    this.filterType = document.getElementById(this.options.filterTypeId);
    this.filterRegion = document.getElementById(this.options.filterRegionId);
    this.resetBtn = document.getElementById(this.options.resetBtnId);
    this.tables = document.querySelectorAll(this.options.tableSelector);

    // Check if all required elements exist
    if (!this.searchInput && !this.filterLanguage && !this.filterType) {
      console.warn('[SearchFilter] No search/filter elements found on page');
      return;
    }

    // Extract data from tables
    this.extractTableData();

    // Attach event listeners
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
      this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
    }

    if (this.filterLanguage) {
      this.filterLanguage.addEventListener('change', () => this.applyFilters());
    }

    if (this.filterType) {
      this.filterType.addEventListener('change', () => this.applyFilters());
    }

    if (this.filterRegion) {
      this.filterRegion.addEventListener('change', () => this.applyFilters());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // Populate filter dropdowns
    this.populateFilterOptions();

    console.log('[SearchFilter] Setup complete. Ready to search!');
  }

  /**
   * Extract data from all tables on the page
   */
  extractTableData() {
    console.log('[SearchFilter] Extracting data from tables...');

    this.state.originalData = [];
    let dataCount = 0;

    this.tables.forEach((table, tableIndex) => {
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;

        // Extract cell data
        const rowData = {
          id: `row-${tableIndex}-${dataCount}`,
          name: cells[0]?.textContent?.trim() || '',
          category: cells[1]?.textContent?.trim() || '',
          language: cells[2]?.textContent?.trim() || cells[1]?.textContent?.trim() || '',
          website: cells[3]?.textContent?.trim() || cells[2]?.textContent?.trim() || '',
          social: cells[4]?.textContent?.trim() || cells[3]?.textContent?.trim() || '',
          type: this.determineType(cells[1]?.textContent?.trim() || ''),
          region: this.determineRegion(cells[0]?.textContent?.trim() || ''),
          tableIndex: tableIndex,
          rowElement: row,
          originalHTML: row.innerHTML
        };

        this.state.originalData.push(rowData);
        dataCount++;
      });
    });

    console.log(`[SearchFilter] Extracted ${this.state.originalData.length} rows from tables`);
  }

  /**
   * Determine type from category/text
   */
  determineType(text) {
    text = text.toLowerCase();
    if (text.includes('portal')) return 'Portal';
    if (text.includes('agency') || text.includes('recruitment')) return 'Agency';
    if (text.includes('group') || text.includes('community') || text.includes('chat')) return 'Community';
    if (text.includes('remote') || text.includes('online')) return 'Remote';
    if (text.includes('intern')) return 'Internship';
    if (text.includes('volunteer')) return 'Volunteer';
    return 'Other';
  }

  /**
   * Determine region from name/text
   */
  determineRegion(text) {
    text = text.toLowerCase();
    if (text.includes('erbil') || text.includes('irbil') || text.includes('arbil')) return 'Erbil';
    if (text.includes('baghdad')) return 'Baghdad';
    if (text.includes('basra') || text.includes('basrah')) return 'Basra';
    if (text.includes('kurdistan') || text.includes('krg') || text.includes('krd')) return 'Kurdistan';
    if (text.includes('mosul')) return 'Mosul';
    if (text.includes('sulaimani') || text.includes('slemani')) return 'Sulaimani';
    if (text.includes('nationwide') || text.includes('iraq')) return 'Nationwide';
    return 'All Regions';
  }

  /**
   * Populate filter dropdown options
   */
  populateFilterOptions() {
    console.log('[SearchFilter] Populating filter options...');

    // Get unique languages
    const languages = new Set();
    languages.add(''); // Empty option
    this.state.originalData.forEach(item => {
      if (item.language) {
        // Handle comma-separated languages
        item.language.split(',').forEach(lang => {
          lang = lang.trim();
          if (lang && lang !== 'N/A') languages.add(lang);
        });
      }
    });

    // Get unique types
    const types = new Set();
    types.add('');
    this.state.originalData.forEach(item => types.add(item.type));

    // Get unique regions
    const regions = new Set();
    regions.add('');
    this.state.originalData.forEach(item => regions.add(item.region));

    // Populate language filter
    if (this.filterLanguage) {
      this.filterLanguage.innerHTML = '<option value="">All Languages</option>';
      languages.forEach(lang => {
        if (lang) {
          const option = document.createElement('option');
          option.value = lang;
          option.textContent = lang;
          this.filterLanguage.appendChild(option);
        }
      });
    }

    // Populate type filter
    if (this.filterType) {
      this.filterType.innerHTML = '<option value="">All Types</option>';
      types.forEach(type => {
        if (type && type !== 'Other') {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          this.filterType.appendChild(option);
        }
      });
    }

    // Populate region filter
    if (this.filterRegion) {
      this.filterRegion.innerHTML = '<option value="">All Regions</option>';
      regions.forEach(region => {
        if (region && region !== 'All Regions') {
          const option = document.createElement('option');
          option.value = region;
          option.textContent = region;
          this.filterRegion.appendChild(option);
        }
      });
    }

    console.log('[SearchFilter] Filter options populated');
  }

  /**
   * Handle search input in real-time
   */
  handleSearch(event) {
    this.state.searchTerm = event.target.value;
    this.applyFilters();
  }

  /**
   * Handle search keydown (Enter to search)
   */
  handleSearchKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.applyFilters();
    }
  }

  /**
   * Apply all filters and search
   */
  applyFilters() {
    console.log('[SearchFilter] Applying filters...');

    // Reset filtered data
    this.state.filteredData = [...this.state.originalData];

    // Apply search filter
    if (this.state.searchTerm.length >= this.options.minChars) {
      this.state.filteredData = this.state.filteredData.filter(item =>
        this.matchesSearch(item, this.state.searchTerm)
      );
    }

    // Apply language filter
    if (this.state.selectedLanguage) {
      this.state.filteredData = this.state.filteredData.filter(item =>
        item.language.toLowerCase().includes(this.state.selectedLanguage.toLowerCase())
      );
    }

    // Apply type filter
    if (this.state.selectedType) {
      this.state.filteredData = this.state.filteredData.filter(item =>
        item.type === this.state.selectedType
      );
    }

    // Apply region filter
    if (this.state.selectedRegion) {
      this.state.filteredData = this.state.filteredData.filter(item =>
        item.region === this.state.selectedRegion
      );
    }

    // Update UI
    this.updateTableDisplay();
    this.updateResultsCounter();

    console.log(`[SearchFilter] Filtered to ${this.state.filteredData.length} results`);
  }

  /**
   * Check if item matches search term
   */
  matchesSearch(item, searchTerm) {
    const term = this.options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const searchFields = [item.name, item.category, item.language, item.website];
    
    return searchFields.some(field => {
      const fieldValue = this.options.caseSensitive ? field : field.toLowerCase();
      return fieldValue.includes(term);
    });
  }

  /**
   * Update table display to show/hide rows
   */
  updateTableDisplay() {
    // Hide all rows
    this.state.originalData.forEach(item => {
      item.rowElement.style.display = 'none';
      item.rowElement.classList.remove('search-highlight');
    });

    // Show filtered rows
    this.state.filteredData.forEach(item => {
      item.rowElement.style.display = '';
      
      // Highlight if searching
      if (this.state.searchTerm.length >= this.options.minChars && this.options.highlightMatches) {
        item.rowElement.classList.add('search-highlight');
      }
    });

    console.log('[SearchFilter] Table display updated');
  }

  /**
   * Update results counter
   */
  updateResultsCounter() {
    const counter = document.getElementById('result-count') ||
                   document.querySelector('[data-result-count]');
    
    if (counter) {
      const count = this.state.filteredData.length;
      const total = this.state.originalData.length;
      counter.textContent = `Showing ${count} of ${total} results`;
      counter.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Get current filter values from dropdowns
   */
  getFilterValues() {
    if (this.filterLanguage) this.state.selectedLanguage = this.filterLanguage.value;
    if (this.filterType) this.state.selectedType = this.filterType.value;
    if (this.filterRegion) this.state.selectedRegion = this.filterRegion.value;
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    console.log('[SearchFilter] Resetting filters...');

    this.state.searchTerm = '';
    this.state.selectedLanguage = '';
    this.state.selectedType = '';
    this.state.selectedRegion = '';

    if (this.searchInput) this.searchInput.value = '';
    if (this.filterLanguage) this.filterLanguage.value = '';
    if (this.filterType) this.filterType.value = '';
    if (this.filterRegion) this.filterRegion.value = '';

    this.state.filteredData = [...this.state.originalData];
    this.updateTableDisplay();
    this.updateResultsCounter();

    console.log('[SearchFilter] Filters reset');
  }

  /**
   * Get filtered results (for external use)
   */
  getFilteredResults() {
    return this.state.filteredData;
  }

  /**
   * Get statistics about current filters
   */
  getStatistics() {
    return {
      totalResources: this.state.originalData.length,
      filteredResources: this.state.filteredData.length,
      searchTerm: this.state.searchTerm,
      selectedLanguage: this.state.selectedLanguage,
      selectedType: this.state.selectedType,
      selectedRegion: this.state.selectedRegion,
      filterApplied: !!(this.state.searchTerm || this.state.selectedLanguage || 
                       this.state.selectedType || this.state.selectedRegion)
    };
  }
}

/**
 * Auto-initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if search elements exist on page
    if (document.getElementById('search-input') || 
        document.getElementById('filter-language') ||
        document.getElementById('filter-type')) {
      window.searchFilter = new SearchFilterSystem();
    }
  });
} else {
  if (document.getElementById('search-input') || 
      document.getElementById('filter-language') ||
      document.getElementById('filter-type')) {
    window.searchFilter = new SearchFilterSystem();
  }
}