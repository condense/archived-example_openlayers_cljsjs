
goog.provide('ol.ImageState');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('ol.Attribution');
goog.require('ol.Extent');


/**
 * @enum {number}
 */
ol.ImageState = {
  IDLE: 0,
  LOADING: 1,
  LOADED: 2,
  ERROR: 3
};

