goog.provide('ol.proj.METERS_PER_UNIT');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('ol');
goog.require('ol.Extent');
goog.require('ol.TransformFunction');
goog.require('ol.extent');
goog.require('ol.sphere.NORMAL');
goog.require('ol.proj.Units');


/**
 * Meters per unit lookup table.
 * @const
 * @type {Object.<ol.proj.Units, number>}
 * @api stable
 */
ol.proj.METERS_PER_UNIT = {};
ol.proj.METERS_PER_UNIT[ol.proj.Units.DEGREES] =
    2 * Math.PI * ol.sphere.NORMAL.radius / 360;
ol.proj.METERS_PER_UNIT[ol.proj.Units.FEET] = 0.3048;
ol.proj.METERS_PER_UNIT[ol.proj.Units.METERS] = 1;

