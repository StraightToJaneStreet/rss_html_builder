// Не разобравшись в промисах не лезь в Async/Await

const fsp = require('fs/promises');
const { basename, resolve }= require('path');

const filePath = (dirPath) => (fileName) => resolve(dirPath, fileName);
const isDir = (entry) => !entry.isDirectory();
const insertBasename = ({ file, ...tail }) => Object.assign(tail, { file, basename: basename(file) });
const insertTargetPath = (resolve) => ({ basename, ...t }) => ({ ...t,  basename, target: resolve(basename) });

function readFilePaths(dirPath) {
  const result = fsp.readdir(dirPath, { withFileTypes: true })
    .then((items) => items.filter(isDir))
    .then((files) => files.map(({ name }) => name))
    .then((files) => files.map(filePath(dirPath)));
  return result;
}

const sourceDirPath = resolve(__dirname, 'files');
const targetDirPath = resolve(__dirname, 'files-copy');
const sourcePaths = readFilePaths(sourceDirPath);
const targetDirCreated = fsp
  .rm(targetDirPath, {
    recursive: true,
    force: true,
  })
  .then(() => fsp.mkdir(targetDirPath, { recursive: true }));

Promise.all([sourcePaths, targetDirCreated])
  .then(([files]) => files)
  .then(files => files.map(file => ({ file })))
  .then(files => files.map(insertBasename))
  .then(files => files.map(insertTargetPath(filePath(targetDirPath))))
  .then(files => files.forEach(({ file, target }) => fsp.copyFile(file, target)));
