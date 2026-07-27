import http from 'http';

const endpoints = [
  '/api/zones',
  '/api/police',
  '/api/cctvs',
  '/api/metrolines',
  '/api/helplines',
  '/api/hospitals',
  '/api/hubs',
  '/api/metros',
  '/api/corridors',
  '/api/hazards',
  '/api/destination-weather?lat=22&lng=88'
];

async function check() {
  for (const ep of endpoints) {
    try {
      await new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${ep}`, (res) => {
          let data = '';
          res.on('data', c => data+=c);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              console.log(`${ep}: OK (${Array.isArray(parsed) ? parsed.length + ' items' : 'Object'})`);
              resolve();
            } catch (e) {
              console.error(`${ep}: JSON Parse Error! Data: ${data.slice(0, 100)}`);
              reject(e);
            }
          });
        }).on('error', reject);
      });
    } catch (err) {
      console.error(`${ep} failed:`, err.message);
    }
  }
}

check();
