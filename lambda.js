// entry point for AWS Lambda

const check = require('./app.js');

var aws = require('aws-sdk');
var ses = new aws.SES({ region: 'eu-central-1' });

exports.handler = async (event, context) => {

  const results = await check();

  let mailText = "";
  results.forEach(result => {
    mailText += `${result}\n`;
  });

  var mailParams = {
    Destination: {
      ToAddresses: ["aws@michelneeser.ch"]
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
    Source: "aws@michelneeser.ch"
  };


  ses.sendEmail(mailParams, function (err, data) {
    if (err) {
      console.log(err);
      context.fail(err);
    } else {
      console.log(data);
      context.succeed(event);
    }
  });

  return results;
};