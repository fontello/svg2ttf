'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/glyf.htm

var _ = require('lodash');
var jDataView = require('jDataView');
var utils = require('../utils');

function tableSize(font) {
  var result = 4; // table header
  _.forEach(font.glyphs, function (glyph) {
    result += utils.glyphDataLength(glyph);
  });
  return result;
}

function createGlyfTable(font) {

  var buf = new jDataView(tableSize(font));

  _.forEach(font.glyphs, function (glyph) {
    buf.writeInt16(glyph.contours.length); // numberOfContours
    buf.writeInt16(0); // xMin
    buf.writeInt16(0); // yMin
    buf.writeInt16(glyph.width); // xMax
    buf.writeInt16(glyph.height); // yMax

    // Array of end points
    var endPtsOfContours = -1;

    var convertedContours = utils.convertToRelativePoints(utils.roundPoints(utils.interpolatePoints(glyph.contours)));

    _.forEach(convertedContours, function (contour) {
      endPtsOfContours += contour.length;
      buf.writeInt16(endPtsOfContours);
    });

    buf.writeInt16(0); // instructionLength, is not used here

    // Array of flags
    _.forEach(convertedContours, function (contour) {
      _.forEach(contour, function (point) {

        var flag = point.onCurve ? 1 : 0;

        if (-0xFF <= point.x && point.x <= 0xFF) {
          flag += 2; // the corresponding x-coordinate is 1 byte long
        }

        if (point.x > 0 && point.x <= 0xFF) {
          flag += 16; // If x-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative
        }

        if (-0xFF <= point.y && point.y <= 0xFF) {
          flag += 4; // the corresponding y-coordinate is 1 byte long
        }

        if (point.y > 0 && point.y <= 0xFF) {
          flag += 32; // If y-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative.
        }

        buf.writeUint8(flag);
      });
    });

    // Array of X relative coordinates
    _.forEach(convertedContours, function (contour) {
      _.forEach(contour, function (point) {
        if (-0xFF <= point.x && point.x <= 0xFF) {
          buf.writeUint8(Math.abs(point.x));
        } else {
          buf.writeInt16(point.x);
        }
      });
    });

    // Array of Y relative coordinates
    _.forEach(convertedContours, function (contour) {
      _.forEach(contour, function (point) {
        if (-0xFF <= point.y && point.y <= 0xFF) {
          buf.writeUint8(Math.abs(point.y));
        } else {
          buf.writeInt16(point.y);
        }
      });
    });
  });

  return buf;
}

module.exports = createGlyfTable;
