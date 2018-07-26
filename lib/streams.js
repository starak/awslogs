const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-west-1';

exports.get = (input) => {
  input.limit = input.limit || 1;
  const cloudwatchlogs = new AWS.CloudWatchLogs({region: region});
  let nextToken, logStreams = [], count=0, times = Math.ceil(input.limit / 50);

  const params = {
    limit: Math.min(input.limit, 50),
    logGroupName: input.group,
    descending: !input.prefix,
    orderBy: !!input.prefix ? 'LogStreamName' : 'LastEventTime',
  };

  if(input.prefix){
    params.logStreamNamePrefix = String(input.prefix);
  }

  return new Promise((resolve, reject) => {
    function getStreams(){
      if(nextToken){
        params.nextToken = nextToken;
      }
      if(count === times){
        params.limit = input.limit % 50;
      }

      cloudwatchlogs.describeLogStreams(params, function (err, data) {
        if (err) {
          reject(err);
        }
        else {
          nextToken = data.nextToken;
          logStreams = logStreams.concat(data.logStreams);
          count++;
          if(count<times){
            getStreams();
          }else{
            resolve(logStreams)
          }
        }
      });
    }
    getStreams();
  });

};