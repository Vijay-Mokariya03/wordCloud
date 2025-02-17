const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const _ = require('lodash');

const filePath = workerData.filePath;

fs.readFile(filePath, 'utf-8', (err, fileContent) => {
    if (err) throw err;

    const words = fileContent.match(/\b\w+\b/g) || [];
    const wordCount = _.countBy(words);
    const sortedWords = _.chain(wordCount)
        .toPairs()
        .value();

    const outputData = sortedWords.map(([word, count]) => `${word} ${count}`);

    parentPort.postMessage(outputData);
});
