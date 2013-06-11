'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

var serialize = {

  getLength: function (object, schema) {
    return 0; //under construction
    var length = 0;
    _.forEach(schema, function (property) {
      if (_.isArray(property.value))
        length += getTableLength(object[property.name], property);
      else
        length += property.length;
    });
    return length;
  },

  writeToBuffer: function (object) {
    return new Buffer(0); //under construction
  }
}

exports.Serialize = serialize;