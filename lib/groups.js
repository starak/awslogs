const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-west-1';

exports.get = (input) => {
  const cloudwatchlogs = new AWS.CloudWatchLogs({region: region});
  let nextToken;
  let logGroups = [];

  const params = {
    limit: 50
  };

  if(input.prefix){
    params.logGroupNamePrefix = input.prefix;
  }

  return new Promise((resolve, reject) => {
    function gg() {
      if (nextToken) {
        params.nextToken = nextToken;
      }

      cloudwatchlogs.describeLogGroups(params, function (err, data) {
        if (err) {
          reject(err);
        }
        else {
          nextToken = data.nextToken;
          logGroups = logGroups.concat(data.logGroups);
          if (data.logGroups.length === 50) {
            gg();
          }else{
            resolve(logGroups);
          }
        }
      });
    }
    gg();
  });

};