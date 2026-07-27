import fs from 'fs';

const files = [
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/store/omni.ts',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/routes/admin.tsx',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/lib/simulated-api.ts',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/components/omni/VoiceDispatcher.tsx',
  'e:/KOLKATA-OMNI-SHIELD/frontend/src/components/omni/SOSButton.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert `${typeof window !== 'undefined' ? '' : 'http://localhost:3001'}` to `http://localhost:3001`
  // Actually, wait, it's safer to just replace that exact string since I added it.
  
  content = content.replace(/\$\{typeof window !== 'undefined' \? '' : 'http:\/\/localhost:3001'\}/g, 'http://localhost:3001');

  fs.writeFileSync(file, content);
  console.log(`Reverted ${file}`);
}
