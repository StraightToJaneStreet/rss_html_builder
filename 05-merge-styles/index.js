// Не разобравшись в промисах не лезь в Async/Await

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const sourceDirPath = path.resolve(__dirname, 'styles');
const targetFile = path.resolve(__dirname, 'project-dist', 'bundle.css');

const outputStream = fs.createWriteStream(targetFile);

fsp.readdir(sourceDirPath, { withFileTypes: true })
  .then(entries => entries.filter(e => !e.isDirectory()))
  .then(files => files.map(({ name }) => name))
  .then(names => names.filter(name => path.extname(name) === '.css'))
  .then(names => names.map(name => path.resolve(sourceDirPath, name)))
  .then(paths => Promise.all(paths.map(pth => fsp.readFile(pth))))
  .then(contents => contents.forEach(content => outputStream.write(content)))
