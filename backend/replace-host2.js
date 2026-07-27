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
  
  // Previously we replaced with `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001/api/...`
  // We want to replace it with `${typeof window !== 'undefined' ? '' : 'http://localhost:3001'}/api/...`
  
  // Find backtick patterns matching the old replacement
  const pattern = /`http:\/\/\$\{typeof window !== 'undefined' \? window\.location\.hostname : 'localhost'\}:3001([^`]*)`/g;
  
  content = content.replace(pattern, '`${typeof window !== \'undefined\' ? \'\' : \'http://localhost:3001\'}$1`');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
