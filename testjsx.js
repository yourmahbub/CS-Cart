const fs = require('fs');
const babel = require('@babel/parser');

try {
  const code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf-8');
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax errors according to Babel.");
} catch (e) {
  console.log(e.message);
  console.log("Location:", e.loc);
}
