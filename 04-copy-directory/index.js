const path = require('path');
const { readdir, mkdir, rm, copyFile } = require('fs/promises');

async function copyFiles() {
  
  const urlFiles = path.join(__dirname, 'files');
  const urlCopyFile = path.join(__dirname, 'files-copy');
  await mkdir(`${__dirname}/files-copy`, {recursive: true});

  const readCopyFiles = await readdir(urlCopyFile);
  for (let copyFile of readCopyFiles) {
    await rm(`${__dirname}/files-copy/${copyFile}`, {recursive: true});
  } 
  
  const readFiles = await readdir(urlFiles);
  for (let file of readFiles) {
    await copyFile (`${__dirname}/files/${file}`, `${__dirname}/files-copy/${file}`);
  }
}

copyFiles();