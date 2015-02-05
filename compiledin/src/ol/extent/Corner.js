goog.provide('ol.extent.Corner');

goog.require('goog.asserts');
goog.require('goog.vec.Mat4');
goog.require('ol.Coordinate');
goog.require('ol.Size');
goog.require('ol.TransformFunction');


/**
 * Extent corner.
 * @enum {string}
 */
ol.extent.Corner = {
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right'
};

