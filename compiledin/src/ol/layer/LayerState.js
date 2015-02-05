

goog.provide('ol.layer.LayerState');

goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.object');
goog.require('ol.Object');
goog.require('ol.source.State');



/**
 * @typedef {{layer: ol.layer.Layer,
 *            brightness: number,
 *            contrast: number,
 *            hue: number,
 *            opacity: number,
 *            saturation: number,
 *            sourceState: ol.source.State,
 *            visible: boolean,
 *            extent: (ol.Extent|undefined),
 *            maxResolution: number,
 *            minResolution: number}}
 */
ol.layer.LayerState;


