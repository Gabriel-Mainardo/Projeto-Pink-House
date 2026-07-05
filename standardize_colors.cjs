const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const colorsToReplace = [
  '#E91E63',
  '#e6007e',
  '#ff318e',
  // 'velvet-pink' is also used but it's a tailwind class, we can leave it or adapt it if necessary.
];

walk(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    colorsToReplace.forEach(color => {
      const regex = new RegExp(color, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, '#d91d83');
        changed = true;
      }
    });
    
    // Also remove the explicit fontFamily from CompanionDashboard 
    if (content.includes("fontFamily: \"'Poppins', sans-serif\"")) {
        content = content.replace(/fontFamily:\s*["']'Poppins', sans-serif["'][^}]*/g, '');
        changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
console.log('Done standardizing colors!');
