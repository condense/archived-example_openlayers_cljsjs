// FIXME bulk feature upload - suppress events
// FIXME put features in an ol.Collection
// FIXME make change-detection more refined (notably, geometry hint)

goog.provide('ol.source.VectorEvent');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('ol.ObjectEventType');
goog.require('ol.proj');
goog.require('ol.source.Source');
goog.require('ol.structs.RBush');



/**
 * @classdesc
 * Events emitted by {@link ol.source.Vector} instances are instances of this
 * type.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.source.VectorEvent}
 * @param {string} type Type.
 * @param {ol.Feature=} opt_feature Feature.
 */
ol.source.VectorEvent = function(type, opt_feature) {

  goog.base(this, type);

  /**
   * The feature being added or removed.
   * @type {ol.Feature|undefined}
   * @api stable
   */
  this.feature = opt_feature;

};
goog.inherits(ol.source.VectorEvent, goog.events.Event);
