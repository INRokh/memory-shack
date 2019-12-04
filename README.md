# Memory Shack

## Background

Most of us accumulate a lot of paper documents: recipes, prescriptions, notes, contact information, lucky lottery numbers etc. After a couple of years it’s very hard to find a document you need - you have to go through each of them. It is also hard to store the physical objects.

This is getting better overtime. Now you can take a photo of a document and store it in the cloud. Applications like Google Photos allow to upload and organize images. They are good for photos, but lack functionality needed to search specific documents. 

Image recognition is a technology used in Google Photos to tag and organize images. It allows to identify certain objects in images. OCR (Optical character recognition) is a technology that allows to recognize text.


## Goal

This is an application that extracts text from images and uses it as a search index.

## Major user scenarios

### Adding a document

User uploads a photo of a document.
OCR extracts text from the photo.
The user can correct or extend the text.
The text is stored in database.
The text in the database is indexed.

### Finding a document

User enters a search term.
The system looks up the search term in the index.
The system returns matching results. 
Technology stack
Node.js, GCP Vision API, GCP Cloud Functions, GCP Pub/Sub, GCS, React.

## Technology stack

Node.js, GCP Vision API, GCP Cloud Functions, GCP Pub/Sub, GCS, React.

## High level design 

Application consists of the following components:
- Image recognition backend
- Frontend  app
- Image resize backend

Frontend allows to upload images and search images by text. Image recognition backend extracts text from images and stores it in a database. Image resize backend creates copies of an image with different sizes. 

The data will be stored in Firestore and queried using [Algolia](https://cloud.google.com/firestore/docs/solutions/search). The authentication is implemented using Firebase Authentication. Example apps: [expenses](https://cloud.google.com/blog/products/application-development/serverless-in-action-building-a-simple-backend-with-cloud-firestore-and-cloud-functions).

## Detailed Design

## Testing

## Deployment

### Deployment to Google Cloud

1. Create a new project in GCP.
1. Enable the Cloud Functions, Cloud Pub/Sub, Cloud Storage, Cloud Translation, and Cloud Vision APIs.
1. Install Google Cloud SDK (on Mac OSX):

```shell
brew cask install google-cloud-sdk
```

4. Update gcloud components:

```shell
gcloud components update
```

5.  Install the latest version of Node.js:

```shell
nvm install stable
```

6.  Initialize gcloud:

```shell
gcloud init
```

7. Create a Cloud Storage bucket to upload your images, where YOUR_IMAGE_BUCKET_NAME is a globally unique bucket name:

```shell
gsutil mb gs://YOUR_IMAGE_BUCKET_NAME
```

8. Create a Cloud Storage bucket to save the result, where YOUR_TEXT_BUCKET_NAME is a globally unique bucket name:

```shell
gsutil mb gs://YOUR_TEXT_BUCKET_NAME
```

9. Clone this repository and cd into it:

```shell
git clone https://github.com/INRokh/memory-shack
cd memory-shack
```

10. Create a config.json file in the app directory with the following contents:

```shell
{
    "RESULT_TOPIC": "YOUR_RESULT_TOPIC_NAME",
    "RESULT_BUCKET": "YOUR_TEXT_BUCKET_NAME"
}
```

Replace YOUR_RESULT_TOPIC_NAME with a Pub/Sub topic name to be used for saving results.

Replace YOUR_TEXT_BUCKET_NAME with a bucket name used for saving text results.

### Deploying the functions

1. To deploy the image processing function with a Cloud Storage trigger, run the following command in the app directory:

```shell
gcloud functions deploy ocr-extract --runtime nodejs8 --trigger-bucket YOUR_IMAGE_BUCKET_NAME --entry-point processImage
```

2. To deploy the function that saves results to Cloud Storage with a Cloud Pub/Sub trigger, run the following command in the app directory:

```shell
gcloud functions deploy ocr-save --runtime nodejs8 --trigger-topic YOUR_RESULT_TOPIC_NAME --entry-point saveResult
```

3. To deploy the frontend app functions, run

```shell
 gcloud functions deploy frontend --runtime nodejs8 --trigger-http --entry-point app
 ```

### Uploading an image

1. Upload an image to your image Cloud Storage bucket:

```shell
gsutil cp PATH_TO_IMAGE gs://YOUR_IMAGE_BUCKET_NAME
```

- PATH_TO_IMAGE is a path to an image file (that contains text) on your local system.
- YOUR_IMAGE_BUCKET_NAME is the name of the bucket where you are uploading images.

2. Watch the logs to be sure the executions have completed:

```shell
gcloud functions logs read --limit 100
```