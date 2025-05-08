import path from 'path';
import { checkAllRoutes } from './debug-route-patterns';

const rootDir = path.resolve(__dirname, '..', '..');  
console.log(`Checking route patterns in ${rootDir}`);
checkAllRoutes(rootDir);

console.log('\nREMINDER:');
console.log('1. Express route paths should be relative paths like /users/:id');
console.log('2. Never use full URLs in route paths');
console.log('3. Path parameters should use colon syntax like :paramName');
console.log('4. Regular expressions in routes need special handling');
