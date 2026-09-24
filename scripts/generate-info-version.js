const fs = require('fs');
const path = require('path');

const rootPath = path.resolve(__dirname, '../');
const packageJson = require(path.join(rootPath, 'package.json'));

const outputDir = path.join(rootPath, 'src/assets/info');
const outputPath = path.join(outputDir, 'version');

const buildInfo = {
  build: {
    name: packageJson.name,
    time: new Date().toISOString(),
    version: packageJson.version
  }
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));
