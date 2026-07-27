import http from 'http';

console.log("Starting fetch...");
const req = http.get('http://localhost:3001/api/zones', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Data received:", data.slice(0, 100));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("ERROR:", err);
  process.exit(1);
});

req.setTimeout(3000, () => {
  console.log("Request timed out");
  process.exit(1);
});
