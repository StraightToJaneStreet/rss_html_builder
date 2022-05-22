const path = require('path');
const { readdir } = require('fs/promises');
const fs = require('fs');

async function mergeFiles() {
  
  
  const urlNewCss = path.join(__dirname, 'project-dist');
  const urlReadCss = path.join(__dirname, 'styles');
  
  const writableStream = fs.createWriteStream(`${urlNewCss}/bundle.css`);

  const readCss = await readdir(urlReadCss, {withFileTypes: true});
  for (let cssFile of readCss) {
    if (cssFile.isFile() && cssFile.name.includes('css')) {
      const urlFileCss = `${urlReadCss}/${cssFile.name}`;
      const stream = fs.createReadStream(urlFileCss, {encoding: 'utf-8'});
      stream.on('data', (data) => {
        writableStream.write(data);
      });
    }
  } 
}

mergeFiles();
