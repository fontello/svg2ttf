'use strict';

var _ = require('lodash');

function toRelativePoints(points) {
  var clonedPoints = _.cloneDeep(points);
  _.forEach(clonedPoints, function (point) {
    var absX = 0;
    var absY = 0;
    if (point.isAbsolute) {
      if (point.x !== undefined) {
        point.x = point.x - absX;
      }
      if (point.y !== undefined) {
        point.y = point.y - absY;
      }
      if (point.x1 !== undefined) {
        point.x1 = point.x1 - absX;
      }
      if (point.y1 !== undefined) {
        point.y1 = point.y1 - absY;
      }
      if (point.x2 !== undefined) {
        point.x2 = point.x2 - absX;
      }
      if (point.y2 !== undefined) {
        point.y2 = point.y2 - absY;
      }
      if (point.rx !== undefined) {
        point.rx = point.rx - absX;
      }
      if (point.ry !== undefined) {
        point.ry = point.ry - absY;
      }
      point.isAbsolute = false;
    }
    if (point.x !== undefined) {
      absX += point.x;
    }
    if (point.y !== undefined) {
      absY += point.y;
    }
  });
  //console.log("toRelativePoints ", clonedPoints);
  return clonedPoints;
}

module.exports = toRelativePoints;
