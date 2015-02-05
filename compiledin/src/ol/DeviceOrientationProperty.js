
goog.provide('ol.DeviceOrientationProperty');

goog.require('goog.events');
goog.require('goog.math');
goog.require('ol.Object');
goog.require('ol.has');


/**
 * @enum {string}
 */
ol.DeviceOrientationProperty = {
  ALPHA: 'alpha',
  BETA: 'beta',
  GAMMA: 'gamma',
  HEADING: 'heading',
  TRACKING: 'tracking'
};
