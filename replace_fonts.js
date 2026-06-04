const fs = require('fs');

const files = ['src/pages/chat.js', 'src/pages/login.js'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace font imports
    content = content.replace(/@fontsource\/(inter|epilogue)/g, '@fontsource/poppins');
    
    // Replace font families
    content = content.replace(/Inter, sans-serif/g, 'Poppins, sans-serif');
    content = content.replace(/Epilogue, sans-serif/g, 'Poppins, sans-serif');
    content = content.replace(/font-family:\s*'Inter'/g, "font-family: 'Poppins'");
    
    fs.writeFileSync(file, content);
});

console.log('Font replaced successfully');
