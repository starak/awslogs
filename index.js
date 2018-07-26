#!/usr/bin/env node

const utils = require('./lib/utils');
const command = utils.parseArgs();
const groups = require('./lib/groups');
const streams = require('./lib/streams');
const get = require('./lib/get');
const moment = require('moment');
const pack = require('./package.json');

if (command.name === 'help' || !command.name) {
  utils.displayUsage();
}
let time;
require('console-stamp')(console, {
  label: false,
  datePrefix: '',
  dateSuffix: '',
  colors: {
    stamp: ['yellow']
  },
  formatter: () => {
    if (!time || !command.options.timestamp) {
      return '';
    }
    return moment(time).format(command.options.pattern || 'MM/DD/YYYY HH:mm:ss:SSS');
  }
});

switch (command.name) {
  case 'groups':
    groups.get(command.options).then(g => console.log(g.map(e => e.logGroupName).join('\n')));
    break;
  case 'streams':
    streams.get(command.options).then(s => console.log(s.map(e => e.logStreamName).join('\n')));
    break;
  case 'get':
    get.log(command.options).subscribe(
      event => {
        time = event.timestamp;
        console.log(event.message);
      },
      err => console.error(err),
      () => console.log("DONE")
    );
    break;
  case 'version':
    console.log(pack.version);
}
