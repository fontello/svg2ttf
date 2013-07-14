'use strict';

var _ = require('lodash');
var math = require('../math');

// Remove points, that looks like straight line
function simplify(contours) {
  return _.map(contours, function (contour) {
    var i, curr, prev, next;
    var p, pPrev, pNext;
    // run from the end, to simplify array elements removal
    for(i=contour.length-2; i>1; i--) {
      prev = contour[i-1];
      next = contour[i+1];
      curr = contour[i];

      // skip point (both oncurve & offcurve),
      // if [prev,next] is straight line
      if (prev.onCurve && next.onCurve) {
        p = new math.Point(curr.x, curr.y);
        pPrev = new math.Point(prev.x, prev.y);
        pNext = new math.Point(next.x, next.y);
        if (math.isInLine(pPrev, p, pNext)) {
          contour.splice(i, 1);
        }
      }
    }
    return contour;
  });
}

// Remove interpolateable oncurve points
// Those should be in the middle of nebor offcurve points
function interpolate(contours) {
  var EPS = 1.1;

  return _.map(contours, function (contour) {
    var resContour = [];
    _.forEach(contour, function (point, idx) {
      // Never skip first and last points
      if (idx === 0 || idx === (contour.length - 1)) {
        resContour.push(point);
        return;
      }

      var prev = contour[idx-1];
      var next = contour[idx+1];

      var p, pPrev, pNext;

      // skip interpolateable oncurve points (if exactly between previous and next offcurves)
      if (!prev.onCurve && point.onCurve && !next.onCurve) {
        p = new math.Point(point.x, point.y);
        pPrev = new math.Point(prev.x, prev.y);
        pNext = new math.Point(next.x, next.y);
        if (pPrev.add(pNext).div(2).sub(p).dist() < EPS) {
          return;
        }
      }
      // keep the rest
      resContour.push(point);
    });
    return resContour;
  });
}

function roundPoints(contours) {
  return _.map(contours, function (contour) {
    return _.map(contour, function (point) {
      return { x: Math.round(point.x), y: Math.round(point.y), onCurve: point.onCurve };
    });
  });
}

function toRelative(contours) {
  var prevPoint = { x: 0, y: 0 };
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    _.forEach(contour, function (point) {
      resContour.push({
        x: point.x - prevPoint.x,
        y: point.y - prevPoint.y,
        onCurve: point.onCurve
      });
      prevPoint = point;
    });
  });
  return resContours;
}

//calculates length of glyph data in GLYF table
function glyphDataSize(glyph) {
  var result = 12; //glyph fixed properties
  result += glyph.contours.length * 2; //add contours
  _.forEach(glyph.ttfContours, function (contour) {
    _.forEach(contour, function (point) {
      //add 1 or 2 bytes for each coordinate depending of its size
      result += ((-0xFF <= point.x && point.x <= 0xFF)) ? 1 : 2;
      result += ((-0xFF <= point.y && point.y <= 0xFF)) ? 1 : 2;
      result += 1; //flag length
    });
  });
  return result;
}

module.exports.glyphDataSize = glyphDataSize;
module.exports.interpolate = interpolate;
module.exports.simplify = simplify;
module.exports.roundPoints = roundPoints;
module.exports.toRelative = toRelative;

