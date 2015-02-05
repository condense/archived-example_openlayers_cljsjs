
goog.provide('ol.source.WMTSRequestEncoding');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math');
goog.require('goog.object');
goog.require('goog.uri.utils');
goog.require('ol.TileUrlFunction');
goog.require('ol.TileUrlFunctionType');
goog.require('ol.extent');
goog.require('ol.proj');
goog.require('ol.source.TileImage');
goog.require('ol.tilecoord');
goog.require('ol.tilegrid.WMTS');


/**
 * Request encoding. One of 'KVP', 'REST'.
 * @enum {string}
 * @api
 */
ol.source.WMTSRequestEncoding = {
  KVP: 'KVP',  // see spec §8
  REST: 'REST' // see spec §10
};


