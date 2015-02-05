/**
 * An implementation of Google Maps' MVCArray.
 * @see https://developers.google.com/maps/documentation/javascript/reference
 */

goog.provide('ol.CollectionEvent');

goog.require('goog.array');
goog.require('goog.events.Event');
goog.require('ol.Object');



/**
 * @classdesc
 * Events emitted by {@link ol.Collection} instances are instances of this
 * type.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.CollectionEvent}
 * @param {ol.CollectionEventType} type Type.
 * @param {*=} opt_element Element.
 * @param {Object=} opt_target Target.
 */
ol.CollectionEvent = function(type, opt_element, opt_target) {

  goog.base(this, type, opt_target);

  /**
   * The element that is added to or removed from the collection.
   * @type {*}
   * @api stable
   */
  this.element = opt_element;

};
goog.inherits(ol.CollectionEvent, goog.events.Event);

