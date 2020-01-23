// entry point for AWS Lambda

const check = require('./app.js');

var aws = require('aws-sdk');
var ses = new aws.SES({ region: 'eu-central-1' });

exports.handler = async () => {

  const results = await check();

  let mailText = '';
  results.forEach(result => {
    mailText += `${result}\n\n`;
  });

  const receiver = 'aws@michelneeser.ch';

  var mailParams = {
    Destination: {
      ToAddresses: [receiver]
    },
    Message: {
      Body: {
        Text: {
          Data: mailText
        }
      },
      Subject: {
        Data: "Page Checker"
      }
    },
    Source: receiver,
    ReturnPath: receiver
  };

  console.log(`sending email to ${receiver}...`);
  try {
    await ses.sendEmail(mailParams).promise();
    console.log(`email sent!`);
  } catch (err) {
    console.log(err);
  }

  return results;
};