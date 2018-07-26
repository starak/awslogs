const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-west-1';
const {Subject} = require('rxjs');
const Promise = require('bluebird');
const streams = require("./streams");
const formatTime = require("./utils").formatTime;

const logSubject = new Subject();

exports.log = options => {
  start(options).catch(err => console.log(err));
  return logSubject;
};

async function start(options) {
  const cloudwatchlogs = new AWS.CloudWatchLogs({region: region});
  let loop = true, nextToken;

  while (loop) {
    await Promise.delay(options.interval || 2000);
    const logStreams = await streams.get(options);
    await Promise.map(logStreams.map(e => e.logStreamName), logStream => {
      const params = {
        logGroupName: options.group,
        logStreamName: logStream,
        startTime: options.start ? formatTime(options.start) : formatTime('1h ago'),
        nextToken
      };
      cloudwatchlogs.getLogEvents(params, (err, data) => {
        nextToken = data.nextForwardToken;
        data.events.forEach(event => {
          logSubject.next(event);
        });
      })
    });

    if(!options.watch){
      loop = false;
    }

  }
}