# Voice Foundry

Tech demo for Voice Foundry

## Initialisation and project setup

Load the repository and run the following command to initialise the project:

```
yarn install
```

## Running the code

To kick things off, you can run the following [serverless](https://serverless.com) command:

```
serverless deploy
```

OR

```
sls deploy
```


## What does the code do?

The code performs several functions as part of the serverless deploy:

1. It provisions three resources within an AWS stack
    1. a Lambda function which fetches a quote of the day from [They Said So Quotes](https://quotes.rest/)
    2. an S3 bucket
    3. a DynamoDB table
2. Following a successful deployment and resource allocation, it calls the [serverless-s3-sync](https://github.com/k1LoW/serverless-s3-sync) plugin to copy a local `names.json` file into our provisioned S3 bucket.
3. Finally, it runs the local plugin, 'file-extractor' to extract the contents of the `names.json` file into our provisioned DynamoDB table
