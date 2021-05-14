'use strict';

var _ = require('lodash');

function Font() {
  this.ascent = 850;
  this.copyright = '';
  this.createdDate = new Date();
  this.glyphs = [];
  this.ligatures = [];
  // Maping of code points to glyphs.
  // Keys are actually numeric, thus should be `parseInt`ed.
  this.codePoints = {};
  this.isFixedPitch = 0;
  this.italicAngle = 0;
  this.familyClass = 0; // No Classification
  this.familyName = '';

  // 0x40 - REGULAR - Characters are in the standard weight/style for the font
  // 0x80 - USE_TYPO_METRICS - use OS/2.sTypoAscender - OS/2.sTypoDescender + OS/2.sTypoLineGap as the default line spacing
  // https://docs.microsoft.com/en-us/typography/opentype/spec/os2#fsselection
  // https://github.com/fontello/svg2ttf/issues/95
  this.fsSelection = 0x40 | 0x80;

  // Non zero value can cause issues in IE, https://github.com/fontello/svg2ttf/issues/45
  this.fsType = 0;
  this.lowestRecPPEM = 8;
  this.macStyle = 0;
  this.modifiedDate = new Date();
  this.panose = {
    familyType: 2, // Latin Text
    serifStyle: 0, // any
    weight: 5, // book
    proportion: 3, //modern
    contrast: 0, //any
    strokeVariation: 0, //any,
    armStyle: 0, //any,
    letterform: 0, //any,
    midline: 0, //any,
    xHeight: 0 //any,
  };
  this.revision = 1;
  this.sfntNames = [];
  this.underlineThickness = 0;
  this.unitsPerEm = 1000;
  this.weightClass = 400; // normal
  this.width = 1000;
  this.widthClass = 5; // Medium (normal)
  this.ySubscriptXOffset = 0;
  this.ySuperscriptXOffset = 0;
  this.int_descent = -150;

  //getters and setters

  Object.defineProperty(this, 'descent', {
    get: function () {
      return this.int_descent;
    },
    set: function (value) {
      this.int_descent = parseInt(Math.round(-Math.abs(value)), 10);
    }
  });

  this.__defineGetter__('avgCharWidth', function () {
    if (this.glyphs.length === 0) {
      return 0;
    }
    var widths = _.map(this.glyphs, 'width');

    return parseInt(widths.reduce(function (prev, cur) {
      return prev + cur;
    }) / widths.length, 10);
  });

  Object.defineProperty(this, 'ySubscriptXSize', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySubscriptXSize) ? this.int_ySubscriptXSize : (this.width * 0.6347), 10);
    },
    set: function (value) {
      this.int_ySubscriptXSize = value;
    }
  });

  Object.defineProperty(this, 'ySubscriptYSize', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySubscriptYSize) ? this.int_ySubscriptYSize : ((this.ascent - this.descent) * 0.7), 10);
    },
    set: function (value) {
      this.int_ySubscriptYSize = value;
    }
  });

  Object.defineProperty(this, 'ySubscriptYOffset', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySubscriptYOffset) ? this.int_ySubscriptYOffset : ((this.ascent - this.descent) * 0.14), 10);
    },
    set: function (value) {
      this.int_ySubscriptYOffset = value;
    }
  });

  Object.defineProperty(this, 'ySuperscriptXSize', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySuperscriptXSize) ? this.int_ySuperscriptXSize : (this.width * 0.6347), 10);
    },
    set: function (value) {
      this.int_ySuperscriptXSize = value;
    }
  });

  Object.defineProperty(this, 'ySuperscriptYSize', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySuperscriptYSize) ? this.int_ySuperscriptYSize : ((this.ascent - this.descent) * 0.7), 10);
    },
    set: function (value) {
      this.int_ySuperscriptYSize = value;
    }
  });

  Object.defineProperty(this, 'ySuperscriptYOffset', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_ySuperscriptYOffset) ? this.int_ySuperscriptYOffset : ((this.ascent - this.descent) * 0.48), 10);
    },
    set: function (value) {
      this.int_ySuperscriptYOffset = value;
    }
  });

  Object.defineProperty(this, 'yStrikeoutSize', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_yStrikeoutSize) ? this.int_yStrikeoutSize : ((this.ascent - this.descent) * 0.049), 10);
    },
    set: function (value) {
      this.int_yStrikeoutSize = value;
    }
  });

  Object.defineProperty(this, 'yStrikeoutPosition', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_yStrikeoutPosition) ? this.int_yStrikeoutPosition : ((this.ascent - this.descent) * 0.258), 10);
    },
    set: function (value) {
      this.int_yStrikeoutPosition = value;
    }
  });

  Object.defineProperty(this, 'minLsb', {
    get: function () {
      return parseInt(_.min(_.map(this.glyphs, 'xMin')), 10);
    }
  });

  Object.defineProperty(this, 'minRsb', {
    get: function () {
      if (!this.glyphs.length) return parseInt(this.width, 10);

      return parseInt(_.reduce(this.glyphs, function (minRsb, glyph) {
        return Math.min(minRsb, glyph.width - glyph.xMax);
      }, 0), 10);
    }
  });

  Object.defineProperty(this, 'xMin', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (xMin, glyph) {
        return Math.min(xMin, glyph.xMin);
      }, 0);
    }
  });

  Object.defineProperty(this, 'yMin', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (yMin, glyph) {
        return Math.min(yMin, glyph.yMin);
      }, 0);
    }
  });

  Object.defineProperty(this, 'xMax', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (xMax, glyph) {
        return Math.max(xMax, glyph.xMax);
      }, 0);
    }
  });

  // TODO: Under special circumstances, the yMax returned by cubic2quad is too large.
  Object.defineProperty(this, 'yMax', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (yMax, glyph) {
        return Math.max(yMax, glyph.yMax);
      }, 0);
    }
  });

  Object.defineProperty(this, 'avgWidth', {
    get: function () {
      var len = this.glyphs.length;

      if (len === 0) {
        return this.width;
      }

      var sumWidth = _.reduce(this.glyphs, function (sumWidth, glyph) {
        return sumWidth + glyph.width;
      }, 0);

      return Math.round(sumWidth / len);
    }
  });

  Object.defineProperty(this, 'maxWidth', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (maxWidth, glyph) {
        return Math.max(maxWidth, glyph.width);
      }, 0);
    }
  });

  Object.defineProperty(this, 'maxExtent', {
    get: function () {
      if (!this.glyphs.length) return this.width;

      return _.reduce(this.glyphs, function (maxExtent, glyph) {
        return Math.max(maxExtent, glyph.xMax /*- glyph.xMin*/);
      }, 0);
    }
  });

  // Property used for `sTypoLineGap` in OS/2 and not used for `lineGap` in HHEA, because
  // non zero lineGap causes bad offset in IE, https://github.com/fontello/svg2ttf/issues/37
  Object.defineProperty(this, 'lineGap', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_lineGap) ? this.int_lineGap : ((this.ascent - this.descent) * 0.09), 10);
    },
    set: function (value) {
      this.int_lineGap = value;
    }
  });

  Object.defineProperty(this, 'underlinePosition', {
    get: function () {
      return parseInt(!_.isUndefined(this.int_underlinePosition) ? this.int_underlinePosition : ((this.ascent - this.descent) * 0.01), 10);
    },
    set: function (value) {
      this.int_underlinePosition = value;
    }
  });
}


function Glyph() {
  this.contours = [];
  this.d = '';
  this.id = '';
  this.height = 0;
  this.name = '';
  this.width = 0;
}

Object.defineProperty(Glyph.prototype, 'xMin', {
  get: function () {
    var xMin = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        xMin = Math.min(xMin, Math.floor(point.x));
        hasPoints = true;
      });

    });
    return hasPoints ? xMin : 0;
  }
});

Object.defineProperty(Glyph.prototype, 'xMax', {
  get: function () {
    var xMax = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        xMax = Math.max(xMax, -Math.floor(-point.x));
        hasPoints = true;
      });

    });
    return hasPoints ? xMax : this.width;
  }
});

Object.defineProperty(Glyph.prototype, 'yMin', {
  get: function () {
    var yMin = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        yMin = Math.min(yMin, Math.floor(point.y));
        hasPoints = true;
      });

    });
    return hasPoints ? yMin : 0;
  }
});

Object.defineProperty(Glyph.prototype, 'yMax', {
  get: function () {
    var yMax = 0;
    var hasPoints = false;

    _.forEach(this.contours, function (contour) {
      _.forEach(contour.points, function (point) {
        yMax = Math.max(yMax, -Math.floor(-point.y));
        hasPoints = true;
      });

    });
    return hasPoints ? yMax : 0;
  }
});

function Contour() {
  this.points = [];
}

function Point() {
  this.onCurve = true;
  this.x = 0;
  this.y = 0;
}

function SfntName() {
  this.id = 0;
  this.value = '';
}

module.exports.Font = Font;
module.exports.Glyph = Glyph;
module.exports.Contour = Contour;
module.exports.Point = Point;
module.exports.SfntName = SfntName;
module.exports.toTTF = require('./ttf');
