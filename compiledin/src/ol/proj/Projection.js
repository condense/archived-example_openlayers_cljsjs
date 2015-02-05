goog.provide('ol.proj.Projection');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('ol');
goog.require('ol.Extent');
goog.require('ol.TransformFunction');
goog.require('ol.extent');
goog.require('ol.sphere.NORMAL');
goog.require('ol.proj.METERS_PER_UNIT');
goog.require('ol.proj.ProjectionLike');
goog.require('ol.proj.Units');


/**
 * @classdesc
 * Projection definition class. One of these is created for each projection
 * supported in the application and stored in the {@link ol.proj} namespace.
 * You can use these in applications, but this is not required, as API params
 * and options use {@link ol.proj.ProjectionLike} which means the simple string
 * code will suffice.
 *
 * You can use {@link ol.proj.get} to retrieve the object for a particular
 * projection.
 *
 * The library includes definitions for `EPSG:4326` and `EPSG:3857`, together
 * with the following aliases:
 * * `EPSG:4326`: CRS:84, urn:ogc:def:crs:EPSG:6.6:4326,
 *     urn:ogc:def:crs:OGC:1.3:CRS84, urn:ogc:def:crs:OGC:2:84,
 *     http://www.opengis.net/gml/srs/epsg.xml#4326,
 *     urn:x-ogc:def:crs:EPSG:4326
 * * `EPSG:3857`: EPSG:102100, EPSG:102113, EPSG:900913,
 *     urn:ogc:def:crs:EPSG:6.18:3:3857,
 *     http://www.opengis.net/gml/srs/epsg.xml#3857
 *
 * If you use proj4js, aliases can be added using `proj4.defs()`; see
 * [documentation](https://github.com/proj4js/proj4js).
 *
 * @constructor
 * @param {olx.ProjectionOptions} options Projection options.
 * @struct
 * @api stable
 */
ol.proj.Projection = function(options) {

  /**
   * @private
   * @type {string}
   */
  this.code_ = options.code;

  /**
   * @private
   * @type {ol.proj.Units}
   */
  this.units_ = /** @type {ol.proj.Units} */ (options.units);

  /**
   * @private
   * @type {ol.Extent}
   */
  this.extent_ = goog.isDef(options.extent) ? options.extent : null;

  /**
   * @private
   * @type {ol.Extent}
   */
  this.worldExtent_ = goog.isDef(options.worldExtent) ?
      options.worldExtent : null;

  /**
   * @private
   * @type {string}
   */
  this.axisOrientation_ = goog.isDef(options.axisOrientation) ?
      options.axisOrientation : 'enu';

  /**
   * @private
   * @type {boolean}
   */
  this.global_ = goog.isDef(options.global) ? options.global : false;

  /**
   * @private
   * @type {ol.tilegrid.TileGrid}
   */
  this.defaultTileGrid_ = null;

};


/**
 * Get the code for this projection, e.g. 'EPSG:4326'.
 * @return {string} Code.
 * @api stable
 */
ol.proj.Projection.prototype.getCode = function() {
  return this.code_;
};


/**
 * Get the validity extent for this projection.
 * @return {ol.Extent} Extent.
 * @api stable
 */
ol.proj.Projection.prototype.getExtent = function() {
  return this.extent_;
};


/**
 * Get the units of this projection.
 * @return {ol.proj.Units} Units.
 * @api stable
 */
ol.proj.Projection.prototype.getUnits = function() {
  return this.units_;
};


/**
 * Get the amount of meters per unit of this projection.  If the projection is
 * not configured with a units identifier, the return is `undefined`.
 * @return {number|undefined} Meters.
 * @api stable
 */
ol.proj.Projection.prototype.getMetersPerUnit = function() {
  return ol.proj.METERS_PER_UNIT[this.units_];
};


/**
 * Get the world extent for this projection.
 * @return {ol.Extent} Extent.
 * @api
 */
ol.proj.Projection.prototype.getWorldExtent = function() {
  return this.worldExtent_;
};


/**
 * Get the axis orientation of this projection.
 * Example values are:
 * enu - the default easting, northing, elevation.
 * neu - northing, easting, up - useful for "lat/long" geographic coordinates,
 *     or south orientated transverse mercator.
 * wnu - westing, northing, up - some planetary coordinate systems have
 *     "west positive" coordinate systems
 * @return {string} Axis orientation.
 */
ol.proj.Projection.prototype.getAxisOrientation = function() {
  return this.axisOrientation_;
};


/**
 * Is this projection a global projection which spans the whole world?
 * @return {boolean} Whether the projection is global.
 * @api stable
 */
ol.proj.Projection.prototype.isGlobal = function() {
  return this.global_;
};


/**
 * @return {ol.tilegrid.TileGrid} The default tile grid.
 */
ol.proj.Projection.prototype.getDefaultTileGrid = function() {
  return this.defaultTileGrid_;
};


/**
 * @param {ol.tilegrid.TileGrid} tileGrid The default tile grid.
 */
ol.proj.Projection.prototype.setDefaultTileGrid = function(tileGrid) {
  this.defaultTileGrid_ = tileGrid;
};


/**
 * Set the validity extent for this projection.
 * @param {ol.Extent} extent Extent.
 * @api stable
 */
ol.proj.Projection.prototype.setExtent = function(extent) {
  this.extent_ = extent;
};


/**
 * Set the world extent for this projection.
 * @param {ol.Extent} worldExtent World extent
 *     [minlon, minlat, maxlon, maxlat].
 * @api
 */
ol.proj.Projection.prototype.setWorldExtent = function(worldExtent) {
  this.worldExtent_ = worldExtent;
};


/**
 * Get the resolution of the point in degrees. For projections with degrees as
 * the unit this will simply return the provided resolution. For other
 * projections the point resolution is estimated by transforming the center
 * pixel to EPSG:4326, measuring its width and height on the normal sphere,
 * and taking the average of the width and height.
 * @param {number} resolution Resolution.
 * @param {ol.Coordinate} point Point.
 * @return {number} Point resolution.
 */
ol.proj.Projection.prototype.getPointResolution = function(resolution, point) {
  var units = this.getUnits();
  if (units == ol.proj.Units.DEGREES) {
    return resolution;
  } else {
    // Estimate point resolution by transforming the center pixel to EPSG:4326,
    // measuring its width and height on the normal sphere, and taking the
    // average of the width and height.
    var toEPSG4326 = ol.proj.getTransformFromProjections(
        this, ol.proj.get('EPSG:4326'));
    var vertices = [
      point[0] - resolution / 2, point[1],
      point[0] + resolution / 2, point[1],
      point[0], point[1] - resolution / 2,
      point[0], point[1] + resolution / 2
    ];
    vertices = toEPSG4326(vertices, vertices, 2);
    var width = ol.sphere.NORMAL.haversineDistance(
        vertices.slice(0, 2), vertices.slice(2, 4));
    var height = ol.sphere.NORMAL.haversineDistance(
        vertices.slice(4, 6), vertices.slice(6, 8));
    var pointResolution = (width + height) / 2;
    var metersPerUnit = this.getMetersPerUnit();
    if (goog.isDef(metersPerUnit)) {
      pointResolution /= metersPerUnit;
    }
    return pointResolution;
  }
};



