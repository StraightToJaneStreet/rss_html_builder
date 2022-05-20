const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;


const urlText = path.join(__dirname, 'text.txt');
let writableStream = fs.createWriteStream(urlText);


stdout.write('Hello, enter text!\n');

stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  writableStream.write(data.toString());
});


process.on('SIGINT', () => {
  process.exit();
});
process.on('exit', () => {
  stdout.write('The END!');
});


