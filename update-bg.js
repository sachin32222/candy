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
  let content = readFileSync(file, 'utf-8');
  content = content.replace(/placeholder-neutral-800/g, 'placeholder-neutral-500');
  content = content.replace(/placeholder-neutral-700/g, 'placeholder-neutral-400');
  writeFileSync(file, content);
});
console.log('Done placeholders!');
