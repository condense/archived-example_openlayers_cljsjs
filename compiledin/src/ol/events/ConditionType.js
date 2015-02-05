goog.provide('ol.events.ConditionType');

goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.functions');
goog.require('ol.MapBrowserEvent.EventType');
goog.require('ol.MapBrowserPointerEvent');


/**
 * A function that takes an {@link ol.MapBrowserEvent} and returns a
 * `{boolean}`. If the condition is met, true should be returned.
 *
 * @typedef {function(ol.MapBrowserEvent): boolean}
 * @api stable
 */
ol.events.ConditionType;

