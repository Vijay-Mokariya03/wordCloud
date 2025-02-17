const fs = require('fs').promises;
const path = require('path');
const { Worker } = require('worker_threads');
const _ = require('lodash');

const inputFiles = './files/';
const outputFile = './output.txt';

async function readFiles(dir) {
  const files = await fs.readdir(dir);
  return files.map(file => path.join(dir, file));
}

async function processFiles() {
  const files = await readFiles(inputFiles);

  const wordCount = {}; 

  const workerPromises = files.map(async (file) => {
    const worker = new Worker('./workerThreads.js', { workerData: { filePath: file } });

    return new Promise((resolve, reject) => {
      worker.on('message', (outputData) => {
        outputData.forEach((item) => {
          const [word, count] = item.split(' ');
          wordCount[word] = (wordCount[word] || 0) + parseInt(count);
        });
        resolve();
      });
      worker.on('error', (error) => {
        reject(error);
      });
    });
  });

  await Promise.all(workerPromises);

  const sortedWords = _.chain(wordCount)
    .toPairs()
    .filter(pair => pair[1] > 1)
    .orderBy([1], ['desc'])
    .value();

  const maxFrequency = sortedWords[0][1];

  const outputData = sortedWords.map(([word, count]) => {
    let fontSize;
    if (count === maxFrequency) fontSize = 'Huge';
    else if (count > 0.6 * maxFrequency) fontSize = 'Big';
    else if (count > 0.3 * maxFrequency) fontSize = 'Normal';
    else fontSize = 'Small';

    return `${word}       ${count}       ${fontSize}`;
  });
  await fs.writeFile(outputFile, outputData.join('\n'));
  console.log(`File generated and saved to ${outputFile}`);
}

processFiles();






















/*

const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');

const inputFiles = './files/';
const outputFile = './output.txt';

async function readFiles() {
  try {
    const files = await fs.readdir(inputFiles);
    const fileContents = await Promise.all(
      files.map(file => fs.readFile(path.join(inputFiles, file)))
    );
    return fileContents.join(' ');
  } catch (err) {
    console.log('Error in reading files:', err);
    throw err;
  }
}

function processTexts(allTexts) {
  const words = allTexts.match(/\b\w+\b/g) || [];
  const wordCount = _.countBy(words);
  const filteredWordCount = _.pickBy(wordCount, count => count > 1);

  const sortedWords = _.chain(filteredWordCount)
    .toPairs()
    .orderBy([1], ['desc'])
    .value();

  const maxFrequency = sortedWords[0][1];
  const outputData = sortedWords.map(([word, count]) => {
    let fontSize;
    if (count === maxFrequency) {
      fontSize = 'Huge';
    } else if (count > 0.6 * maxFrequency) {
      fontSize = 'Big';
    } else if (count > 0.3 * maxFrequency) {
      fontSize = 'Normal';
    } else {
      fontSize = 'Small';
    }
    return `${word}     ${count}     ${fontSize}`;
  });

  return outputData.join('\n');
}

async function generateOutput() {
  try {
    const allWords = await readFiles();
    const outputData = processTexts(allWords);
    await fs.writeFile(outputFile, outputData);
    console.log(`File generated and saved to ${outputFile}`);
  } catch (err) {
    console.log('Error generating in outputFile:', err);
  }
}

generateOutput();

*/