goog.provide('ol.proj.Units');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('ol');
goog.require('ol.Extent');
goog.require('ol.TransformFunction');
goog.require('ol.extent');
goog.require('ol.sphere.NORMAL');


/**
 * Projection units: `'degrees'`, `'ft'`, `'m'` or `'pixels'`.
 * @enum {string}
 * @api stable
 */
ol.proj.Units = {
  DEGREES: 'degrees',
  FEET: 'ft',
  METERS: 'm',
  PIXELS: 'pixels'
};

