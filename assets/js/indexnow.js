/**
 * IndexNow API Integration for JobsInIraq GitHub Pages
 * Uses GET method to avoid CORS issues
 * API Key: 41d854e0758d4af59be6d8431f5d5df6
 */

// Your IndexNow API key (32-character hex string)
const INDEXNOW_API_KEY = '41d854e0758d4af59be6d8431f5d5df6';

// Your site domain
const SITE_DOMAIN = 'jobsiniraq.github.io';

// IndexNow API endpoint (using GET to avoid CORS)
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Submit a single URL to IndexNow
 * @param {string} pageUrl - The full URL to submit
 */
async function submitToIndexNow(pageUrl) {
  // Validate URL belongs to your domain
  if (!pageUrl.includes(SITE_DOMAIN)) {
    console.warn('⚠️ IndexNow: URL must be on your domain:', pageUrl);
    return;
  }

  // Build GET request URL with parameters
  const keyLocation = `https://${SITE_DOMAIN}/${INDEXNOW_API_KEY}.txt`;
  const requestUrl = `${INDEXNOW_ENDPOINT}?url=${encodeURIComponent(pageUrl)}&key=${INDEXNOW_API_KEY}&keyLocation=${encodeURIComponent(keyLocation)}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      // No additional headers needed for GET
    });

    // Handle response codes
    if (response.status === 200) {
      console.log('✅ IndexNow: URL submitted successfully -', pageUrl);
    } else if (response.status === 202) {
      console.log('✅ IndexNow: Accepted (key validation pending) -', pageUrl);
    } else if (response.status === 400) {
      console.error('❌ IndexNow: Bad request (check URL format) -', pageUrl);
    } else if (response.status === 403) {
      console.error('❌ IndexNow: Invalid API key or key file not found');
    } else if (response.status === 422) {
      console.error('❌ IndexNow: URL doesn\'t match domain or key mismatch');
    } else if (response.status === 429) {
      console.error('❌ IndexNow: Rate limited (too many requests)');
    } else {
      console.error('❌ IndexNow: Unexpected status -', response.status);
    }

    return response.status;
  } catch (error) {
    console.error('❌ IndexNow: Network error -', error.message);
    return null;
  }
}

/**
 * Auto-submit current page when loaded
 */
function initIndexNow() {
  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', submitCurrentPage);
  } else {
    submitCurrentPage();
  }
}

/**
 * Submit the current page URL
 */
function submitCurrentPage() {
  const currentUrl = window.location.href;
  
  // Only submit on production (GitHub Pages), not localhost
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
    console.log('ℹ️ IndexNow: Skipped (localhost detected)');
    return;
  }

  // Submit after a small delay to avoid blocking page load
  setTimeout(() => {
    submitToIndexNow(currentUrl);
  }, 2000); // 2-second delay
}

// Initialize IndexNow on page load
initIndexNow();

// Export for manual use if needed
window.submitToIndexNow = submitToIndexNow;