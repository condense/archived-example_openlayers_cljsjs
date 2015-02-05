goog.provide('ol.MapEvent');

goog.require('goog.events.Event');
goog.require('ol.MapEventType');




/**
 * @classdesc
 * Events emitted as map events are instances of this type.
 * See {@link ol.Map} for which events trigger a map event.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.MapEvent}
 * @param {string} type Event type.
 * @param {ol.Map} map Map.
 * @param {?olx.FrameState=} opt_frameState Frame state.
 */
ol.MapEvent = function(type, map, opt_frameState) {

  goog.base(this, type);

  /**
   * The map where the event occurred.
   * @type {ol.Map}
   * @api stable
   */
  this.map = map;

  /**
   * The frame state at the time of the event.
   * @type {?olx.FrameState}
   * @api
   */
  this.frameState = goog.isDef(opt_frameState) ? opt_frameState : null;

};
goog.inherits(ol.MapEvent, goog.events.Event);
