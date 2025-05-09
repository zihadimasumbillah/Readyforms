import fs from 'fs';
import path from 'path';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Scans all route files for problematic patterns like URLs being used as route paths
 */
export function scanRouteFiles() {
  const routesDir = path.join(__dirname, '..', 'routes');
  console.log(`Scanning route files in ${routesDir}`);
  
  try {
    const files = fs.readdirSync(routesDir);
    let problemsFound = false;
    
    files.forEach(file => {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) return;
      
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for router method calls with URLs instead of paths
      const urlRegex = /router\.(get|post|put|delete|patch|options)\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g;
      let match;
      
      while ((match = urlRegex.exec(content)) !== null) {
        const method = match[1];
        const url = match[2];
        
        console.error(`ERROR in ${file}:`);
        console.error(`  Found URL used as route path: ${method.toUpperCase()} ${url}`);
        console.error(`  URLs cannot be used as Express route paths. Use a path like '/example' instead.`);
        console.error();
        
        problemsFound = true;
      }
      
      // Look for syntactically valid but semantically problematic paths
      const pathRegex = /router\.(get|post|put|delete|patch|options)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = pathRegex.exec(content)) !== null) {
        const method = match[1];
        const routePath = match[2];
        
        try {
          pathToRegexp(routePath);
        } catch (error) {
          console.error(`ERROR in ${file}:`);
          console.error(`  Invalid route pattern: ${method.toUpperCase()} ${routePath}`);
          console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error();
          
          problemsFound = true;
        }
      }
    });
    
    if (!problemsFound) {
      console.log("No problematic routes found. All routes appear to be valid!");
    } else {
      console.error("IMPORTANT: Please fix the problematic routes identified above before starting the server.");
    }
  } catch (error) {
    console.error("Error scanning route files:", error);
  }
}

// Run the scanner if this script is executed directly
if (require.main === module) {
  scanRouteFiles();
}
