// Не разобравшись в промисах не лезь в Async/Await

const { resolve, extname } = require('path');
const fsp = require('fs/promises');

const statsOfEntry = (dirPath) => (entryName) => {
  const filePath = resolve(dirPath, entryName);
  return fsp.stat(filePath).then(stats => ({
    name: entryName,
    isDir: stats.isDirectory(),
    size: stats.size,
  }));
}

function readStats(dirPath, entries) {
  const statsPromises = entries.map(statsOfEntry(dirPath));
  return Promise.all(statsPromises);
}

const rootPath = resolve(__dirname, 'secret-folder')
fsp.readdir(rootPath)
  .then(entries => readStats(rootPath, entries))
  .then(items => items.filter(({ isDir }) => !isDir))
  .then(items => items.map(({ name, size }) => ({ name, ext: extname(name).replace('.', ''), size})))
  .then(items => items.forEach(({name, ext, size}) => console.log(`${name} - ${ext} - ${size}B`)));