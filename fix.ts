import fs from 'fs';

const content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf-8');
const lines = content.split('\n');

// the unwanted lines are from 536 to 781 (which is index 535 to 780, wait 536 to 782).
// let's just do it string replacement from `<div className="flex gap-4 border-b border-gray-200 mb-8 text-[13px]">` to `<div className="flex flex-col w-full lg:w-[320px] xl:w-[340px] shrink-0 gap-6 sticky top-[84px] self-start z-10">` (the right sidebar)

const targetStartText = '        <div className="flex gap-4 border-b border-gray-200 mb-8 text-[13px]">';
const targetEndText = '        {/* Right Sidebar: Prices & Actions */}';

const startIndex = lines.findIndex(l => l.includes(targetStartText));
const endIndex = lines.findIndex(l => l.includes(targetEndText));

if (startIndex !== -1 && endIndex !== -1) {
    // we want to remove lines from startIndex up to (endIndex - 1), but wait, the </div> at 783 is important because it closes the left flex col!
    // Let's replace the whole chunk and carefully put `)}` and `</div>`.
    
    lines.splice(startIndex, endIndex - startIndex, 
        '      )}',
        '      </div>'
    );
    
    fs.writeFileSync('src/pages/ProductPage.tsx', lines.join('\n'));
    console.log("Replaced successfully.");
} else {
    console.log("Could not find boundaries.");
}
