goog.provide('ol.style.Style');

goog.require('goog.asserts');
goog.require('goog.functions');
goog.require('ol.geom.Geometry');
goog.require('ol.geom.GeometryType');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Image');
goog.require('ol.style.Stroke');



/**
 * @classdesc
 * Container for vector feature rendering styles. Any changes made to the style
 * or its children through `set*()` methods will not take effect until the
 * feature, layer or FeatureOverlay that uses the style is re-rendered.
 *
 * @constructor
 * @param {olx.style.StyleOptions=} opt_options Style options.
 * @api
 */
ol.style.Style = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {string|ol.geom.Geometry|ol.style.GeometryFunction}
   */
  this.geometry_ = null;

  /**
   * @private
   * @type {!ol.style.GeometryFunction}
   */
  this.geometryFunction_ = ol.style.defaultGeometryFunction;

  if (goog.isDef(options.geometry)) {
    this.setGeometry(options.geometry);
  }

  /**
   * @private
   * @type {ol.style.Fill}
   */
  this.fill_ = goog.isDef(options.fill) ? options.fill : null;

  /**
   * @private
   * @type {ol.style.Image}
   */
  this.image_ = goog.isDef(options.image) ? options.image : null;

  /**
   * @private
   * @type {ol.style.Stroke}
   */
  this.stroke_ = goog.isDef(options.stroke) ? options.stroke : null;

  /**
   * @private
   * @type {ol.style.Text}
   */
  this.text_ = goog.isDef(options.text) ? options.text : null;

  /**
   * @private
   * @type {number|undefined}
   */
  this.zIndex_ = options.zIndex;

};


/**
 * @return {string|ol.geom.Geometry|ol.style.GeometryFunction}
 * Feature property or geometry or function that returns the geometry that will
 * be rendered with this style.
 * @api
 */
ol.style.Style.prototype.getGeometry = function() {
  return this.geometry_;
};


/**
 * @return {!ol.style.GeometryFunction} Function that is called with a feature
 * and returns the geometry to render instead of the feature's geometry.
 * @api
 */
ol.style.Style.prototype.getGeometryFunction = function() {
  return this.geometryFunction_;
};


/**
 * @return {ol.style.Fill} Fill style.
 * @api
 */
ol.style.Style.prototype.getFill = function() {
  return this.fill_;
};


/**
 * @return {ol.style.Image} Image style.
 * @api
 */
ol.style.Style.prototype.getImage = function() {
  return this.image_;
};


/**
 * @return {ol.style.Stroke} Stroke style.
 * @api
 */
ol.style.Style.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * @return {ol.style.Text} Text style.
 * @api
 */
ol.style.Style.prototype.getText = function() {
  return this.text_;
};


/**
 * @return {number|undefined} ZIndex.
 * @api
 */
ol.style.Style.prototype.getZIndex = function() {
  return this.zIndex_;
};


/**
 * Set a geometry that is rendered instead of the feature's geometry.
 *
 * @param {string|ol.geom.Geometry|ol.style.GeometryFunction} geometry
 *     Feature property or geometry or function returning a geometry to render
 *     for this style.
 * @api
 */
ol.style.Style.prototype.setGeometry = function(geometry) {
  if (goog.isFunction(geometry)) {
    this.geometryFunction_ = geometry;
  } else if (goog.isString(geometry)) {
    this.geometryFunction_ = function(feature) {
      var result = feature.get(geometry);
      if (goog.isDefAndNotNull(result)) {
        goog.asserts.assertInstanceof(result, ol.geom.Geometry);
      }
      return result;
    };
  } else if (goog.isNull(geometry)) {
    this.geometryFunction_ = ol.style.defaultGeometryFunction;
  } else if (goog.isDef(geometry)) {
    goog.asserts.assertInstanceof(geometry, ol.geom.Geometry);
    this.geometryFunction_ = function() {
      return geometry;
    };
  }
  this.geometry_ = geometry;
};


/**
 * Set the zIndex.
 *
 * @param {number|undefined} zIndex ZIndex.
 * @api
 */
ol.style.Style.prototype.setZIndex = function(zIndex) {
  this.zIndex_ = zIndex;
};
