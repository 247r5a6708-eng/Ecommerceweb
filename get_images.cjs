const https = require('https');
const queries = ['Levi_501s', 'Chuck_Taylor_All-Stars', 'Rolex_Submariner', 'Casio_F-91W', 'Nike_Air_Force_1', 'Birkin_bag', 'Adidas_Stan_Smith'];

function fetchImage(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(query)}&format=json&pithumbsize=960`;
  https.get(url, { headers: { 'User-Agent': 'MyTestApp/1.0' } }, (res) => {
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
