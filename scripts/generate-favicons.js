const fs = require('fs');
const path = require('path');

// Simple Canvas-like implementation for Node.js
// This creates PNG files with the SC monogram

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'favicon.ico': 32
};

// Create a simple SVG for each size
function createSVG(size) {
  const fontSize = Math.floor(size * 0.5);
  const strokeWidth = Math.max(1, size / 16);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#2563eb"/>
  <text
    x="50%"
    y="50%"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >SC</text>
</svg>`;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG files for each size
Object.entries(sizes).forEach(([filename, size]) => {
  const svg = createSVG(size);
  const outputPath = path.join(publicDir, filename.replace('.png', '.svg').replace('.ico', '.svg'));
  fs.writeFileSync(outputPath, svg);
  console.log(`Created ${outputPath}`);
});

console.log('\nSVG favicons created successfully!');
console.log('Note: For production, convert SVGs to PNG/ICO using an online tool or sharp library.');
console.log('Recommended: https://realfavicongenerator.net/');
