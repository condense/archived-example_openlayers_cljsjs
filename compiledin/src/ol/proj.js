goog.provide('ol.proj');

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
goog.require('ol.proj.Projection');


/**
 * @private
 * @type {Object.<string, ol.proj.Projection>}
 */
ol.proj.projections_ = {};


/**
 * @private
 * @type {Object.<string, Object.<string, ol.TransformFunction>>}
 */
ol.proj.transforms_ = {};


/**
 * Registers transformation functions that don't alter coordinates. Those allow
 * to transform between projections with equal meaning.
 *
 * @param {Array.<ol.proj.Projection>} projections Projections.
 * @api
 */
ol.proj.addEquivalentProjections = function(projections) {
  ol.proj.addProjections(projections);
  goog.array.forEach(projections, function(source) {
    goog.array.forEach(projections, function(destination) {
      if (source !== destination) {
        ol.proj.addTransform(source, destination, ol.proj.cloneTransform);
      }
    });
  });
};


/**
 * Registers transformation functions to convert coordinates in any projection
 * in projection1 to any projection in projection2.
 *
 * @param {Array.<ol.proj.Projection>} projections1 Projections with equal
 *     meaning.
 * @param {Array.<ol.proj.Projection>} projections2 Projections with equal
 *     meaning.
 * @param {ol.TransformFunction} forwardTransform Transformation from any
 *   projection in projection1 to any projection in projection2.
 * @param {ol.TransformFunction} inverseTransform Transform from any projection
 *   in projection2 to any projection in projection1..
 */
ol.proj.addEquivalentTransforms =
    function(projections1, projections2, forwardTransform, inverseTransform) {
  goog.array.forEach(projections1, function(projection1) {
    goog.array.forEach(projections2, function(projection2) {
      ol.proj.addTransform(projection1, projection2, forwardTransform);
      ol.proj.addTransform(projection2, projection1, inverseTransform);
    });
  });
};


/**
 * Add a Projection object to the list of supported projections.
 *
 * @param {ol.proj.Projection} projection Projection instance.
 * @api stable
 */
ol.proj.addProjection = function(projection) {
  ol.proj.projections_[projection.getCode()] = projection;
  ol.proj.addTransform(projection, projection, ol.proj.cloneTransform);
};


/**
 * @param {Array.<ol.proj.Projection>} projections Projections.
 */
ol.proj.addProjections = function(projections) {
  var addedProjections = [];
  goog.array.forEach(projections, function(projection) {
    addedProjections.push(ol.proj.addProjection(projection));
  });
};


/**
 * FIXME empty description for jsdoc
 */
ol.proj.clearAllProjections = function() {
  ol.proj.projections_ = {};
  ol.proj.transforms_ = {};
};


/**
 * @param {ol.proj.Projection|string|undefined} projection Projection.
 * @param {string} defaultCode Default code.
 * @return {ol.proj.Projection} Projection.
 */
ol.proj.createProjection = function(projection, defaultCode) {
  if (!goog.isDefAndNotNull(projection)) {
    return ol.proj.get(defaultCode);
  } else if (goog.isString(projection)) {
    return ol.proj.get(projection);
  } else {
    goog.asserts.assertInstanceof(projection, ol.proj.Projection);
    return projection;
  }
};


/**
 * Registers a conversion function to convert coordinates from the source
 * projection to the destination projection.
 *
 * @param {ol.proj.Projection} source Source.
 * @param {ol.proj.Projection} destination Destination.
 * @param {ol.TransformFunction} transformFn Transform.
 */
ol.proj.addTransform = function(source, destination, transformFn) {
  var sourceCode = source.getCode();
  var destinationCode = destination.getCode();
  var transforms = ol.proj.transforms_;
  if (!goog.object.containsKey(transforms, sourceCode)) {
    transforms[sourceCode] = {};
  }
  transforms[sourceCode][destinationCode] = transformFn;
};


/**
 * Registers coordinate transform functions to convert coordinates between the
 * source projection and the destination projection.
 * The forward and inverse functions convert coordinate pairs; this function
 * converts these into the functions used internally which also handle
 * extents and coordinate arrays.
 *
 * @param {ol.proj.ProjectionLike} source Source projection.
 * @param {ol.proj.ProjectionLike} destination Destination projection.
 * @param {function(ol.Coordinate): ol.Coordinate} forward The forward transform
 *     function (that is, from the source projection to the destination
 *     projection) that takes a {@link ol.Coordinate} as argument and returns
 *     the transformed {@link ol.Coordinate}.
 * @param {function(ol.Coordinate): ol.Coordinate} inverse The inverse transform
 *     function (that is, from the destination projection to the source
 *     projection) that takes a {@link ol.Coordinate} as argument and returns
 *     the transformed {@link ol.Coordinate}.
 * @api stable
 */
ol.proj.addCoordinateTransforms =
    function(source, destination, forward, inverse) {
  var sourceProj = ol.proj.get(source);
  var destProj = ol.proj.get(destination);
  ol.proj.addTransform(sourceProj, destProj,
      ol.proj.createTransformFromCoordinateTransform(forward));
  ol.proj.addTransform(destProj, sourceProj,
      ol.proj.createTransformFromCoordinateTransform(inverse));
};


/**
 * Creates a {@link ol.TransformFunction} from a simple 2D coordinate transform
 * function.
 * @param {function(ol.Coordinate): ol.Coordinate} transform Coordinate
 *     transform.
 * @return {ol.TransformFunction} Transform function.
 */
ol.proj.createTransformFromCoordinateTransform = function(transform) {
  return (
      /**
       * @param {Array.<number>} input Input.
       * @param {Array.<number>=} opt_output Output.
       * @param {number=} opt_dimension Dimension.
       * @return {Array.<number>} Output.
       */
      function(input, opt_output, opt_dimension) {
        var length = input.length;
        var dimension = goog.isDef(opt_dimension) ? opt_dimension : 2;
        var output = goog.isDef(opt_output) ? opt_output : new Array(length);
        var point, i, j;
        for (i = 0; i < length; i += dimension) {
          point = transform([input[i], input[i + 1]]);
          output[i] = point[0];
          output[i + 1] = point[1];
          for (j = dimension - 1; j >= 2; --j) {
            output[i + j] = input[i + j];
          }
        }
        return output;
      });
};


/**
 * Unregisters the conversion function to convert coordinates from the source
 * projection to the destination projection.  This method is used to clean up
 * cached transforms during testing.
 *
 * @param {ol.proj.Projection} source Source projection.
 * @param {ol.proj.Projection} destination Destination projection.
 * @return {ol.TransformFunction} transformFn The unregistered transform.
 */
ol.proj.removeTransform = function(source, destination) {
  var sourceCode = source.getCode();
  var destinationCode = destination.getCode();
  var transforms = ol.proj.transforms_;
  goog.asserts.assert(sourceCode in transforms);
  goog.asserts.assert(destinationCode in transforms[sourceCode]);
  var transform = transforms[sourceCode][destinationCode];
  delete transforms[sourceCode][destinationCode];
  var keys = goog.object.getKeys(transforms[sourceCode]);
  if (keys.length === 0) {
    delete transforms[sourceCode];
  }
  return transform;
};


/**
 * Fetches a Projection object for the code specified.
 *
 * @param {ol.proj.ProjectionLike} projectionLike Either a code string which is
 *     a combination of authority and identifier such as "EPSG:4326", or an
 *     existing projection object, or undefined.
 * @return {ol.proj.Projection} Projection object, or null if not in list.
 * @api stable
 */
ol.proj.get = function(projectionLike) {
  var projection;
  if (projectionLike instanceof ol.proj.Projection) {
    projection = projectionLike;
  } else if (goog.isString(projectionLike)) {
    var code = projectionLike;
    var projections = ol.proj.projections_;
    projection = projections[code];
    if (ol.ENABLE_PROJ4JS && !goog.isDef(projection) &&
        typeof proj4 == 'function') {
      var def = proj4.defs(code);
      if (goog.isDef(def)) {
        var units = def.units;
        if (!goog.isDef(units)) {
          if (goog.isDef(def.to_meter)) {
            units = def.to_meter.toString();
            ol.proj.METERS_PER_UNIT[units] = def.to_meter;
          }
        }
        projection = new ol.proj.Projection({
          code: code,
          units: units,
          axisOrientation: def.axis
        });
        ol.proj.addProjection(projection);
        var currentCode, currentDef, currentProj, proj4Transform;
        for (currentCode in projections) {
          currentDef = proj4.defs(currentCode);
          if (goog.isDef(currentDef)) {
            currentProj = ol.proj.get(currentCode);
            if (currentDef === def) {
              ol.proj.addEquivalentProjections([currentProj, projection]);
            } else {
              proj4Transform = proj4(currentCode, code);
              ol.proj.addCoordinateTransforms(currentProj, projection,
                  proj4Transform.forward, proj4Transform.inverse);
            }
          }
        }
      } else {
        goog.asserts.assert(goog.isDef(projection));
        projection = null;
      }
    }
  } else {
    projection = null;
  }
  return projection;
};


/**
 * Checks if two projections are the same, that is every coordinate in one
 * projection does represent the same geographic point as the same coordinate in
 * the other projection.
 *
 * @param {ol.proj.Projection} projection1 Projection 1.
 * @param {ol.proj.Projection} projection2 Projection 2.
 * @return {boolean} Equivalent.
 */
ol.proj.equivalent = function(projection1, projection2) {
  if (projection1 === projection2) {
    return true;
  } else if (projection1.getUnits() != projection2.getUnits()) {
    return false;
  } else {
    var transformFn = ol.proj.getTransformFromProjections(
        projection1, projection2);
    return transformFn === ol.proj.cloneTransform;
  }
};


/**
 * Given the projection-like objects, searches for a transformation
 * function to convert a coordinates array from the source projection to the
 * destination projection.
 *
 * @param {ol.proj.ProjectionLike} source Source.
 * @param {ol.proj.ProjectionLike} destination Destination.
 * @return {ol.TransformFunction} Transform function.
 * @api stable
 */
ol.proj.getTransform = function(source, destination) {
  var sourceProjection = ol.proj.get(source);
  var destinationProjection = ol.proj.get(destination);
  return ol.proj.getTransformFromProjections(
      sourceProjection, destinationProjection);
};


/**
 * Searches in the list of transform functions for the function for converting
 * coordinates from the source projection to the destination projection.
 *
 * @param {ol.proj.Projection} sourceProjection Source Projection object.
 * @param {ol.proj.Projection} destinationProjection Destination Projection
 *     object.
 * @return {ol.TransformFunction} Transform function.
 */
ol.proj.getTransformFromProjections =
    function(sourceProjection, destinationProjection) {
  var transforms = ol.proj.transforms_;
  var sourceCode = sourceProjection.getCode();
  var destinationCode = destinationProjection.getCode();
  var transform;
  if (goog.object.containsKey(transforms, sourceCode) &&
      goog.object.containsKey(transforms[sourceCode], destinationCode)) {
    transform = transforms[sourceCode][destinationCode];
  }
  if (!goog.isDef(transform)) {
    goog.asserts.assert(goog.isDef(transform));
    transform = ol.proj.identityTransform;
  }
  return transform;
};


/**
 * @param {Array.<number>} input Input coordinate array.
 * @param {Array.<number>=} opt_output Output array of coordinate values.
 * @param {number=} opt_dimension Dimension.
 * @return {Array.<number>} Input coordinate array (same array as input).
 */
ol.proj.identityTransform = function(input, opt_output, opt_dimension) {
  if (goog.isDef(opt_output) && input !== opt_output) {
    // TODO: consider making this a warning instead
    goog.asserts.fail('This should not be used internally.');
    for (var i = 0, ii = input.length; i < ii; ++i) {
      opt_output[i] = input[i];
    }
    input = opt_output;
  }
  return input;
};


/**
 * @param {Array.<number>} input Input coordinate array.
 * @param {Array.<number>=} opt_output Output array of coordinate values.
 * @param {number=} opt_dimension Dimension.
 * @return {Array.<number>} Output coordinate array (new array, same coordinate
 *     values).
 */
ol.proj.cloneTransform = function(input, opt_output, opt_dimension) {
  var output;
  if (goog.isDef(opt_output)) {
    for (var i = 0, ii = input.length; i < ii; ++i) {
      opt_output[i] = input[i];
    }
    output = opt_output;
  } else {
    output = input.slice();
  }
  return output;
};


/**
 * Transforms a coordinate from source projection to destination projection.
 * This returns a new coordinate (and does not modify the original).
 *
 * See {@link ol.proj.transformExtent} for extent transformation.
 * See the transform method of {@link ol.geom.Geometry} and its subclasses for
 * geometry transforms.
 *
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {ol.proj.ProjectionLike} source Source projection-like.
 * @param {ol.proj.ProjectionLike} destination Destination projection-like.
 * @return {ol.Coordinate} Coordinate.
 * @api stable
 */
ol.proj.transform = function(coordinate, source, destination) {
  var transformFn = ol.proj.getTransform(source, destination);
  return transformFn(coordinate, undefined, coordinate.length);
};


/**
 * Transforms an extent from source projection to destination projection.  This
 * returns a new extent (and does not modify the original).
 *
 * @param {ol.Extent} extent The extent to transform.
 * @param {ol.proj.ProjectionLike} source Source projection-like.
 * @param {ol.proj.ProjectionLike} destination Destination projection-like.
 * @return {ol.Extent} The transformed extent.
 * @api stable
 */
ol.proj.transformExtent = function(extent, source, destination) {
  var transformFn = ol.proj.getTransform(source, destination);
  return ol.extent.applyTransform(extent, transformFn);
};


/**
 * Transforms the given point to the destination projection.
 *
 * @param {ol.Coordinate} point Point.
 * @param {ol.proj.Projection} sourceProjection Source projection.
 * @param {ol.proj.Projection} destinationProjection Destination projection.
 * @return {ol.Coordinate} Point.
 */
ol.proj.transformWithProjections =
    function(point, sourceProjection, destinationProjection) {
  var transformFn = ol.proj.getTransformFromProjections(
      sourceProjection, destinationProjection);
  return transformFn(point);
};
