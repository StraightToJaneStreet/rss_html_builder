const { createWriteStream } = require('fs');
const { resolve } = require('path');
const { createInterface: createRli } = require('readline');

const stopReading = (rli) => () => rli.close();
const lineHandler = ({ fnStop, fnWrite }) => (line) => line === 'exit' ? fnStop() : fnWrite(line);

const outputStream = createWriteStream(resolve(__dirname, "text.txt"));

const rli = createRli({
  input: process.stdin,
  output: process.stdout,
  historySize: 0,
});

rli.write('Hello!\n');

rli.on('close', () => console.log('End'));
rli.on('SIGINT', stopReading(rli));
rli.on('line', lineHandler({
  fnStop: stopReading(rli),
  fnWrite: outputStream.write.bind(outputStream)
}));
