const fs = require('fs');
const path = require('path');

function naturalSort(a, b) {
    // Extract numeric parts from strings like "SR-10", "JR-1", etc.
    const aMatch = a.match(/(\D+)(\d+)/);
    const bMatch = b.match(/(\D+)(\d+)/);

    if (aMatch && bMatch) {
        // Compare prefix first (SR vs JR)
        const prefixCompare = aMatch[1].localeCompare(bMatch[1]);
        if (prefixCompare !== 0) return prefixCompare;

        // If prefixes are same, compare numerically
        return parseInt(aMatch[2]) - parseInt(bMatch[2]);
    }

    // Fallback to normal string comparison
    return a.localeCompare(b);
}

function scanDirectory(dir) {
    const structure = {};

    if (!fs.existsSync(dir)) {
        console.error(`Directory ${dir} does not exist!`);
        return structure;
    }

    console.log(`Scanning directory: ${dir}`);

    const subjects = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort(); // Sort subjects alphabetically

    subjects.forEach(subject => {
        const subjectPath = path.join(dir, subject);
        structure[subject] = {};

        const levels = fs.readdirSync(subjectPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort(naturalSort); // Use natural sort for levels

        levels.forEach(level => {
            const levelPath = path.join(subjectPath, level);
            const files = fs.readdirSync(levelPath, { withFileTypes: true })
                .filter(dirent => dirent.isFile() && dirent.name.endsWith('.csv'))
                .map(dirent => dirent.name)
                .sort(); // Sort files alphabetically

            structure[subject][level] = files;
        });
    });

    // Create ordered structure with proper sorting
    const orderedStructure = {};
    Object.keys(structure).sort().forEach(subject => {
        orderedStructure[subject] = {};

        // Sort levels naturally for each subject
        Object.keys(structure[subject]).sort(naturalSort).forEach(level => {
            orderedStructure[subject][level] = structure[subject][level];
        });
    });

    return orderedStructure;
}

// Create questions directory if it doesn't exist
const questionsPath = './questions';
if (!fs.existsSync(questionsPath)) {
    fs.mkdirSync(questionsPath, { recursive: true });
    console.log('Created questions directory');
}

// Generate structure
console.log('Starting structure generation...');
const structure = scanDirectory(questionsPath);

// Create index.json file
const indexPath = path.join(questionsPath, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(structure, null, 2));

console.log('\n✅ Structure generated successfully!');
console.log('📁 File saved to:', indexPath);

// Validation
const totalSubjects = Object.keys(structure).length;
const totalLevels = Object.values(structure).reduce((acc, subject) => acc + Object.keys(subject).length, 0);
const totalFiles = Object.values(structure).reduce((acc, subject) => {
    return acc + Object.values(subject).reduce((levelAcc, files) => levelAcc + files.length, 0);
}, 0);

console.log(`\n📈 Summary: ${totalSubjects} subjects, ${totalLevels} levels, ${totalFiles} CSV files`);