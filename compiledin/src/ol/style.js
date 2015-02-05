goog.provide('ol.style');

goog.require('goog.asserts');
goog.require('goog.functions');
goog.require('ol.geom.Geometry');
goog.require('ol.geom.GeometryType');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Image');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');




/**
 * A function that takes an {@link ol.Feature} and a `{number}` representing
 * the view's resolution. The function should return an array of
 * {@link ol.style.Style}. This way e.g. a vector layer can be styled.
 *
 * @typedef {function(ol.Feature, number): Array.<ol.style.Style>}
 * @api
 */
ol.style.StyleFunction;


/**
 * Convert the provided object into a style function.  Functions passed through
 * unchanged.  Arrays of ol.style.Style or single style objects wrapped in a
 * new style function.
 * @param {ol.style.StyleFunction|Array.<ol.style.Style>|ol.style.Style} obj
 *     A style function, a single style, or an array of styles.
 * @return {ol.style.StyleFunction} A style function.
 */
ol.style.createStyleFunction = function(obj) {
  /**
   * @type {ol.style.StyleFunction}
   */
  var styleFunction;

  if (goog.isFunction(obj)) {
    styleFunction = /** @type {ol.style.StyleFunction} */ (obj);
  } else {
    /**
     * @type {Array.<ol.style.Style>}
     */
    var styles;
    if (goog.isArray(obj)) {
      styles = obj;
    } else {
      goog.asserts.assertInstanceof(obj, ol.style.Style);
      styles = [obj];
    }
    styleFunction = goog.functions.constant(styles);
  }
  return styleFunction;
};


/**
 * @param {ol.Feature} feature Feature.
 * @param {number} resolution Resolution.
 * @return {Array.<ol.style.Style>} Style.
 */
ol.style.defaultStyleFunction = function(feature, resolution) {
  var fill = new ol.style.Fill({
    color: 'rgba(255,255,255,0.4)'
  });
  var stroke = new ol.style.Stroke({
    color: '#3399CC',
    width: 1.25
  });
  var styles = [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
      }),
      fill: fill,
      stroke: stroke
    })
  ];

  // Now that we've run it the first time, replace the function with
  // a constant version. We don't use an immediately-invoked function
  // and a closure so we don't get an error at script evaluation time in
  // browsers that do not support Canvas. (ol.style.Circle does
  // canvas.getContext('2d') at construction time, which will cause an.error
  // in such browsers.)

  /**
   * @param {ol.Feature} feature Feature.
   * @param {number} resolution Resolution.
   * @return {Array.<ol.style.Style>} Style.
   */
  ol.style.defaultStyleFunction = function(feature, resolution) {
    return styles;
  };

  return styles;
};


/**
 * Default styles for editing features.
 * @return {Object.<ol.geom.GeometryType, Array.<ol.style.Style>>} Styles
 */
ol.style.createDefaultEditingStyles = function() {
  /** @type {Object.<ol.geom.GeometryType, Array.<ol.style.Style>>} */
  var styles = {};
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  styles[ol.geom.GeometryType.POLYGON] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  styles[ol.geom.GeometryType.MULTI_POLYGON] =
      styles[ol.geom.GeometryType.POLYGON];

  styles[ol.geom.GeometryType.LINE_STRING] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: white,
        width: width + 2
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: blue,
        width: width
      })
    })
  ];
  styles[ol.geom.GeometryType.MULTI_LINE_STRING] =
      styles[ol.geom.GeometryType.LINE_STRING];

  styles[ol.geom.GeometryType.POINT] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: width * 2,
        fill: new ol.style.Fill({
          color: blue
        }),
        stroke: new ol.style.Stroke({
          color: white,
          width: width / 2
        })
      }),
      zIndex: Infinity
    })
  ];
  styles[ol.geom.GeometryType.MULTI_POINT] =
      styles[ol.geom.GeometryType.POINT];

  styles[ol.geom.GeometryType.GEOMETRY_COLLECTION] =
      styles[ol.geom.GeometryType.POLYGON].concat(
          styles[ol.geom.GeometryType.POINT]
      );

  return styles;
};


/**
 * A function that takes an {@link ol.Feature} as argument and returns an
 * {@link ol.geom.Geometry} that will be rendered and styled for the feature.
 *
 * @typedef {function(ol.Feature): (ol.geom.Geometry|undefined)}
 * @api
 */
ol.style.GeometryFunction;


/**
 * Function that is called with a feature and returns its default geometry.
 * @param {ol.Feature} feature Feature to get the geometry for.
 * @return {ol.geom.Geometry|undefined} Geometry to render.
 */
ol.style.defaultGeometryFunction = function(feature) {
  goog.asserts.assert(!goog.isNull(feature));
  return feature.getGeometry();
};
