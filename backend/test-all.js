import http from 'http';

const endpoints = [
  '/api/zones',
  '/api/police',
  '/api/cctvs',
  '/api/metrolines',
  '/api/helplines'
];

async function check() {
  for (const ep of endpoints) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3001${ep}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`${ep}: ${res.statusCode} (length: ${data.length})`);
          resolve();
        });
      }).on('error', (err) => {
        console.log(`${ep}: ERROR`, err.message);
        resolve();
      });
    });
  }
}

check();
