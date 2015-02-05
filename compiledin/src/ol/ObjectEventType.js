/**
 * An implementation of Google Maps' MVCObject.
 * @see https://developers.google.com/maps/articles/mvcfun
 * @see https://developers.google.com/maps/documentation/javascript/reference
 */

goog.provide('ol.ObjectEventType');

goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.string');
goog.require('ol.Observable');


/**
 * @enum {string}
 */
ol.ObjectEventType = {
  /**
   * Triggered when a property is changed.
   * @event ol.ObjectEvent#propertychange
   * @api
   */
  PROPERTYCHANGE: 'propertychange'
};
