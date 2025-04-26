import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, './');
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const DRY_RUN = false;

// Advanced comment removal that protects URLs in strings
function removeComments(content) {
  // Preserve shebang
  const shebang = content.startsWith('#!') ? content.split('\n')[0] + '\n' : '';
  let newContent = shebang ? content.slice(shebang.length) : content;

  // Protect URLs in strings by temporarily replacing them
  const urlPlaceholders = [];
  newContent = newContent.replace(/(['"])(https?:[^\1]*?)\1/g, (match, quote, url) => {
    urlPlaceholders.push(url);
    return `${quote}URL_PLACEHOLDER_${urlPlaceholders.length-1}${quote}`;
  });

  // Remove single-line comments (except when they look like URLs)
  newContent = newContent.replace(/\/\/[^\n]*$/gm, (match) => {
    return match.startsWith('//http') ? match : '';
  });

  // Remove multi-line comments
  newContent = newContent.replace(/\/\*[\s\S]*?\*\//g, '');

  // Restore protected URLs
  newContent = newContent.replace(/['"]URL_PLACEHOLDER_(\d+)['"]/g, (match, index) => {
    return `"${urlPlaceholders[parseInt(index)]}"`;
  });

  // Clean up empty lines
  newContent = newContent.split('\n')
    .filter(line => line.trim().length > 0)
    .join('\n');

  return shebang + newContent;
}

// Rest of the script remains the same as previous version...
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = removeComments(content);
    
    if (content !== newContent) {
      console.log(`Processing: ${path.relative(PROJECT_ROOT, filePath)}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
      return true;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
  return false;
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!EXCLUDE_DIRS.includes(file)) {
            walkDir(fullPath);
          }
        } else if (FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
          processFile(fullPath);
        }
      } catch (err) {
        console.error(`Error accessing ${fullPath}:`, err.message);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
}

console.log('Starting comment removal...');
walkDir(PROJECT_ROOT);
console.log('Comment removal completed!');