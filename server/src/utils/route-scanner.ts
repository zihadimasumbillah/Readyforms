import fs from 'fs';
import path from 'path';

export function scanRoutes(baseDir: string): void {
  const routesDir = path.join(baseDir, 'routes');
  
  console.log(`Scanning routes directory: ${routesDir}`);
  
  if (!fs.existsSync(routesDir)) {
    console.error(`Routes directory not found: ${routesDir}`);
    return;
  }
  
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.routes.ts') || file.endsWith('.routes.js'));
  
  console.log(`Found ${routeFiles.length} route files`);
  
  let suspiciousPatterns = 0;
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
  const suspiciousRegex = /https?:\/\//;
  
  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1];
      const routePath = match[2];

      if (suspiciousRegex.test(routePath)) {
        suspiciousPatterns++;
        console.error(`[ISSUE] Found suspicious route pattern in ${file}:`);
        console.error(`  ${method.toUpperCase()} ${routePath}`);
        console.error(`  Route paths should be relative paths, not full URLs`);
      }
      
      // Check for other common route pattern issues
      if (routePath.includes(':{')) {
        console.warn(`[WARNING] Possible parameter format issue in ${file}:`);
        console.warn(`  ${method.toUpperCase()} ${routePath}`);
        console.warn(`  Route parameters should be in the format ':paramName'`);
      }
    }
  });
  
  if (suspiciousPatterns === 0) {
    console.log('No obvious route pattern issues found.');
    console.log('The path-to-regexp error might be occurring at runtime.');
    console.log('Check for dynamic route registration or routes using variables.');
  } else {
    console.error(`Found ${suspiciousPatterns} suspicious route patterns that might cause path-to-regexp errors.`);
  }
}

if (require.main === module) {
  const baseDir = process.cwd();
  scanRoutes(baseDir);
}
