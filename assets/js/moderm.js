// ============================================
// JOBS IN IRAQ - MODERN INTERACTIONS
// Phase 1: Accessibility & Enhancement
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Jobs in Iraq modernization loaded');
    initLanguageSwitcher();
    initAccessibility();
    initTableEnhancements();
});

// ============================================
// LANGUAGE SWITCHER
// ============================================

function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            langButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            const selectedLang = this.getAttribute('data-lang');
            
            // Store preference in localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('jobsIraqLang', selectedLang);
            }
            
            console.log('Language selected:', selectedLang);
            
            // Announce change to screen readers
            announceToScreenReader(`Language changed to ${selectedLang}`);
        });
    });
    
    // Load saved language preference
    if (typeof(Storage) !== "undefined") {
        const savedLang = localStorage.getItem('jobsIraqLang');
        if (savedLang) {
            const savedButton = document.querySelector(`[data-lang="${savedLang}"]`);
            if (savedButton) {
                savedButton.click();
            }
        }
    }
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

function initAccessibility() {
    // Add keyboard navigation to tables
    const tables = document.querySelectorAll('.resource-table');
    
    tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach((row, rowIndex) => {
            row.setAttribute('tabindex', '0');
            row.setAttribute('role', 'row');
            
            // Highlight row on focus
            row.addEventListener('focus', function() {
                this.style.backgroundColor = '#DBEAFE';
                this.style.boxShadow = 'inset 3px 0 0 #2563EB';
            });
            
            row.addEventListener('blur', function() {
                this.style.boxShadow = 'none';
                // Reset to normal alternating colors
                if (rowIndex % 2 === 0) {
                    this.style.backgroundColor = '#F9FAFB';
                } else {
                    this.style.backgroundColor = 'white';
                }
            });
            
            // Allow Enter/Space to focus first link in row
            row.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const firstLink = this.querySelector('a');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
                
                // Arrow key navigation
                if (e.key === 'ArrowDown' && rowIndex < rows.length - 1) {
                    e.preventDefault();
                    rows[rowIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && rowIndex > 0) {
                    e.preventDefault();
                    rows[rowIndex - 1].focus();
                }
            });
        });
    });
    
    // Add live region for screen readers
    const mainContent = document.querySelector('main') || document.body;
    if (mainContent && !mainContent.hasAttribute('aria-live')) {
        mainContent.setAttribute('aria-live', 'polite');
        mainContent.setAttribute('aria-atomic', 'false');
    }
    
    // Ensure all images have alt text (if any)
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        img.setAttribute('alt', 'Decorative image');
    });
}

// ============================================
// TABLE ENHANCEMENTS
// ============================================

function initTableEnhancements() {
    const tables = document.querySelectorAll('.resource-table');
    
    tables.forEach(table => {
        // Add proper ARIA attributes
        table.setAttribute('role', 'table');
        const thead = table.querySelector('thead');
        if (thead) {
            thead.setAttribute('role', 'rowgroup');
        }
        
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.setAttribute('role', 'rowgroup');
        }
        
        // Enhance headers
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
            if (!header.hasAttribute('scope')) {
                header.setAttribute('scope', 'col');
            }
            header.setAttribute('role', 'columnheader');
        });
        
        // Add alternating row colors
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.setAttribute('role', 'row');
            
            if (index % 2 === 0) {
                row.style.backgroundColor = '#F9FAFB';
            }
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function announceToScreenReader(message) {
    // Create a temporary ARIA live region
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

window.addEventListener('load', function() {
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`✅ Page load time: ${pageLoadTime}ms`);
    }
});

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', function(event) {
    console.error('Error:', event.error);
});

// ============================================
// PRINT SUPPORT
// ============================================

function setupPrintStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .header, .hero, .footer { display: none; }
            .resource-table { page-break-inside: avoid; }
        }
    `;
    document.head.appendChild(style);
}

setupPrintStyles();

console.log('✅ All Jobs in Iraq enhancements loaded successfully');