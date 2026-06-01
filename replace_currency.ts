import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
        if (!file.includes('node_modules')) {
            results = results.concat(walk(file));
        }
    } else { 
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/>\$\{/g, '>LKR {')
    .replace(/>\$(?=\d)/g, '>LKR ')
    .replace(/"\$(?=\d)/g, '"LKR ')
    .replace(/\$(\d)/g, 'LKR $1')
    .replace(/Min \$/g, 'Min LKR')
    .replace(/Max \$/g, 'Max LKR')
    .replace(/Price \(\$\)/g, 'Price (LKR)')
    .replace(/:\s*\$(\{)/g, ': LKR $1')
    .replace(/Min: \$\{/g, 'Min: LKR {')
    .replace(/Max: \$\{/g, 'Max: LKR {')
    .replace(/> \$\{/g, '> LKR {')
    .replace(/\s\$\(\{/g, ' LKR ({')
    .replace(/^\s*\$\(\{/gm, ' LKR ({');
    
  fs.writeFileSync(file, newContent, 'utf8');
});
console.log("Done");
