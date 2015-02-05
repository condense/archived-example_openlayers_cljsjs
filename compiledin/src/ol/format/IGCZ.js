goog.provide('ol.format.IGCZ');

goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.string.newlines');
goog.require('ol.Feature');
goog.require('ol.format.Feature');
goog.require('ol.format.TextFeature');
goog.require('ol.geom.LineString');
goog.require('ol.proj');


/**
 * IGC altitude/z. One of 'barometric', 'gps', 'none'.
 * @enum {string}
 * @api
 */
ol.format.IGCZ = {
  BAROMETRIC: 'barometric',
  GPS: 'gps',
  NONE: 'none'
};
