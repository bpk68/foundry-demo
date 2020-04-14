'use strict';

const https = require('https');

module.exports.quoteOfTheDay = async (event, context) => {

  return new Promise((resolve, reject) => {
    https.get('https://quotes.rest/qod?language=en', res => {
      res.on('data', d => {
        try {
          const data = JSON.parse(d.toString('utf-8'));
          const quote = {
            quote: data.contents.quotes[0].quote,
            by: data.contents.quotes[0].author
          };

          resolve(JSON.stringify(quote, null, 2));
        } catch (err) {
          reject(err);
        }
      });

    }).on('error', (e) => {
      reject(Error(e))
    });
  });
};
