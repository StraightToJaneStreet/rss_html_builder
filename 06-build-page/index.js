const path = require('path');
const { readdir, mkdir, rm, copyFile, readFile } = require('fs/promises');
const fs = require('fs');

async function buildPage() {

  const urlFiles = path.join(__dirname, 'assets');
  const urlCopyFile = path.join(__dirname, 'project-dist');
  const urlHtml = path.join(__dirname, 'template.html');
  const urlComponents = path.join(__dirname, 'components');

  await mkdir(urlCopyFile, {recursive: true});

  const readCopyFiles = await readdir(urlCopyFile);
  for (let copyFile of readCopyFiles) {
    await rm(path.join(urlCopyFile, copyFile), {recursive: true, force: true});
  }



  async function readHtml(url) {
    const writableStreamHtml = fs.createWriteStream(path.join(urlCopyFile, 'index.html'));
    let stream = await readFile(url, {encoding: 'utf-8'});
    const readHtmlComp = await readdir(urlComponents, {withFileTypes: true});
    for (let htmlFile of readHtmlComp) {
      if(htmlFile.isFile()){

        const urlFileHtml = path.join(urlComponents, htmlFile.name);
        const streamHtmlComponents = await readFile(urlFileHtml, {encoding: 'utf-8'});
        const nameFile = htmlFile.name.split('.');
        stream = stream.replace(`{{${nameFile[0]}}}`, streamHtmlComponents);
      }
    }
    writableStreamHtml.write(stream);
  }

  readHtml(urlHtml);

  async function readAssets(url, copyUrl) {
    const readFiles = await readdir(url, {withFileTypes: true});
    for (let file of readFiles) {
      if (!file.isFile()) {
        const resultCopyUrl = path.join(urlCopyFile, 'assets', file.name);
        await mkdir(path.join(resultCopyUrl), {recursive: true});
        readAssets(path.join(urlFiles, file.name), resultCopyUrl);
      } else {
        await copyFile (path.join(url, file.name), path.join(copyUrl, file.name));
      }

    }
  }
  readAssets(urlFiles);

  const urlReadCss = path.join(__dirname, 'styles');
  const writableStream = fs.createWriteStream(path.join(urlCopyFile, 'style.css'));

  const readCss = await readdir(urlReadCss, {withFileTypes: true});
  for (let cssFile of readCss) {
    if (cssFile.isFile() && cssFile.name.includes('css')) {
      const urlFileCss = path.join(urlReadCss, cssFile.name);
      const stream = fs.createReadStream(urlFileCss, {encoding: 'utf-8'});
      stream.on('data', (data) => {
        writableStream.write(data);
      });
    }
  }


}

buildPage();