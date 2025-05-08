import fs from 'fs';
import path from 'path';
import * as express from 'express';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Tests a route pattern to see if it's valid
 * @param pattern The route pattern to test
 * @returns True if valid, false if invalid
 */
export function isValidRoutePattern(pattern: string): boolean {
  try {
    pathToRegexp(pattern);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Looks for invalid route patterns in a Router
 * @param router The Express router to check
 * @returns An array of problematic routes
 */
export function checkRouterPatterns(router: any): string[] {
  if (!router || !router.stack) return [];
  
  const problems: string[] = [];
  
  // Loop through the router stack
  for (const layer of router.stack) {
    // Check if this layer is a route
    if (layer.route) {
      try {
        pathToRegexp(layer.route.path);
      } catch (err) {
        problems.push(`Invalid route pattern: ${layer.route.path}`);
      }
    }
    
    // Check for nested routers
    if (layer.handle && layer.handle.stack) {
      problems.push(...checkRouterPatterns(layer.handle));
    }
  }
  
  return problems;
}

/**
 * Scans a directory for route files and checks their patterns
 * @param dirPath Directory to scan
 * @returns A map of files and their problematic paths
 */
export function scanDirectoryForRoutePatterns(dirPath: string): Map<string, string[]> {
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  const results = new Map<string, string[]>();
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for route paths in the file
    const routeRegex = /router\.(get|post|put|delete|patch|all)\s*\(\s*["'`]([^"'`]+)["'`]/g;
    const matches: string[] = [];
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      const routePath = match[2];
      
      // Test if the route pattern is valid
      try {
        pathToRegexp(routePath);
      } catch (err) {
        matches.push(`Invalid route pattern: ${routePath}`);
      }
    }
    
    // Look for full URLs accidentally used as routes
    const urlRegex = /https?:\/\/[^\s"')]+/g;
    while ((match = urlRegex.exec(content)) !== null) {
      const url = match[0];
      if (content.includes(`router.get('${url}'`) || 
          content.includes(`router.post('${url}'`) || 
          content.includes(`router.put('${url}'`) || 
          content.includes(`router.delete('${url}'`) || 
          content.includes(`router.all('${url}'`)) {
        matches.push(`URL used as route path: ${url}`);
      }
    }
    
    if (matches.length > 0) {
      results.set(filePath, matches);
    }
  }
  
  return results;
}

/**
 * Main function to check all routes in a project
 * @param rootDir The project root directory
 */
export function checkAllRoutes(rootDir: string): void {
  console.log('Checking for problematic route patterns...');
  
  const routesDir = path.join(rootDir, 'src', 'routes');
  if (!fs.existsSync(routesDir)) {
    console.log('Routes directory not found:', routesDir);
    return;
  }
  
  const results = scanDirectoryForRoutePatterns(routesDir);
  
  if (results.size === 0) {
    console.log('No problematic route patterns found.');
    return;
  }
  
  console.log(`Found ${results.size} files with problematic route patterns:`);
  for (const [file, problems] of results.entries()) {
    console.log(`\nFile: ${path.basename(file)}`);
    for (const problem of problems) {
      console.log(`  - ${problem}`);
    }
  }
}

if (require.main === module) {
  checkAllRoutes(path.resolve(__dirname, '..', '..'));
}