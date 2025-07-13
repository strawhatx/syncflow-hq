#!/usr/bin/env node

/**
 * Post-build obfuscation script
 * This script runs after the build to add additional obfuscation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');

function obfuscateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    content = content.replace(/\/\/.*$/gm, '');
    
    // Remove extra whitespace
    content = content.replace(/\s+/g, ' ');
    
    // Obfuscate common patterns
    content = content.replace(/console\.log/g, 'c.l');
    content = content.replace(/console\.error/g, 'c.e');
    content = content.replace(/console\.warn/g, 'c.w');
    
    // Add some random noise
    const noise = `/*${Math.random().toString(36).substring(7)}*/`;
    content = noise + content;
    
    fs.writeFileSync(filePath, content);
    console.log(`Obfuscated: ${filePath}`);
  } catch (error) {
    console.error(`Error obfuscating ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      obfuscateFile(filePath);
    }
  }
}

console.log('Starting post-build obfuscation...');

if (fs.existsSync(distPath)) {
  processDirectory(distPath);
  console.log('Obfuscation complete!');
} else {
  console.error('Dist directory not found. Run build first.');
  process.exit(1);
} 