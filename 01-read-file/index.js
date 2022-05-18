const fs = require('fs');
const path = require('path');

const fileName = 'text.txt';
const filePath = path.resolve(__dirname, fileName);

const inputStream = fs.createReadStream(filePath);

inputStream.pipe(process.stdout)
