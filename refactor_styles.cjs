const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk(path.join(__dirname, 'src', 'pages'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace inline fontFamily
    content = content.replace(/\s*fontFamily:\s*['"`][^'"`]+['"`],?/g, '');
    
    // Replace fontSize (if it's inline in these config objects, though it might break legitimate ones, better stick to fontFamily)
    // content = content.replace(/\s*fontSize:\s*['"`][^'"`]+['"`],?/g, ''); // maybe not
    
    // Update rosaCarteira #ff318e to #d91d83
    content = content.replace(/const\s+rosaCarteira\s*=\s*['"`]#ff318e['"`];/g, 'const rosaCarteira = "#d91d83";');
    content = content.replace(/['"]#ff318e['"]/g, '"#d91d83"');
    
    // Clean up empty style objects created by the regex (e.g., style={{ fontWeight: 700 }} -> if stripped maybe empty)
    // Actually just stripping fontFamily might leave commas or empty spaces but it's valid JS/TS.
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done refactoring styles!');
