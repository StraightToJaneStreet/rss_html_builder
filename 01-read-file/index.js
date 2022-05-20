const path = require('path');
const fs = require('fs');

const urlText = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(urlText, {encoding: 'utf-8'});


stream.on('readable', () => {
  const data = stream.read();
  console.log(data);
  stream.close();
});
