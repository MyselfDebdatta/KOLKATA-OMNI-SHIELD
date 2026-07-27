import fs from 'fs';
import path from 'path';

const files = [
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/store/omni.ts',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/routes/admin.tsx',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/lib/simulated-api.ts',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/components/omni/VoiceDispatcher.tsx',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/components/omni/SOSButton.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace "http://localhost:3001/..." with `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001/...`
  // We need to be careful with existing backticks or quotes.
  
  content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, '`http://${typeof window !== \'undefined\' ? window.location.hostname : \'localhost\'}:3001$1`');
  
  // Also check for backticks: `http://localhost:3001/...`
  content = content.replace(/`http:\/\/localhost:3001([^`]*)`/g, '`http://${typeof window !== \'undefined\' ? window.location.hostname : \'localhost\'}:3001$1`');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
