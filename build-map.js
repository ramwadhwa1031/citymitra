const fs = require('fs');
const txt = fs.readFileSync('C:/Users/DELL/.gemini/antigravity/brain/77412f5b-d51d-469a-96ae-7f7f00f678e3/.system_generated/steps/282/content.md', 'utf8');

// Extract state names and paths
const nameRegex = /"name":"([^"]+)"/g;
const pathRegex = /"path":"([^"]+)"/g;
const names = [];
const paths = [];
let match;
while ((match = nameRegex.exec(txt)) !== null) names.push(match[1]);
nameRegex.lastIndex = 0;
while ((match = pathRegex.exec(txt)) !== null) paths.push(match[1]);

// Islands to exclude
const exclude = [];

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 696" width="500" height="570">
  <defs>
    <linearGradient id="tricolor" x1="0" y1="0" x2="0" y2="696" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="28%" stop-color="#FF9933"/>
      <stop offset="33%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#FFFFFF"/>
      <stop offset="66%" stop-color="#138808"/>
      <stop offset="100%" stop-color="#138808"/>
    </linearGradient>
  </defs>
  <g fill="url(#tricolor)" stroke="rgba(40,40,80,0.12)" stroke-width="0.5" stroke-linejoin="round">
`;

let included = 0;
for (let i = 0; i < names.length; i++) {
  if (!exclude.includes(names[i])) {
    svg += `    <path d="${paths[i]}"/>\n`;
    included++;
  } else {
    console.log('Excluded:', names[i]);
  }
}

svg += `  </g>\n</svg>`;

fs.writeFileSync('c:/Users/DELL/Downloads/Kurukshetra-InfoBot-main/Kurukshetra-InfoBot-main/icons/india-map.svg', svg);
console.log('Done! Included', included, 'states, excluded', names.length - included);
