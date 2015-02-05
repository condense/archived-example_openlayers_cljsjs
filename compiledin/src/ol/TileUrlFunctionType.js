
goog.provide('ol.TileUrlFunctionType');

goog.require('goog.array');
goog.require('goog.math');
goog.require('ol.TileCoord');
goog.require('ol.proj.Projection');
goog.require('ol.tilecoord');


/**
 * A function that takes an {@link ol.TileCoord} for the tile coordinate,
 * a `{number}` representing the pixel ratio and an {@link ol.proj.Projection}
 * for the projection  as arguments and returns a `{string}` or
 * undefined representing the tile URL.
 *
 * @typedef {function(ol.TileCoord, number,
 *           ol.proj.Projection): (string|undefined)}
 * @api
 */
ol.TileUrlFunctionType;

