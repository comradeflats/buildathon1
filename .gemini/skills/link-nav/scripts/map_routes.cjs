const fs = require('fs');
const path = require('path');

/**
 * Recursively finds all Next.js routes in a directory.
 * @param {string} dir - The directory to search.
 * @param {string} baseDir - The base directory to calculate relative paths.
 * @returns {Array<{path: string, type: 'page' | 'route'}>}
 */
function findRoutes(dir, baseDir = dir) {
  let routes = [];
  if (!fs.existsSync(dir)) return routes;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      routes = routes.concat(findRoutes(fullPath, baseDir));
    } else if (file === 'page.tsx' || file === 'page.jsx' || file === 'page.js') {
      const routePath = path.relative(baseDir, dir) || '/';
      routes.push({ path: routePath === '/' ? '/' : `/${routePath}`, type: 'page' });
    } else if (file === 'route.ts' || file === 'route.js') {
      const routePath = path.relative(baseDir, dir);
      routes.push({ path: `/api/${routePath}`, type: 'route' });
    }
  }
  return routes;
}

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, 'src', 'app');
const pagesDir = path.join(projectRoot, 'src', 'pages');

let allRoutes = [];
if (fs.existsSync(appDir)) {
  allRoutes = allRoutes.concat(findRoutes(appDir));
}
if (fs.existsSync(pagesDir)) {
  allRoutes = allRoutes.concat(findRoutes(pagesDir));
}

// Remove duplicates and sort
const uniqueRoutes = Array.from(new Set(allRoutes.map(r => JSON.stringify(r))))
  .map(s => JSON.parse(s))
  .sort((a, b) => a.path.localeCompare(b.path));

console.log(JSON.stringify(uniqueRoutes, null, 2));
