'use strict';

const config = require('nconf')
  .env()
  .file('./config.json');

// Get a reference to the Pub/Sub component
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
// Get a reference to the Cloud Storage component
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

// Get a reference to the Cloud Vision API component
const Vision = require('@google-cloud/vision');
const vision = new Vision.ImageAnnotatorClient();

/**
 * Publishes the result to the given pubsub topic and returns a Promise.
 *
 * @param {string} topicName Name of the topic on which to publish.
 * @param {object} data The message data to publish.
 */

const publishResult = async (topicName, data) => {
  const dataBuffer = Buffer.from(JSON.stringify(data));

  const [topic] = await pubsub.topic(topicName).get({autoCreate: true});
  topic.publish(dataBuffer);
};

/**
 * Detects the text in an image using the Google Vision API.
 *
 * @param {string} bucketName Cloud Storage bucket name.
 * @param {string} filename Cloud Storage file name.
 * @returns {Promise}
 */

const detectText = async (bucketName, filename) => {
  console.log(`Looking for text in image ${filename}`);
  const [textDetections] = await vision.textDetection(
    `gs://${bucketName}/${filename}`
  );
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description : '';
  console.log(`Extracted text from image:`, text);

  const messageData = {
    text: text,
    filename: filename,
  };

  await publishResult(config.get('RESULT_TOPIC'), messageData);
};

/**
 * Appends a .txt suffix to the image name.
 *
 * @param {string} filename Name of a file.
 * @returns {string} The new filename.
 */
const renameImageForSave = (filename) => {
  return `${filename}.txt`;
};

/**
 * This function is exported by index.js, and is executed when
 * a file is uploaded to the Cloud Storage bucket you created
 * for uploading images.
 *
 * @param {object} event A Google Cloud Storage File object.
 */

exports.processImage = async event => {
  const {bucket, name} = event;

  if (!bucket) {
    throw new Error(
      'Bucket not provided. Make sure you have a "bucket" property in your request'
    );
  }
  if (!name) {
    throw new Error(
      'Filename not provided. Make sure you have a "name" property in your request'
    );
  }

  await detectText(bucket, name);
  console.log(`File ${name} processed.`);
};

/**
 * This function is exported by index.js, and is executed when
 * a message is published to the Cloud Pub/Sub topic specified
 * by the RESULT_TOPIC value in the config.json file. The
 * function saves the data packet to a file in GCS.
 *
 * @param {object} event The Cloud Pub/Sub Message object.
 * @param {string} {messageObject}.data The "data" property of the Cloud Pub/Sub
 * Message. This property will be a base64-encoded string that you must decode.
 */

exports.saveResult = async event => {
  const pubsubData = event.data;
  const jsonStr = Buffer.from(pubsubData, 'base64').toString();
  const {text, filename} = JSON.parse(jsonStr);

  if (!text) {
    throw new Error(
      'Text not provided. Make sure you have a "text" property in your request'
    );
  }
  if (!filename) {
    throw new Error(
      'Filename not provided. Make sure you have a "filename" property in your request'
    );
  }

  console.log(`Received request to save file ${filename}`);

  const bucketName = config.get('RESULT_BUCKET');
  const newFilename = renameImageForSave(filename);
  const file = storage.bucket(bucketName).file(newFilename);

  console.log(`Saving result to ${newFilename} in bucket ${bucketName}`);

  await file.save(text);
  console.log(`File saved.`);
};