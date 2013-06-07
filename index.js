/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.
 */

'use strict';

var DOMParser = require('xmldom').DOMParser;
var _ = require('lodash');

//main
function svg2ttf(buf, options, callback) {
  callback(null, new Buffer(0)); //just a stub
}

module.exports = svg2ttf;
