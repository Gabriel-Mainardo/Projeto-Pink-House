const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, 'src', 'components', 'SubidasDoPerfil.tsx'),
  path.join(__dirname, 'src', 'pages', 'Subidas.tsx')
];

targetFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hex color #ff4c8d with #d91d83 in SubidasDoPerfil
    content = content.replace(/#ff4c8d/gi, '#d91d83');
    // Replace hover color #e63d7a with #b8166c
    content = content.replace(/#e63d7a/gi, '#b8166c');
    
    // In Subidas.tsx: replace bg-black and velvet dark classes with light versions
    if (filePath.includes('Subidas.tsx')) {
        content = content.replace(/bg-black/g, 'bg-gray-50');
        content = content.replace(/card-velvet/g, 'bg-white shadow-xl');
        content = content.replace(/text-velvet-white\/70/g, 'text-gray-600');
        content = content.replace(/text-velvet-white\/50/g, 'text-gray-500');
        content = content.replace(/text-velvet-white/g, 'text-gray-900');
        content = content.replace(/btn-velvet/g, 'bg-[#d91d83] hover:bg-[#b8166c] transition-colors text-white font-semibold rounded-lg shadow-md');
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done refactoring Subidas styles!');
