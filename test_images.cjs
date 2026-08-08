const https = require('https');
const queries = ['AirPods Pro', 'Bose QuietComfort 45', 'Google Pixel 8', 'Amazon Echo Dot'];

function fetchImage(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&format=json&pithumbsize=960`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const pages = json.query.pages;
        let img = '';
        for (let key in pages) {
          if (pages[key].thumbnail) {
            img = pages[key].thumbnail.source;
            break;
          }
        }
        console.log(query, '->', img);
      } catch (e) {
        console.log(query, '-> error parsing');
      }
    });
  }).on('error', (e) => {
    console.log(query, '->', e.message);
  });
}

queries.forEach(fetchImage);
