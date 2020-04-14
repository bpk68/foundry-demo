'use strict';

// Imports
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');
const chalk = require('chalk');



class FileExtractor {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      extract: {
        usage: 'Helps you extract data from a file from an S3 bucket into a DynamoDB Table',
        lifecycleEvents: []
      },
    };

    this.hooks = {
      'after:deploy:deploy': this.deploy.bind(this),
    };

    aws.config.update({
      region: this.serverless.service.provider.region,
    });
  }

  _log(message, includeTag = true) {
    this.serverless.cli.consoleLog(`${includeTag ? 'File Extractor: ' : ''}${chalk.magenta(message)}`);
  };

  _invokeFunc() {
    return new Promise((resolve, reject) => {
      new aws.Lambda().invoke({
        FunctionName: 'foundry-tech-demo-dev-quoteOfTheDay'
      }, (error, data) => {
        if (error) {
          reject(error);
        }

        this._log('quote fetched successfully VVV');

        try {
          const payload = JSON.parse(data.Payload.toString());
          this._log(payload, false);
        } catch (err) {
          this._log('the file had no body when loaded...');
        }

        resolve();
      });
    });
  }

  _extractData() {
    const sls = this.serverless;
    const fileExtractor = sls.service.custom.fileExtractor;
    let bucketName,
      fileName;

    fileExtractor.forEach(s => {
      if (s.hasOwnProperty('bucketName')) {
        bucketName = s.bucketName;
      }
      if (s.hasOwnProperty('fileName')) {
        fileName = s.fileName;
      }
    })

    return new Promise((resolve, reject) => {
      new aws.S3().getObject({
        Bucket: bucketName,
        Key: fileName
      }, (error, data) => {
        if (error) {
          reject(error);
        }
        this._log(`file contents read from S3 bucket '${bucketName}'!`);

        try {
          sls.variables.extractedFileContents = data.Body.toString();
        } catch (err) {
          this._log('the file had no body when loaded...');
        }

        resolve();
      })
    });
  }

  _writeToTable() {
    const sls = this.serverless;
    const fileExtractor = sls.service.custom.fileExtractor;
    let tableName;

    fileExtractor.forEach(s => {
      if (s.hasOwnProperty('tableName')) {
        tableName = s.tableName;
      }
    });

    return new Promise((resolve, reject) => {
      new aws.DynamoDB().putItem({
        TableName: tableName,
        Item: {
          'nameId': {
            S: uuidv4()
          },
          'contents': {
            S: sls.variables.extractedFileContents
          }
        }
      }, error => {
        if (error) {
          reject(error);
        }
        this._log(`file contents written successfully to table '${tableName}'!`);
        resolve();
      });
    });
  }

  deploy() {
    this._invokeFunc()
      .then(() => this._extractData())
      .then(() => this._writeToTable());
  };
}

module.exports = FileExtractor;
