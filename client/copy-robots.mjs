import { copyFileSync } from 'fs';
copyFileSync('public/robots.txt', 'dist/robots.txt');
console.log('robots.txt copied to dist/');