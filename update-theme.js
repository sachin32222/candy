import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getFiles(dir) {
  let files = [];
  readdirSync(dir).forEach(file => {
    let full = join(dir, file);
    if (statSync(full).isDirectory()) files = files.concat(getFiles(full));
    else if (full.endsWith('.tsx')) files.push(full);
  });
  return files;
}

const files = getFiles('src');

files.forEach(file => {
  if (file.includes('Dashboard.tsx')) return;
  let content = readFileSync(file, 'utf-8');
  
  // Backgrounds:
  content = content.replace(/bg-neutral-900\/80/g, 'bg-[#0f0f0f]/80');
  content = content.replace(/bg-neutral-900\/50/g, 'bg-[#0f0f0f]/50');
  content = content.replace(/bg-neutral-900/g, 'bg-[#0f0f0f]');
  
  content = content.replace(/bg-neutral-800\/50/g, 'bg-[#1a1a1a]/50');
  content = content.replace(/bg-neutral-800/g, 'bg-[#1a1a1a]');
  
  // Hover states:
  content = content.replace(/hover:bg-neutral-900/g, 'hover:bg-[#252525]');
  content = content.replace(/hover:bg-neutral-800/g, 'hover:bg-[#333]');
  
  // Borders:
  content = content.replace(/border-neutral-800/g, 'border-[#333]');
  content = content.replace(/border-neutral-700/g, 'border-[#333]');
  content = content.replace(/border-neutral-600/g, 'border-[#444]');
  
  // Inputs:
  content = content.replace(/border-b border-\[#333\] py-3 bg-transparent/g, 'border border-[#444] py-3 px-4 bg-[#252525] rounded-xl');
  content = content.replace(/border-b border-\[#333\] py-2 bg-transparent/g, 'border border-[#444] py-3 px-4 bg-[#252525] rounded-xl');
  content = content.replace(/border-b border-neutral-600 py-3 bg-transparent/g, 'border border-[#444] py-3 px-4 bg-[#252525] rounded-xl');
  content = content.replace(/border-b border-neutral-500 py-3 bg-transparent/g, 'border border-[#444] py-3 px-4 bg-[#252525] rounded-xl');

  // Cancel/Secondary buttons:
  content = content.replace(/text-black/g, 'text-neutral-900');
  content = content.replace(/bg-white text-neutral-900/g, 'bg-neutral-100 text-neutral-900');
  content = content.replace(/hover:bg-neutral-200/g, 'hover:bg-white');

  writeFileSync(file, content);
});
console.log('Update complete!');
