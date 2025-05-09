import fs from 'fs';
import path from 'path';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Scan source files for potential URL-like route patterns
 */
async function scanSourceFiles() {
  console.log('Scanning for problematic route patterns...');
  
  const sourceDirs = [
    path.resolve(__dirname, '../routes')
  ];
  
  const problematicRoutes: {file: string, line: number, pattern: string}[] = [];
  
  for (const dir of sourceDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for router method calls
        const routeMatches = line.match(/router\.(get|post|put|delete|patch|all|options)\s*\(\s*['"`](.*?)['"`]/);
        if (routeMatches) {
          const pattern = routeMatches[2];
          
          // Check if pattern contains URL protocol
          if (pattern.match(/^https?:\/\//)) {
            problematicRoutes.push({
              file: filePath,
              line: i + 1,
              pattern
            });
            continue;
          }
          
          // Validate the pattern
          try {
            // Skip the validation if the pattern is empty or just a comment
            if (pattern && !pattern.trim().startsWith('//')) {
              pathToRegexp(pattern);
            }
          } catch (error) {
            problematicRoutes.push({
              file: filePath,
              line: i + 1,
              pattern
            });
          }
        }
      }
    }
  }
  
  if (problematicRoutes.length > 0) {
    console.log('Problematic routes found:');
    for (const route of problematicRoutes) {
      console.log(`File: ${route.file}:${route.line}`);
      console.log(`Pattern: ${route.pattern}`);
      console.log('---');
    }
    
    // Exit with an error code if problematic routes are found
    process.exit(1);
  } else {
    console.log('No problematic routes found.');
  }
}

// Run the scan
if (require.main === module) {
  scanSourceFiles().catch(error => {
    console.error('Error scanning routes:', error);
    process.exit(1);
  });
}

export default scanSourceFiles;
