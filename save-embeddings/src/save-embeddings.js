import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import { normalize } from 'path';
const inputFile = 'organized-data.json';
const outputData = {
  concepts: [],
  visuals: [],
};

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/bge-large-en-v1.5'
);

const data = fs.readFileSync(inputFile, 'utf-8');
const jsonData = JSON.parse(data);
try {
  for (let i = 0; i < jsonData.concepts.length; i++) {
    let conceptData = jsonData.concepts[i].description;
    let conceptEmbedding = await extractor(conceptData, {
      pooling: 'mean',
      normalize: true,
    });
    outputData.concepts.push({
      summary: jsonData.concepts[i].summary,
      description: conceptData,
      embedding: conceptEmbedding.tolist()[0],
    });
  }
} catch (error) {
  console.log('generating concepts error: ', error);
}

try {
  for (let i = 0; i < jsonData.visuals.length; i++) {
    let visualData = jsonData.visuals[i].description;
    let visualEmbedding = await extractor(visualData, {
      pooling: 'mean',
      normalize: true,
    });
    outputData.visuals.push({
      summary: jsonData.visuals[i].summary,
      description: visualData,
      embedding: visualEmbedding.tolist()[0],
    });
  }
} catch (error) {
  console.log('generating visuals error: ', error);
}

const outputJSON = JSON.stringify(outputData, null, 2);
fs.writeFileSync('finalData-test.json', outputJSON);

// const output = JSON.stringify(outputJSON, null, 2);
// fs.writeFileSync('artCap-embeddings.json', output);

// uploaded data: https://gist.githubusercontent.com/clarayao/ee9231e8aeb52603acd0b9e57ac2cb2c/raw/2a19dcde57a46b443e5519ac7e275db09be3ae0c/artCap-embeddings-500.json
