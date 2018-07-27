const moment = require('moment');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const formatTime = str => {

  const units = {
    'w': 'weeks',
    'd': 'days',
    'h': 'hours',
    'm': 'minutes'
  };

  if (str && str.includes('ago')) {
    const re = /(\d\d?)(\w)/;
    const res = str.match(re);
    if (res && units[res[2]]) {
      return moment().subtract(res[1], units[res[2]]).valueOf();
    }
  }

  return str

};

const parseArgs = () => {
  const command = {};
  const mainDefinitions = [{name: 'name', defaultOption: true}];
  const mainCommand = commandLineArgs(mainDefinitions, {stopAtFirstUnknown: true});

  let argv = mainCommand['_unknown'] || [];
  command.name = mainCommand['name'];

  switch (command.name) {
    case 'get':
      const groupDefinitions = [
        {name: 'group', defaultOption: true}
      ];

      const group = commandLineArgs(groupDefinitions, {argv, stopAtFirstUnknown: true});
      argv = group['_unknown'] || [];
      command.options = {group: group['group']};

      const definitions = [
        {name: 'stream', defaultOption: true},
        {name: 'watch', alias: 'w', type: Boolean},
        {name: 'timestamp', alias: 't', type: Boolean},
        {name: 'pattern', alias: 'p', type: String},
        {name: 'start', alias: 's', type: String},
        {name: 'end', alias: 'e', type: String},
      ];

      const options = commandLineArgs(definitions, {argv, stopAtFirstUnknown: true});
      argv = options['_unknown'] || [];
      command.options = {...command.options, ...options};

      break;
    case 'groups':

      const gDefinitions = [{name: 'prefix', defaultOption: true}];
      const gOptions = commandLineArgs(gDefinitions, {argv, stopAtFirstUnknown: true});
      command.options = {...gOptions};
      break;

    case 'streams':

      const sGroup = commandLineArgs([{name: 'group', defaultOption: true}], {argv, stopAtFirstUnknown: true});
      argv = sGroup['_unknown'] || [];
      command.options = {group: sGroup['group']};

      const sOptions = commandLineArgs([
        {name: 'prefix', defaultOption: true},
        {name: 'limit', alias: 'l'},
      ], {argv, stopAtFirstUnknown: true});
      command.options = {...command.options, ...sOptions};

      break;
  }

  return command;

};

const displayUsage = () => {
  const sections = [
    {
      header: 'awslogs',
      content: 'Simple command line tool for displaying AWS CloudWatch logs'
    },
    {
      header: 'Synopsis',
      content: '$ awslogs <command> [<group>] [<stream>] <options>'
    },
    {
      header: 'Command List',
      content: [
        {name: 'get', summary: 'Display events from a group or groups.'},
        {name: 'groups', summary: 'List existing groups.'},
        {name: 'streams', summary: 'List existing streams.'},
        {name: 'help', summary: 'Display this page.'},
        {name: 'version', summary: 'Print the version.'},
      ]
    },
    {
      header: 'Options',
      content: [
        {name: '--region', summary: 'AWS Region'},
        {name: '-s --start', summary: `Start time filter. Ex: '1h ago'`},
        {name: '-e --end', summary: `End time filter. . Ex: '30m ago'`},
        {name: '-w --watch', summary: 'Enable watch'},
        {name: '-t --timestamp', summary: 'Display timestamp for each event'},
        {name: '-p --pattern', summary: 'Moment.js pattern for formatting the timestamp'},
      ]
    }
  ];

  const usage = commandLineUsage(sections);
  console.log(usage);
};

exports.formatTime = formatTime;
exports.parseArgs = parseArgs;
exports.displayUsage = displayUsage;