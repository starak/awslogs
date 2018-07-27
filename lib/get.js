const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-west-1';
const {Subject} = require('rxjs');
const Promise = require('bluebird');
const streams = require("./streams");
const groups = require('./groups');
const formatTime = require("./utils").formatTime;

const logSubject = new Subject();

exports.log = options => {
  start(options).catch(err => console.log(err));
  return logSubject;
};

async function start(options) {
  const cloudwatchlogs = new AWS.CloudWatchLogs({region: region});
  let loop = true, nextToken;

  const isWild = /\*$/.test(options.group);
  const logGroups = isWild ? (await groups.get({...options, prefix: options.group.replace('*', '')})).map(e => e.logGroupName) : [options.group];

  while (loop) {
    await Promise.delay(options.interval || 2000);
    if (logGroups && logGroups.length > 0) {
      await Promise.map(logGroups, async group => {
        //console.log(group);
        const logStreams = await streams.get({...options, group});
        await Promise.map(logStreams.map(e => e.logStreamName), logStream => {
          const params = {
            logGroupName: group,
            logStreamName: logStream,
            startTime: options.start ? formatTime(options.start) : formatTime('1h ago'),
            nextToken
          };
          cloudwatchlogs.getLogEvents(params, (err, data) => {
            if(err){
              console.log('ERROR',err);
              return;
            }
            nextToken = data.nextForwardToken;
            data.events.forEach(event => {
              logSubject.next({...event, prefix: group, multi: isWild});
            });
          })
        });
      })
    } else {
      console.log('No matching LogGroups');
      loop = false;
    }
    if (!options.watch) {
      loop = false;
    }

  }
}