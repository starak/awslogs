# awslogs
Simple command line tool for displaying AWS CloudWatch logs

#### Install
    npm i -g awslogs
    
#### Usage
    awslogs <command> [<group>] [<stream>] <options>
    
##### Example
    awslogs groups                // List existing groups
    awslogs streams my-group      // List existing streams
    awslogs get my-group          // Display events from a group
    awslogs get my-gr*            // Display events from all groups matching my-gr*
    
#### Commands
```
  get       Display events from a group or groups.
  groups    List existing groups.
  streams   List existing streams.
  help      Display Help page.
  version   Display the version.
```

#### Options
```
  -s --start        Start time filter. Ex: '1h ago'
  -e --end          End time filter.   Ex: '30m ago'
  -w --watch        Enable watch
  -t --timestamp    Display timestamp for each event
  -p --pattern      Moment.js pattern for formatting the timestamp
```