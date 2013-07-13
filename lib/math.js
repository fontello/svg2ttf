'use strict';

function Point(x, y) {
  if (!(this instanceof Point)) {
    return new Point(x, y);
  }

  this.x = x;
  this.y = y;

  this.mul = function (value) {
    return new Point(this.x * value, this.y * value);
  };

  this.add = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  };

  this.sub = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  };

  this.compare = function (point, tolerance) {
    return Math.abs(this.x - point.x) <= tolerance && Math.abs(this.y - point.y) <= tolerance;
  };
}


/*
 * Calculate intersection point of two segments (a1a2,b1b2)
 * return -> { exists: true/false, point: Point(x.y) }
 *
 *  (*) If (cross === true) & !point, then segments are colinear
 *  (**) calculated point can be out of segments
 */
function cross(a1, a2, b1, b2) {
  var EPS = 1e-6; // precision
  
  var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
  var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
  var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

  // intersection found
  if ( Math.abs(u_b) >= EPS ) {
    var ua = ua_t / u_b;

    return { exists: true, point: new Point(
      a1.x + ua * (a2.x - a1.x),
      a1.y + ua * (a2.y - a1.y)
    ) };
  }
  
  // edge cases
  if ( ua_t < EPS || ub_t < EPS ) {
    // coincident
    return { exists: true };
  } else {
    // parallel
    return { exists: false };
  }
}


// converts cubic bezier to quad, by calculation slopes intersection
function toQuad(p0, p1, p2, p3) {

  var c = cross(p0, p1, p2, p3);
  
  if (c.exists) {
    if (!c.point) {
      // coliniar - return the middle of p0p3
      return [ p0, p0.add(p3).mul(1/2), p3 ];
    } else {
      // normal case
      return [ p0, c.point, p3 ];
    }
  } else {
    // parallel - should never happen in our case,
    // just return anything valid (middle of p0p3)
    return [ p0, p0.add(p3).mul(1/2), p3 ];
  }
}

/*
 * Converts cubic curve to 2 quad curves. Returns array of quad curves
 *
 * 1. Split cubic bezier-> 2 cubic beziers, by midpoint
 * 2. Replace each cubic bezier with quad bezier
 *
 * This is a simplified approach. It can be improved by adaptive splitting,
 * but in real life that's not needed.
 *
 * (!) We could use more slices, but FONT SIZE DOES MATTER !!!
 */
function bezierCubicToQuad(p0, p1, p2, p3) {

  // Split to 2 qubic beziers first
  // https://www.atalasoft.com/blogs/stevehawley/may-2013/how-to-split-a-cubic-bezier-curve
  // http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as

  // midpoints of each segment
  var p4 = p0.add(p1).mul(1 / 2);
  var p5 = p1.add(p2).mul(1 / 2);
  var p6 = p2.add(p3).mul(1 / 2);

  // midpoint between calculated midpoints
  var p7 = p4.add(p5).mul(1 / 2);
  var p8 = p5.add(p6).mul(1 / 2);

  // curve midpoint
  var p9 = p7.add(p8).mul(1 / 2);

  // now replace each half with quad curve
  return [ toQuad(p0, p4, p7, p9), toQuad(p9, p8, p6, p3) ];

}

module.exports.Point = Point;
module.exports.bezierCubicToQuad = bezierCubicToQuad;
