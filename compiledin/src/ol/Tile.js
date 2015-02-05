goog.provide('ol.Tile');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('ol.TileCoord');
goog.require('ol.TileState');



/**
 * @classdesc
 * Base class for tiles.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {ol.TileCoord} tileCoord Tile coordinate.
 * @param {ol.TileState} state State.
 */
ol.Tile = function(tileCoord, state) {

  goog.base(this);

  /**
   * @type {ol.TileCoord}
   */
  this.tileCoord = tileCoord;

  /**
   * @protected
   * @type {ol.TileState}
   */
  this.state = state;

};
goog.inherits(ol.Tile, goog.events.EventTarget);


/**
 * @protected
 */
ol.Tile.prototype.changed = function() {
  this.dispatchEvent(goog.events.EventType.CHANGE);
};


/**
 * @function
 * @param {Object=} opt_context Object.
 * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
 */
ol.Tile.prototype.getImage = goog.abstractMethod;


/**
 * @return {string} Key.
 */
ol.Tile.prototype.getKey = function() {
  return goog.getUid(this).toString();
};


/**
 * @return {ol.TileCoord}
 * @api
 */
ol.Tile.prototype.getTileCoord = function() {
  return this.tileCoord;
};


/**
 * @return {ol.TileState} State.
 */
ol.Tile.prototype.getState = function() {
  return this.state;
};


/**
 * FIXME empty description for jsdoc
 */
ol.Tile.prototype.load = goog.abstractMethod;
