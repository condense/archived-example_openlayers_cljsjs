
goog.provide('ol.MapBrowserPointerEvent');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('ol');
goog.require('ol.Coordinate');
goog.require('ol.MapEvent');
goog.require('ol.Pixel');
goog.require('ol.pointer.PointerEvent');
goog.require('ol.pointer.PointerEventHandler');

goog.require('ol.MapBrowserEvent');
goog.require('ol.MapBrowserEvent.EventType');




/**
 * @constructor
 * @extends {ol.MapBrowserEvent}
 * @param {string} type Event type.
 * @param {ol.Map} map Map.
 * @param {ol.pointer.PointerEvent} pointerEvent Pointer event.
 * @param {boolean=} opt_dragging Is the map currently being dragged?
 * @param {?olx.FrameState=} opt_frameState Frame state.
 */
ol.MapBrowserPointerEvent = function(type, map, pointerEvent, opt_dragging,
    opt_frameState) {

  goog.base(this, type, map, pointerEvent.browserEvent, opt_dragging,
      opt_frameState);

  /**
   * @const
   * @type {ol.pointer.PointerEvent}
   */
  this.pointerEvent = pointerEvent;

};
goog.inherits(ol.MapBrowserPointerEvent, ol.MapBrowserEvent);

