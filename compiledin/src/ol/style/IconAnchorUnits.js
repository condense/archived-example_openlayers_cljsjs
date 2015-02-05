goog.provide('ol.style.IconAnchorUnits');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('ol.dom');
goog.require('ol.style.Image');
goog.require('ol.style.ImageState');


/**
 * Icon anchor units. One of 'fraction', 'pixels'.
 * @enum {string}
 * @api
 */
ol.style.IconAnchorUnits = {
  FRACTION: 'fraction',
  PIXELS: 'pixels'
};
