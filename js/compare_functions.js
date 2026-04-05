const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/teamm/test/js';
const originalFiles = [
    'app.js', 'cal.js', 'dataManager.js', 'filterUI.js', 'location.js',
    'magnifier.js', 'mobCard.js', 'mobSorter.js', 'modal.js',
    'notificationManager.js', 'readme.js', 'server.js', 'sidebar.js',
    'tooltip.js', 'uiRender.js', 'worker.js'
];
const newFiles = [
    '2app.js', '2cal.js', '2dataManager.js', '2mobCard.js', '2mobSorter.js',
    '2modal.js', '2readme.js', '2server.js', '2sidebar.js', '2worker.js'
];

function getFunctions(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const functions = [];
    
    // Simple regex for function names
    // function name()
    // const name = () =>
    // export function name()
    // export const name = () =>
    const funcRegex = /(?:function\s+|const\s+|let\s+)([a-zA-Z0-9_]+)\s*(?:=|(?:\(.*\)\s*\{))/;
    
    lines.forEach(line => {
        const match = line.match(funcRegex);
        if (match && match[1]) {
            // Filter out common keywords that aren't function names if needed, 
            // but for comparison, consistency is key.
            functions.push(match[1]);
        }
    });
    return [...new Set(functions)]; // Unique names
}

const originalFunctions = {};
originalFiles.forEach(file => {
    try {
        originalFunctions[file] = getFunctions(path.join(jsDir, file));
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

const newFunctions = {};
newFiles.forEach(file => {
    try {
        newFunctions[file] = getFunctions(path.join(jsDir, file));
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

const allNewFunctions = new Set();
Object.values(newFunctions).forEach(funcs => funcs.forEach(f => allNewFunctions.add(f)));

const report = {};

originalFiles.forEach(file => {
    report[file] = {
        total: originalFunctions[file].length,
        missing: originalFunctions[file].filter(f => !allNewFunctions.has(f))
    };
});

console.log(JSON.stringify(report, null, 2));
