const https = require('https');
const http = require('http');

async function validateImage(url) {
  if (!url) return { valid: false, reason: 'No URL provided' };
  
  const client = url.startsWith('https') ? https : http;
  
  return new Promise((resolve) => {
    try {
      const req = client.get(url, { headers: { 'User-Agent': 'Lumina/1.0' } }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const contentType = res.headers['content-type'] || '';
          if (contentType.startsWith('image/')) {
            resolve({ valid: true, statusCode: res.statusCode, contentType });
          } else {
            resolve({ valid: false, reason: 'Not an image', contentType });
          }
        } else {
          resolve({ valid: false, reason: `HTTP ${res.statusCode}` });
        }
      });
      
      req.on('error', (err) => {
        resolve({ valid: false, reason: err.message });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ valid: false, reason: 'Timeout' });
      });
    } catch (e) {
      resolve({ valid: false, reason: e.message });
    }
  });
}

module.exports = { validateImage };
