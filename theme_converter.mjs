import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/App.tsx',
  'src/ProductosPanel.tsx',
  'src/GallitoWidget.tsx'
];

const replacements = [
  // Primary accents
  { regex: /blue-600/g, replacement: 'orange-600' },
  { regex: /blue-500/g, replacement: 'orange-500' },
  { regex: /blue-700/g, replacement: 'orange-700' },
  { regex: /blue-100/g, replacement: 'orange-100' },
  { regex: /blue-50/g, replacement: 'orange-50' },
  { regex: /bg-\[\#1E3A8A\]/g, replacement: 'bg-black' },
  { regex: /text-\[\#00FF88\]/g, replacement: 'text-orange-500' },
  { regex: /text-\[\#00FF88\]\/70/g, replacement: 'text-orange-500/70' },
  
  // Backgrounds for Dark Theme
  { regex: /bg-\[\#F8FAFC\]/g, replacement: 'bg-zinc-950' },
  { regex: /bg-white/g, replacement: 'bg-zinc-900' },
  { regex: /bg-slate-50/g, replacement: 'bg-zinc-800/50' },
  { regex: /bg-slate-100/g, replacement: 'bg-zinc-800' },
  { regex: /bg-slate-200/g, replacement: 'bg-zinc-700' },
  
  // Borders
  { regex: /border-slate-200/g, replacement: 'border-zinc-800' },
  { regex: /border-slate-100/g, replacement: 'border-zinc-800' },
  
  // Text
  { regex: /text-slate-800/g, replacement: 'text-white' },
  { regex: /text-slate-900/g, replacement: 'text-white' },
  { regex: /text-slate-700/g, replacement: 'text-zinc-200' },
  { regex: /text-slate-600/g, replacement: 'text-zinc-300' },
  { regex: /text-slate-500/g, replacement: 'text-zinc-400' },
  { regex: /text-slate-400/g, replacement: 'text-zinc-500' }
];

for (const file of filesToUpdate) {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    for (const { regex, replacement } of replacements) {
      content = content.replace(regex, replacement);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
