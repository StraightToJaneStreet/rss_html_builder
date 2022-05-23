// Не разобравшись в промисах не лезь в Async/Await
// Как бы тебе не хотелось

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const targetDirPath = path.resolve(__dirname, 'project-dist')

const componentsDir = path.resolve(__dirname, 'components');

const templateFile = path.resolve(__dirname, 'template.html');

const stylesDir = path.resolve(__dirname, 'styles');
const stylesOutput = path.resolve(targetDirPath, 'style.css');
const stylesStream = fs.createWriteStream(stylesOutput);

const indexPath = path.resolve(targetDirPath, 'index.html');
const indexStream = fs.createWriteStream(indexPath);

const assetsDir = path.resolve(__dirname, 'assets');

const outputDirCreated = fsp.mkdir(targetDirPath, { recursive: true });

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

function makeDirectory(pth) {
  return fsp.mkdir(pth, { recursive: true })
}

function scanDirectory(pth) {
  return new Promise((resolve) => {
    const files = [];

    const ret = fsp.readdir(pth, { withFileTypes: true });

    const finalize = (subdirsContent) => resolve({ name: pth, files, subdirs: subdirsContent });

    const handleEntries = (entries) => {
      const subPromises = [];
      entries.forEach((entry) => {
        if (entry.isFile()) {
          files.push(path.resolve(pth, entry.name));
        } else {
          const subPromise = scanDirectory(path.resolve(pth, entry.name));
          subPromises.push(subPromise);
        }
      });

      Promise.all(subPromises).then(finalize);
    }

    ret.then(handleEntries);
  });
}

function createDirectory(structure, targetPath) {
  return new Promise((resolve) => {
    const subPromises = [];
    const files = structure.files;
    const subdirs = structure.subdirs;
    const dirPath = structure.name;
    const sourceDirBasename = path.basename(structure.name);
    const newRootPath = path.resolve(targetPath, sourceDirBasename);
    // console.log('Source Dir Basename: ', sourceDirBasename)
    // console.log('Target Dir:    ', targetPath);
    // console.log('New Root Path: ', newRootPath);
    const folderPromise = fsp.mkdir(newRootPath, { recursive: true }).then(() => {
      return files.map(name => fsp.copyFile(name, path.resolve(newRootPath, path.basename(name))));
    });
    folderPromise.then((filesPromises) => Promise.all(filesPromises)).then(result => {
      return subdirs.map(subDirectory => createDirectory(subDirectory, newRootPath))
    })

  });
}

// Combine styles
Promise.all([readFiles(stylesDir), outputDirCreated])
  .then(([files]) => files.filter(({ basename }) => path.extname(basename) === '.css'))
  .then(files => Promise.all(files.map(({ path }) => fsp.readFile(path))))
  .then(contents => contents.forEach(content => stylesStream.write(content)));

// Load components
const components = Promise.all([readFiles(componentsDir), outputDirCreated])
  .then(([files]) => files.filter(({ basename }) => path.extname(basename) === '.html'))
  .then(files => files.map(({ path: pth, basename }) => loadComponent(path.basename(basename, '.html'), pth)))
  .then(componentsPromises => Promise.all(componentsPromises))
  .then(Object.fromEntries);

// Translate template.html
Promise.all([fsp.readFile(templateFile, 'utf-8'), components, outputDirCreated])
  .then(([content, components]) => content.replace(/\{\{(.*?)\}\}/g, (_, template) => components[template]))
  .then((content) => indexStream.write(content));

// Copy assets
scanDirectory(assetsDir).then(structure => createDirectory(structure, targetDirPath));
