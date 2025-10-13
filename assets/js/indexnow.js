/**
 * IndexNow API Integration for JobsInIraq GitHub Pages
 * Uses Image Beacon method to avoid CORS restrictions
 * API Key: 41d854e0758d4af59be6d8431f5d5df6
 * @version 2.0.0 - Production Ready
 */

const INDEXNOW_API_KEY = '41d854e0758d4af59be6d8431f5d5df6';
const SITE_DOMAIN = 'jobsiniraq.github.io';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Submit URL to IndexNow using image beacon (bypasses CORS)
 */
async function submitToIndexNow(pageUrl) {
  if (!pageUrl.includes(SITE_DOMAIN)) {
    console.warn('⚠️ IndexNow: URL must be on domain:', SITE_DOMAIN);
    return false;
  }

  const keyLocation = `https://${SITE_DOMAIN}/${INDEXNOW_API_KEY}.txt`;
  const requestUrl = `${INDEXNOW_ENDPOINT}?url=${encodeURIComponent(pageUrl)}&key=${INDEXNOW_API_KEY}&keyLocation=${encodeURIComponent(keyLocation)}`;

  try {
    // Image beacon method - no CORS issues
    const img = new Image();
    img.src = requestUrl;
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ IndexNow: URL submitted -', pageUrl);
    return true;
  } catch (error) {
    console.error('❌ IndexNow: Error -', error.message);
    return false;
  }
}

/**
 * Initialize and auto-submit current page
 */
function initIndexNow() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', submitCurrentPage);
  } else {
    submitCurrentPage();
  }
}

function submitCurrentPage() {
  const currentUrl = window.location.href;
  
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
    console.log('ℹ️ IndexNow: Skipped (localhost)');
    return;
  }

  setTimeout(() => {
    submitToIndexNow(currentUrl);
  }, 2000);
}

initIndexNow();
window.submitToIndexNow = submitToIndexNow;