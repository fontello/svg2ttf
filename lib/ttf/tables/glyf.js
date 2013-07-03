'use strict';

var _ = require('lodash');

function fill(buf, font) {
  _.forEach(font.glyphs, function (glyph) {
    buf.writeInt16(glyph.contours.length); // numberOfContours
    buf.writeInt16(0); // instructionLength, is not used here

    // Array of flags
    _.forEach(glyph.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        buf.writeUInt8(point.onCurve ? 1 : 0);
      });
    });

    // Array of X coordinates
    _.forEach(glyph.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        buf.writeInt16(point.x);
      });
    });

    // Array of Y coordinates
    _.forEach(glyph.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        buf.writeInt16(point.y);
      });
    });
  });
}

module.exports.fillGlyf = fill;
