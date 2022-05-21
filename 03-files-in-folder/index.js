const path = require('path');
const { readdir } = require('fs/promises');
const { stat } = require('fs');

async function readFiles() {
  
  const urlText = path.join(__dirname, 'secret-folder');
  const files = await readdir(urlText, {withFileTypes: true});
  for (let file of files) {
    
    if (file.isFile()) {
      const urlFile = path.join(urlText, file.name);
      stat(urlFile, (err, stats) => {
        const arrExtName = file.name.split('.');
        const size = stats.size / 1024;
        console.log(`${arrExtName[0]} - ${arrExtName[1]} - ${size}kb`);
      });
    }
  } 
  
}

readFiles();