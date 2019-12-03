# Memory Shack

## Goal

This is an application that extracts text from images and uses it as a search index.

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