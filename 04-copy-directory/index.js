const path = require('path');
const { readdir, mkdir, rm, copyFile } = require('fs/promises');

async function copyFiles() {
  
  const urlFiles = path.join(__dirname, 'files');
  const urlCopyFile = path.join(__dirname, 'files-copy');
  await mkdir(urlCopyFile, {recursive: true});

  const readCopyFiles = await readdir(urlCopyFile);
  for (let copyFile of readCopyFiles) {
    await rm(path.join(urlCopyFile, copyFile), {recursive: true});
  } 
  
  const readFiles = await readdir(urlFiles);
  for (let file of readFiles) {
    await copyFile(path.join(urlFiles, file), path.join(urlCopyFile, file));
  }
}

copyFiles();