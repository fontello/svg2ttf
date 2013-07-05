'use strict';

var _ = require('lodash');

var Font = function () {
  this.glyphs = [];
  this.ascent = 850;
  this.descent = -151;
  this.lineGap = 90;
  this.advanceWidthMax = 1063;
  this.minLeftSideBearing = 0;
  this.minRightSideBearing = -1;
  this.xMaxExtent = 1064;
  this.familyName = '';
  this.copyright = '';
  this.xMin = 0;
  this.yMin = -151;
  this.xMax = 1064;
  this.yMax = 850;
  this.macStyle = 0;
  this.lowestRecPPEM = 0;
  this.weightClass = 400; // normal
  this.widthClass = 5; // Medium (normal)
  this.fsType = 8; // No subsetting: When this bit is set, the font may not be subsetted prior to embedding.
  this.ySubscriptXSize = 650;
  this.ySubscriptYSize = 700;
  this.ySubscriptXOffset = 0;
  this.ySubscriptYOffset = 140;
  this.ySuperscriptXSize = 650;
  this.ySuperscriptYSize = 700;
  this.ySuperscriptXOffset = 0;
  this.ySuperscriptYOffset = 480;
  this.yStrikeoutSize = 49;
  this.yStrikeoutPosition = 258;
  this.familyClass = 0; // No Classification
  this.fsSelection = 0x40; // Characters are in the standard weight/style for the font.
  this.sfntNames = [];

//getters
  this.__defineGetter__('avgCharWidth', function () {
    if (this.glyphs.length === 0) {
      return 0;
    }
    var widths = _.map(this.glyphs, 'width');
    return parseInt(widths.reduce(function(prev, cur) {
      return prev + cur;
    }) / widths.length, 10);
  });
};


var Glyph = function () {
  this.id = '';
  this.unicode = 0;
  this.name = '';
  this.isMissed = false;
  this.height = 0;
  this.width = 0;
  this.size = 0;
  this.lsb = 0;
  this.contours = [];
};

var Contour = function () {
  this.points = [];
};

var Point = function () {
  this.x = 0;
  this.y = 0;
  this.onCurve = true;
};

var SfntName = function () {
  this.id = 0;
  this.value = '';
};

module.exports.Font = Font;
module.exports.Glyph = Glyph;
module.exports.Contour = Contour;
module.exports.Point = Point;
module.exports.SfntName = SfntName;
