goog.provide('ol.render.webgl.ReplayGroup');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('ol.color.Matrix');
goog.require('ol.extent');
goog.require('ol.render.IReplayGroup');
goog.require('ol.render.webgl.imagereplay.shader.Color');
goog.require('ol.render.webgl.imagereplay.shader.Default');
goog.require('ol.vec.Mat4');
goog.require('ol.webgl.Buffer');
goog.require('ol.webgl.Context');
goog.require('ol.render.webgl.ImageReplay');




/**
 * @constructor
 * @implements {ol.render.IReplayGroup}
 * @param {number} tolerance Tolerance.
 * @param {ol.Extent} maxExtent Max extent.
 * @param {number=} opt_renderBuffer Render buffer.
 * @struct
 */
ol.render.webgl.ReplayGroup = function(
    tolerance, maxExtent, opt_renderBuffer) {

  /**
   * @type {ol.Extent}
   * @private
   */
  this.maxExtent_ = maxExtent;

  /**
   * @type {number}
   * @private
   */
  this.tolerance_ = tolerance;

  /**
   * @type {number|undefined}
   * @private
   */
  this.renderBuffer_ = opt_renderBuffer;

  /**
   * ImageReplay only is supported at this point.
   * @type {Object.<ol.render.ReplayType, ol.render.webgl.ImageReplay>}
   * @private
   */
  this.replays_ = {};

};


/**
 * @param {ol.webgl.Context} context WebGL context.
 * @return {function()} Delete resources function.
 */
ol.render.webgl.ReplayGroup.prototype.getDeleteResourcesFunction =
    function(context) {
  var functions = [];
  var replayKey;
  for (replayKey in this.replays_) {
    functions.push(
        this.replays_[replayKey].getDeleteResourcesFunction(context));
  }
  return goog.functions.sequence.apply(null, functions);
};


/**
 * @param {ol.webgl.Context} context Context.
 */
ol.render.webgl.ReplayGroup.prototype.finish = function(context) {
  var replayKey;
  for (replayKey in this.replays_) {
    this.replays_[replayKey].finish(context);
  }
};


/**
 * @inheritDoc
 */
ol.render.webgl.ReplayGroup.prototype.getReplay =
    function(zIndex, replayType) {
  var replay = this.replays_[replayType];
  if (!goog.isDef(replay)) {
    var constructor = ol.render.webgl.BATCH_CONSTRUCTORS_[replayType];
    goog.asserts.assert(goog.isDef(constructor));
    replay = new constructor(this.tolerance_, this.maxExtent_);
    this.replays_[replayType] = replay;
  }
  return replay;
};


/**
 * @inheritDoc
 */
ol.render.webgl.ReplayGroup.prototype.isEmpty = function() {
  return goog.object.isEmpty(this.replays_);
};


/**
 * @param {ol.webgl.Context} context Context.
 * @param {ol.Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {ol.Size} size Size.
 * @param {number} pixelRatio Pixel ratio.
 * @param {number} opacity Global opacity.
 * @param {number} brightness Global brightness.
 * @param {number} contrast Global contrast.
 * @param {number} hue Global hue.
 * @param {number} saturation Global saturation.
 * @param {Object} skippedFeaturesHash Ids of features to skip.
 */
ol.render.webgl.ReplayGroup.prototype.replay = function(context,
    center, resolution, rotation, size, pixelRatio,
    opacity, brightness, contrast, hue, saturation, skippedFeaturesHash) {
  var i, ii, replay, result;
  for (i = 0, ii = ol.render.REPLAY_ORDER.length; i < ii; ++i) {
    replay = this.replays_[ol.render.REPLAY_ORDER[i]];
    if (goog.isDef(replay)) {
      replay.replay(context,
          center, resolution, rotation, size, pixelRatio,
          opacity, brightness, contrast, hue, saturation, skippedFeaturesHash,
          undefined, false);
    }
  }
};


/**
 * @private
 * @param {ol.webgl.Context} context Context.
 * @param {ol.Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {ol.Size} size Size.
 * @param {number} pixelRatio Pixel ratio.
 * @param {number} opacity Global opacity.
 * @param {number} brightness Global brightness.
 * @param {number} contrast Global contrast.
 * @param {number} hue Global hue.
 * @param {number} saturation Global saturation.
 * @param {Object} skippedFeaturesHash Ids of features to skip.
 * @param {function(ol.Feature): T|undefined} featureCallback Feature callback.
 * @param {boolean} oneByOne Draw features one-by-one for the hit-detecion.
 * @param {ol.Extent=} opt_hitExtent Hit extent: Only features intersecting
 *  this extent are checked.
 * @return {T|undefined} Callback result.
 * @template T
 */
ol.render.webgl.ReplayGroup.prototype.replayHitDetection_ = function(context,
    center, resolution, rotation, size, pixelRatio,
    opacity, brightness, contrast, hue, saturation, skippedFeaturesHash,
    featureCallback, oneByOne, opt_hitExtent) {
  var i, replay, result;
  for (i = ol.render.REPLAY_ORDER.length - 1; i >= 0; --i) {
    replay = this.replays_[ol.render.REPLAY_ORDER[i]];
    if (goog.isDef(replay)) {
      result = replay.replay(context,
          center, resolution, rotation, size, pixelRatio,
          opacity, brightness, contrast, hue, saturation,
          skippedFeaturesHash, featureCallback, oneByOne, opt_hitExtent);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
};


/**
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {ol.webgl.Context} context Context.
 * @param {ol.Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {ol.Size} size Size.
 * @param {number} pixelRatio Pixel ratio.
 * @param {number} opacity Global opacity.
 * @param {number} brightness Global brightness.
 * @param {number} contrast Global contrast.
 * @param {number} hue Global hue.
 * @param {number} saturation Global saturation.
 * @param {Object} skippedFeaturesHash Ids of features to skip.
 * @param {function(ol.Feature): T|undefined} callback Feature callback.
 * @return {T|undefined} Callback result.
 * @template T
 */
ol.render.webgl.ReplayGroup.prototype.forEachFeatureAtCoordinate = function(
    coordinate, context, center, resolution, rotation, size, pixelRatio,
    opacity, brightness, contrast, hue, saturation, skippedFeaturesHash,
    callback) {
  var gl = context.getGL();
  gl.bindFramebuffer(
      gl.FRAMEBUFFER, context.getHitDetectionFramebuffer());


  /**
   * @type {ol.Extent}
   */
  var hitExtent;
  if (goog.isDef(this.renderBuffer_)) {
    // build an extent around the coordinate, so that only features that
    // intersect this extent are checked
    hitExtent = ol.extent.buffer(
        ol.extent.boundingExtent([coordinate]),
        resolution * this.renderBuffer_);
  }

  return this.replayHitDetection_(context,
      coordinate, resolution, rotation, ol.render.webgl.HIT_DETECTION_SIZE_,
      pixelRatio, opacity, brightness, contrast, hue, saturation,
      skippedFeaturesHash,
      /**
       * @param {ol.Feature} feature Feature.
       * @return {?} Callback result.
       */
      function(feature) {
        var imageData = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

        if (imageData[3] > 0) {
          var result = callback(feature);
          if (result) {
            return result;
          }
        }
      }, true, hitExtent);
};


/**
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {ol.webgl.Context} context Context.
 * @param {ol.Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {ol.Size} size Size.
 * @param {number} pixelRatio Pixel ratio.
 * @param {number} opacity Global opacity.
 * @param {number} brightness Global brightness.
 * @param {number} contrast Global contrast.
 * @param {number} hue Global hue.
 * @param {number} saturation Global saturation.
 * @param {Object} skippedFeaturesHash Ids of features to skip.
 * @return {boolean} Is there a feature at the given coordinate?
 */
ol.render.webgl.ReplayGroup.prototype.hasFeatureAtCoordinate = function(
    coordinate, context, center, resolution, rotation, size, pixelRatio,
    opacity, brightness, contrast, hue, saturation, skippedFeaturesHash) {
  var gl = context.getGL();
  gl.bindFramebuffer(
      gl.FRAMEBUFFER, context.getHitDetectionFramebuffer());

  var hasFeature = this.replayHitDetection_(context,
      coordinate, resolution, rotation, ol.render.webgl.HIT_DETECTION_SIZE_,
      pixelRatio, opacity, brightness, contrast, hue, saturation,
      skippedFeaturesHash,
      /**
       * @param {ol.Feature} feature Feature.
       * @return {boolean} Is there a feature?
       */
      function(feature) {
        var imageData = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        return imageData[3] > 0;
      }, false);

  return goog.isDef(hasFeature);
};



/**
 * @const
 * @private
 * @type {Array.<number>}
 */
ol.render.webgl.HIT_DETECTION_SIZE_ = [1, 1];