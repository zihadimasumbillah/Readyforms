import fs from 'fs';
import path from 'path';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Utility class to scan for invalid route patterns
 */
export class RouteValidator {
  /**
   * Validates if a string is a proper Express route path
   */
  static isValidRoutePath(routePath: string): boolean {
    try {
      // Check if it contains a URL protocol
      if (routePath.includes('://')) {
        console.error(`Invalid route path: '${routePath}' looks like a URL, not a path`);
        return false;
      }
      
      // Try to parse the route with path-to-regexp
      pathToRegexp(routePath);
      return true;
    } catch (error) {
      console.error(`Invalid route pattern: '${routePath}'`, error);
      return false;
    }
  }

  /**
   * Scans a directory for router files and finds problematic routes
   */
  static async scanDirectory(dir: string): Promise<string[]> {
    const problematicRoutes: string[] = [];
    
    try {
      if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return problematicRoutes;
      }
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
        if (file === 'index.ts' || file === 'index.js') continue;
        
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find router.METHOD patterns
        const routeMatches = content.match(/router\.(get|post|put|delete|patch|options|all)\s*\(\s*['"`](.*?)['"`]/g);
        
        if (routeMatches) {
          for (const routeMatch of routeMatches) {
            // Extract the route path
            const match = routeMatch.match(/router\.(get|post|put|delete|patch|options|all)\s*\(\s*['"`](.*?)['"`]/);
            if (match && match[2]) {
              const routePath = match[2];
              
              // Check if the path contains a URL protocol
              if (routePath.includes('://')) {
                problematicRoutes.push(`${file}: Route with URL protocol - ${routePath}`);
                continue;
              }
              
              // Check if it's a valid path
              try {
                pathToRegexp(routePath);
              } catch (error) {
                problematicRoutes.push(`${file}: Invalid pattern - ${routePath}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
    
    return problematicRoutes;
  }
  
  /**
   * Performs a full scan of all routes in the application
   */
  static async scanAllRoutes(rootDir: string): Promise<string[]> {
    const routesDir = path.join(rootDir, 'routes');
    console.log(`Scanning routes in ${routesDir}...`);
    return this.scanDirectory(routesDir);
  }
}

// Run the validator if this file is executed directly
if (require.main === module) {
  const appRoot = path.join(__dirname, '..');
  RouteValidator.scanAllRoutes(appRoot).then(routes => {
    if (routes.length === 0) {
      console.log('✓ All routes appear to be valid');
    } else {
      console.log('⚠️ Found problematic routes:');
      routes.forEach(route => console.log(` - ${route}`));
    }
  });
}
