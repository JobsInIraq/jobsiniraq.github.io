// Add your IndexNow API key here
const apiKey = '03c458b0ef1f4c6ea23af5cd522bce7a'; // Your IndexNow API key
const url = 'https://www.indexnow.org/api/indexnow';

// Function to notify IndexNow about content update
function notifyIndexNow(pageUrl) {
  const payload = {
    key: apiKey,
    url: pageUrl,
    notifyMode: "URL_UPDATED"
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    console.log('IndexNow notification success:', data);
  })
  .catch(error => {
    console.error('Error notifying IndexNow:', error);
  });
}

// Automatically notify when page loads (example)
window.addEventListener('load', function() {
  notifyIndexNow(window.location.href);
});
