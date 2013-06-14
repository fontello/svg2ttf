'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;
var jDataView = require('jDataView');
var tableDefs = require("./tabledefs").TableDefs;

//------------------------constants--------------------------

//sizes
var SIZE_OF = {
  HEADER: 12,
  TABLE_HEADER: 16
};

//various constants
var CONST = {
  VERSION: 0x10000
}

var serialize = {


  getLength: function (object, schema) {
    var length = 0;
    _.forEach(schema, function (property) {
      if (_.isArray(property.value)) {
        _.forEach(object[property.name], function (elem) {
          length += this.getLength(elem, property.value);
        }, this)
      }
      else
        length += property.length;
    }, this);
    return length;
  },

  toBuffer: function (tables) {
    var tableCount = tableDefs.length;
    var entrySelector = Math.floor(Math.log(tableCount, 2));
    var searchRange = Math.pow(2, entrySelector) * 16;
    var rangeShift = tableCount * 16;

    var bufferSize = SIZE_OF.HEADER + SIZE_OF.TABLE_HEADER * tableCount;
    var tableLengths = [];
    _.forEach(tableDefs, function (tableDef) {
        var table = tables[tableDef.name];
        var tableLength = this.getLength(table, tableDef.schema);
        tableLengths.push(tableLength);
      bufferSize += tableLength;
    }, this);

    var buffer = new Buffer(bufferSize);
    var view = new jDataView.jDataView(buffer);

    //add TTF header
    view.writeInt32(CONST.VERSION);
    view.writeUint16(tableCount);
    view.writeUint16(searchRange);
    view.writeUint16(entrySelector);
    view.writeUint16(rangeShift);
    var tableOffset = SIZE_OF.HEADER + SIZE_OF.TABLE_HEADER * tableCount;

    //add table headers
    var i = 0;
    _.forEach(tableDefs, function (tableDef) {
      var table = tables[tableDef.name];
      var checkSum = 0; //TODO: calculate actial checksum
      view.writeUint32(tableDef.innerName);
      view.writeUint32(checkSum);
      view.writeUint32(tableOffset);
      view.writeUint32(tableLengths[i]);
      tableOffset += tableLengths[i];
      i++;
    }, this);

    //add table data
    _.forEach(tableDefs, function (tableDef) {
      console.log("table " + tableDef.name);
      this.addObject(view, tables[tableDef.name], tableDef.schema, '  ');
    }, this);

    return buffer;
  },

  addObject: function(view, value, schema, offset) {
    var length = 0;
    _.forEach(schema, function (property) {
      if (_.isArray(property.value)) {
        console.log(offset + "write to array " + property.name);
        _.forEach(value[property.name], function (elem) {
          length += this.addObject(view, elem, property.value, offset + '  ');
        }, this)
      }
      else {
        console.log(offset + "write " + (_.isObject(value) ? value[property.name] : value)  + " to " + (property.name ? property.name : "unnamed property")  + (property.signed ? " signed" : "" + " with length " + property.length));
        this.addValue(view, _.isObject(value) ? value[property.name] : value, property.length, property.signed);
      }
      }, this);
  },

  addValue: function(view, value, length, signed) {
    if (value == undefined)
      value = 0;
    switch (length) {
      case 1:
        signed ? view.writeInt8(value) : view.writeUint8(value);
        break;
      case 2:
        signed ? view.writeInt16(value) : view.writeUint16(value);
        break;
      case 4:
        signed ? view.writeInt32(value) : view.writeUint32(value);
        break;
      case 8:
        signed ? view.writeInt64(value) : view.writeUint64(value);
        break;
    }
  }
};

exports.Serialize = serialize;