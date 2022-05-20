const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const targetDirPath = path.resolve(__dirname, 'project-dist')

const outputDirCreated = fsp.mkdir(targetDirPath, { recursive: true });

const componentsDir = path.resolve(__dirname, 'components');

const templateFile = path.resolve(__dirname, 'template.html');

const stylesDir = path.resolve(__dirname, 'styles');
const stylesOutput = path.resolve(__dirname, 'project-dist', 'bundle.css');
const stylesStream = fs.createWriteStream(stylesOutput);

function readFiles(dirPath) {
  const ret = fsp.readdir(dirPath, { withFileTypes: true })
    .then(entries => entries.filter(e => !e.isDirectory()))
    .then(files => files.map(({ name }) => ({ path: path.resolve(dirPath, name), basename: name})));
  return ret;
}

function loadComponent(name, pth) {
  const ret = fsp.readFile(pth).then(content => [name, content]);
  return ret;
}

// Bundle styles
readFiles(stylesDir)
  .then(files => files.filter(({ basename }) => path.extname(basename) === '.css'))
  .then(files => Promise.all(files.map(({ path }) => fsp.readFile(path))))
  .then(contents => contents.forEach(content => stylesStream.write(content)));

// Load components
const components = readFiles(componentsDir)
  .then(files => files.filter(({ basename }) => path.extname(basename) === '.html'))
  .then(files => files.map(({ path: pth, basename }) => loadComponent(path.basename(basename, '.html'), pth)))
  .then(componentsPromises => Promise.all(componentsPromises))
  .then(Object.fromEntries);

// Translate template.html
Promise.all([fsp.readFile(templateFile, 'utf-8'), components])
  .then(([content, components]) => { });