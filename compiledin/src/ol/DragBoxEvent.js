// FIXME draw drag box
goog.provide('ol.DragBoxEvent');

goog.require('goog.events.Event');
goog.require('ol');
goog.require('ol.events.ConditionType');
goog.require('ol.events.condition');
goog.require('ol.interaction.Pointer');
goog.require('ol.render.Box');



/**
 * @enum {string}
 */
ol.DragBoxEventType = {
  /**
   * Triggered upon drag box start.
   * @event ol.DragBoxEvent#boxstart
   * @api stable
   */
  BOXSTART: 'boxstart',
  /**
   * Triggered upon drag box end.
   * @event ol.DragBoxEvent#boxend
   * @api stable
   */
  BOXEND: 'boxend'
};



/**
 * @classdesc
 * Events emitted by {@link ol.interaction.DragBox} instances are instances of
 * this type.
 *
 * @param {string} type The event type.
 * @param {ol.Coordinate} coordinate The event coordinate.
 * @extends {goog.events.Event}
 * @constructor
 * @implements {oli.DragBoxEvent}
 */
ol.DragBoxEvent = function(type, coordinate) {
  goog.base(this, type);

  /**
   * The coordinate of the drag event.
   * @const
   * @type {ol.Coordinate}
   * @api stable
   */
  this.coordinate = coordinate;

};
goog.inherits(ol.DragBoxEvent, goog.events.Event);

