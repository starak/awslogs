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
let time, prefix;
require('console-stamp')(console, {
  label: false,
  datePrefix: '',
  dateSuffix: '',
  colors: {
    stamp: ['yellow']
  },
  formatter: () => {
    if (prefix || command.options.timestamp) {
      let string = [];
      if (command.options.timestamp && time) {
        string.push(moment(time).format(command.options.pattern || 'MM/DD/YYYY HH:mm:ss:SSS'));
      }
      if (prefix) {
        string.push(prefix);
      }
      return string.length > 0 ? string.join(' ') : '';
    }
    if (!time || !command.options.timestamp) {
      return '';
    }

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
        //console.log(event);
        time = event.timestamp;
        prefix = event.multi ? event.prefix : undefined;
        console.log(event.message.replace(/\n$/,''));
      },
      err => console.error(err),
      () => console.log("DONE")
    );
    break;
  case 'version':
    console.log(pack.version);
}
