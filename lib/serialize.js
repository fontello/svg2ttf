'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

var serialize = {

  getLength: function (object, schema) {
    var length = 0;
    _.forEach(schema, function (schemaProperty) {
      if (_.isArray(schemaProperty.value)) {
        _.forEach(object[schemaProperty.name], function (elem) {
          length += this.getLength(elem, schemaProperty.value);
        }, this)
      }
      else
        length += schemaProperty.length;
    }, this);
    return length;
  },

  writeToBuffer: function (object) {
    return new Buffer(0); //under construction
  }
};

exports.Serialize = serialize;