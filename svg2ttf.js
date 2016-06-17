#!/usr/bin/env node
/*
 Author: Sergey Batishchev <sergej.batishchev@gmail.com>

 Written for fontello.com project.
 */

/*eslint-disable no-console*/

'use strict';


var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;

var svg2ttf = require('./');


var parser = new ArgumentParser({
  version: require('./package.json').version,
  addHelp: true,
  description: 'SVG to TTF font converter'
});

parser.addArgument(
  [ '-c', '--copyright' ],
  {
    help: 'Copyright text',
    required: false
  }
);

parser.addArgument(
  [ '--ts' ],
  {
    help: 'Override font creation time (Unix time stamp)',
    required: false,
    type: 'int'
  }
);

parser.addArgument(
  [ '--v', '--font-version' ],
  {
    help: 'Version',
    required: false,
    dest: 'version'
  }
);

parser.addArgument(
  [ '--vma', '--version-major' ],
  {
    help: 'Major Version',
    required: false,
    defaultValue: 1,
    type: 'int',
    dest: 'versionMajor'
  }
);

parser.addArgument(
  [ '--vmi', '--version-minor' ],
  {
    help: 'Minor Version',
    required: false,
    defaultValue: 0,
    type: 'int',
    dest: 'versionMinor'
  }
);

parser.addArgument(
  [ '--vs', '--version-suffix' ],
  {
    help: 'Other Version Info',
    required: false,
    dest: 'versionSuffix'
  }
);

parser.addArgument(
  [ 'infile' ],
  {
    nargs: 1,
    help: 'Input file'
  }
);

parser.addArgument(
  [ 'outfile' ],
  {
    nargs: 1,
    help: 'Output file'
  }
);


var args = parser.parseArgs();
var svg;
var options = {};

try {
  svg = fs.readFileSync(args.infile[0], 'utf-8');
} catch (e) {
  console.error("Can't open input file (%s)", args.infile[0]);
  process.exit(1);
}

if (args.copyright) {
  options.copyright = args.copyright;
}
if (args.version) {
  options.version = args.version;
} else if (args.versionMajor) {
  options.version = {
    major: args.versionMajor,
    minor: 0,
    suffix: null
  };
  if (args.versionMinor) {
    options.version.minor = args.versionMinor;
  }
  if (args.versionSuffix) {
    options.version.suffix = args.versionSuffix;
  }
}


if (args.ts !== null) {
  options.ts = args.ts;
}

fs.writeFileSync(args.outfile[0], new Buffer(svg2ttf(svg, options).buffer));
