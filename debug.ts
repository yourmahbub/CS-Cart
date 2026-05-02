import fs from 'fs';

const lines = fs.readFileSync('src/pages/ProductPage.tsx', 'utf-8').split('\n');
let depth = 0;
const stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let l = line;
    // Replace non-div tags
    // We only care about matching tags!
    // But other tags like <main>, <AnimatePresence>, <motion.div>, <button>, <p> also have depth.
    // It's easier to use a JSX parser, or just let Babel format it and tell us. Let's just use typescript compiler.
}
