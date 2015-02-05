// FIXME add option to apply snapToPixel to all coordinates?
// FIXME can eliminate empty set styles and strokes (when all geoms skipped)

goog.provide('ol.render.canvas.Replay');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('ol.array');
goog.require('ol.color');
goog.require('ol.dom');
goog.require('ol.extent');
goog.require('ol.extent.Relationship');
goog.require('ol.geom.flat.simplify');
goog.require('ol.geom.flat.transform');
goog.require('ol.has');
goog.require('ol.render.IReplayGroup');
goog.require('ol.render.IVectorContext');
goog.require('ol.render.canvas');
goog.require('ol.render.canvas.Instruction');
goog.require('ol.vec.Mat4');


/**
 * @constructor
 * @implements {ol.render.IVectorContext}
 * @param {number} tolerance Tolerance.
 * @param {ol.Extent} maxExtent Maximum extent.
 * @param {number} resolution Resolution.
 * @protected
 * @struct
 */
ol.render.canvas.Replay = function(tolerance, maxExtent, resolution) {

  /**
   * @protected
   * @type {number}
   */
  this.tolerance = tolerance;

  /**
   * @protected
   * @type {ol.Extent}
   */
  this.maxExtent = maxExtent;

  /**
   * @protected
   * @type {number}
   */
  this.maxLineWidth = 0;

  /**
   * @protected
   * @type {number}
   */
  this.resolution = resolution;

  /**
   * @private
   * @type {Array.<*>}
   */
  this.beginGeometryInstruction1_ = null;

  /**
   * @private
   * @type {Array.<*>}
   */
  this.beginGeometryInstruction2_ = null;

  /**
   * @protected
   * @type {Array.<*>}
   */
  this.instructions = [];

  /**
   * @protected
   * @type {Array.<number>}
   */
  this.coordinates = [];

  /**
   * @private
   * @type {goog.vec.Mat4.Number}
   */
  this.renderedTransform_ = goog.vec.Mat4.createNumber();

  /**
   * @protected
   * @type {Array.<*>}
   */
  this.hitDetectionInstructions = [];

  /**
   * @private
   * @type {Array.<number>}
   */
  this.pixelCoordinates_ = [];

  /**
   * @private
   * @type {!goog.vec.Mat4.Number}
   */
  this.tmpLocalTransform_ = goog.vec.Mat4.createNumber();

};


/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {boolean} close Close.
 * @protected
 * @return {number} My end.
 */
ol.render.canvas.Replay.prototype.appendFlatCoordinates =
    function(flatCoordinates, offset, end, stride, close) {

  var myEnd = this.coordinates.length;
  var extent = this.getBufferedMaxExtent();
  var lastCoord = [flatCoordinates[offset], flatCoordinates[offset + 1]];
  var nextCoord = [NaN, NaN];
  var skipped = true;

  var i, lastRel, nextRel;
  for (i = offset + stride; i < end; i += stride) {
    nextCoord[0] = flatCoordinates[i];
    nextCoord[1] = flatCoordinates[i + 1];
    nextRel = ol.extent.coordinateRelationship(extent, nextCoord);
    if (nextRel !== lastRel) {
      if (skipped) {
        this.coordinates[myEnd++] = lastCoord[0];
        this.coordinates[myEnd++] = lastCoord[1];
      }
      this.coordinates[myEnd++] = nextCoord[0];
      this.coordinates[myEnd++] = nextCoord[1];
      skipped = false;
    } else if (nextRel === ol.extent.Relationship.INTERSECTING) {
      this.coordinates[myEnd++] = nextCoord[0];
      this.coordinates[myEnd++] = nextCoord[1];
      skipped = false;
    } else {
      skipped = true;
    }
    lastCoord[0] = nextCoord[0];
    lastCoord[1] = nextCoord[1];
    lastRel = nextRel;
  }

  // handle case where there is only one point to append
  if (i === offset + stride) {
    this.coordinates[myEnd++] = lastCoord[0];
    this.coordinates[myEnd++] = lastCoord[1];
  }

  if (close) {
    this.coordinates[myEnd++] = flatCoordinates[offset];
    this.coordinates[myEnd++] = flatCoordinates[offset + 1];
  }
  return myEnd;
};


/**
 * @protected
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.Feature} feature Feature.
 */
ol.render.canvas.Replay.prototype.beginGeometry = function(geometry, feature) {
  this.beginGeometryInstruction1_ =
      [ol.render.canvas.Instruction.BEGIN_GEOMETRY, feature, 0];
  this.instructions.push(this.beginGeometryInstruction1_);
  this.beginGeometryInstruction2_ =
      [ol.render.canvas.Instruction.BEGIN_GEOMETRY, feature, 0];
  this.hitDetectionInstructions.push(this.beginGeometryInstruction2_);
};


/**
 * @private
 * @param {CanvasRenderingContext2D} context Context.
 * @param {number} pixelRatio Pixel ratio.
 * @param {goog.vec.Mat4.Number} transform Transform.
 * @param {number} viewRotation View rotation.
 * @param {Object} skippedFeaturesHash Ids of features to skip.
 * @param {Array.<*>} instructions Instructions array.
 * @param {function(ol.Feature): T|undefined} featureCallback Feature callback.
 * @param {ol.Extent=} opt_hitExtent Only check features that intersect this
 *     extent.
 * @return {T|undefined} Callback result.
 * @template T
 */
ol.render.canvas.Replay.prototype.replay_ = function(
    context, pixelRatio, transform, viewRotation, skippedFeaturesHash,
    instructions, featureCallback, opt_hitExtent) {
  /** @type {Array.<number>} */
  var pixelCoordinates;
  if (ol.vec.Mat4.equals2D(transform, this.renderedTransform_)) {
    pixelCoordinates = this.pixelCoordinates_;
  } else {
    pixelCoordinates = ol.geom.flat.transform.transform2D(
        this.coordinates, 0, this.coordinates.length, 2,
        transform, this.pixelCoordinates_);
    goog.vec.Mat4.setFromArray(this.renderedTransform_, transform);
    goog.asserts.assert(pixelCoordinates === this.pixelCoordinates_);
  }
  var i = 0; // instruction index
  var ii = instructions.length; // end of instructions
  var d = 0; // data index
  var dd; // end of per-instruction data
  var localTransform = this.tmpLocalTransform_;
  while (i < ii) {
    var instruction = instructions[i];
    var type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
    var feature, fill, stroke, text, x, y;
    switch (type) {
      case ol.render.canvas.Instruction.BEGIN_GEOMETRY:
        feature = /** @type {ol.Feature} */ (instruction[1]);
        var featureUid = goog.getUid(feature).toString();
        if (goog.isDef(skippedFeaturesHash[featureUid])) {
          i = /** @type {number} */ (instruction[2]);
        } else if (goog.isDef(opt_hitExtent) && !ol.extent.intersects(
            opt_hitExtent, feature.getGeometry().getExtent())) {
          i = /** @type {number} */ (instruction[2]);
        } else {
          ++i;
        }
        break;
      case ol.render.canvas.Instruction.BEGIN_PATH:
        context.beginPath();
        ++i;
        break;
      case ol.render.canvas.Instruction.CIRCLE:
        goog.asserts.assert(goog.isNumber(instruction[1]));
        d = /** @type {number} */ (instruction[1]);
        var x1 = pixelCoordinates[d];
        var y1 = pixelCoordinates[d + 1];
        var x2 = pixelCoordinates[d + 2];
        var y2 = pixelCoordinates[d + 3];
        var dx = x2 - x1;
        var dy = y2 - y1;
        var r = Math.sqrt(dx * dx + dy * dy);
        context.arc(x1, y1, r, 0, 2 * Math.PI, true);
        ++i;
        break;
      case ol.render.canvas.Instruction.CLOSE_PATH:
        context.closePath();
        ++i;
        break;
      case ol.render.canvas.Instruction.DRAW_IMAGE:
        goog.asserts.assert(goog.isNumber(instruction[1]));
        d = /** @type {number} */ (instruction[1]);
        goog.asserts.assert(goog.isNumber(instruction[2]));
        dd = /** @type {number} */ (instruction[2]);
        var image =  /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */
            (instruction[3]);
        // Remaining arguments in DRAW_IMAGE are in alphabetical order
        var anchorX = /** @type {number} */ (instruction[4]) * pixelRatio;
        var anchorY = /** @type {number} */ (instruction[5]) * pixelRatio;
        var height = /** @type {number} */ (instruction[6]);
        var opacity = /** @type {number} */ (instruction[7]);
        var originX = /** @type {number} */ (instruction[8]);
        var originY = /** @type {number} */ (instruction[9]);
        var rotateWithView = /** @type {boolean} */ (instruction[10]);
        var rotation = /** @type {number} */ (instruction[11]);
        var scale = /** @type {number} */ (instruction[12]);
        var snapToPixel = /** @type {boolean} */ (instruction[13]);
        var width = /** @type {number} */ (instruction[14]);
        if (rotateWithView) {
          rotation += viewRotation;
        }
        for (; d < dd; d += 2) {
          x = pixelCoordinates[d] - anchorX;
          y = pixelCoordinates[d + 1] - anchorY;
          if (snapToPixel) {
            x = (x + 0.5) | 0;
            y = (y + 0.5) | 0;
          }
          if (scale != 1 || rotation !== 0) {
            var centerX = x + anchorX;
            var centerY = y + anchorY;
            ol.vec.Mat4.makeTransform2D(
                localTransform, centerX, centerY, scale, scale,
                rotation, -centerX, -centerY);
            context.setTransform(
                goog.vec.Mat4.getElement(localTransform, 0, 0),
                goog.vec.Mat4.getElement(localTransform, 1, 0),
                goog.vec.Mat4.getElement(localTransform, 0, 1),
                goog.vec.Mat4.getElement(localTransform, 1, 1),
                goog.vec.Mat4.getElement(localTransform, 0, 3),
                goog.vec.Mat4.getElement(localTransform, 1, 3));
          }
          var alpha = context.globalAlpha;
          if (opacity != 1) {
            context.globalAlpha = alpha * opacity;
          }

          context.drawImage(image, originX, originY, width, height,
              x, y, width * pixelRatio, height * pixelRatio);

          if (opacity != 1) {
            context.globalAlpha = alpha;
          }
          if (scale != 1 || rotation !== 0) {
            context.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
        ++i;
        break;
      case ol.render.canvas.Instruction.DRAW_TEXT:
        goog.asserts.assert(goog.isNumber(instruction[1]));
        d = /** @type {number} */ (instruction[1]);
        goog.asserts.assert(goog.isNumber(instruction[2]));
        dd = /** @type {number} */ (instruction[2]);
        goog.asserts.assert(goog.isString(instruction[3]));
        text = /** @type {string} */ (instruction[3]);
        goog.asserts.assert(goog.isNumber(instruction[4]));
        var offsetX = /** @type {number} */ (instruction[4]) * pixelRatio;
        goog.asserts.assert(goog.isNumber(instruction[5]));
        var offsetY = /** @type {number} */ (instruction[5]) * pixelRatio;
        goog.asserts.assert(goog.isNumber(instruction[6]));
        rotation = /** @type {number} */ (instruction[6]);
        goog.asserts.assert(goog.isNumber(instruction[7]));
        scale = /** @type {number} */ (instruction[7]) * pixelRatio;
        goog.asserts.assert(goog.isBoolean(instruction[8]));
        fill = /** @type {boolean} */ (instruction[8]);
        goog.asserts.assert(goog.isBoolean(instruction[9]));
        stroke = /** @type {boolean} */ (instruction[9]);
        for (; d < dd; d += 2) {
          x = pixelCoordinates[d] + offsetX;
          y = pixelCoordinates[d + 1] + offsetY;
          if (scale != 1 || rotation !== 0) {
            ol.vec.Mat4.makeTransform2D(
                localTransform, x, y, scale, scale, rotation, -x, -y);
            context.setTransform(
                goog.vec.Mat4.getElement(localTransform, 0, 0),
                goog.vec.Mat4.getElement(localTransform, 1, 0),
                goog.vec.Mat4.getElement(localTransform, 0, 1),
                goog.vec.Mat4.getElement(localTransform, 1, 1),
                goog.vec.Mat4.getElement(localTransform, 0, 3),
                goog.vec.Mat4.getElement(localTransform, 1, 3));
          }
          if (stroke) {
            context.strokeText(text, x, y);
          }
          if (fill) {
            context.fillText(text, x, y);
          }
          if (scale != 1 || rotation !== 0) {
            context.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
        ++i;
        break;
      case ol.render.canvas.Instruction.END_GEOMETRY:
        if (goog.isDef(featureCallback)) {
          feature = /** @type {ol.Feature} */ (instruction[1]);
          var result = featureCallback(feature);
          if (result) {
            return result;
          }
        }
        ++i;
        break;
      case ol.render.canvas.Instruction.FILL:
        context.fill();
        ++i;
        break;
      case ol.render.canvas.Instruction.MOVE_TO_LINE_TO:
        goog.asserts.assert(goog.isNumber(instruction[1]));
        d = /** @type {number} */ (instruction[1]);
        goog.asserts.assert(goog.isNumber(instruction[2]));
        dd = /** @type {number} */ (instruction[2]);
        context.moveTo(pixelCoordinates[d], pixelCoordinates[d + 1]);
        for (d += 2; d < dd; d += 2) {
          context.lineTo(pixelCoordinates[d], pixelCoordinates[d + 1]);
        }
        ++i;
        break;
      case ol.render.canvas.Instruction.SET_FILL_STYLE:
        goog.asserts.assert(goog.isString(instruction[1]));
        context.fillStyle = /** @type {string} */ (instruction[1]);
        ++i;
        break;
      case ol.render.canvas.Instruction.SET_STROKE_STYLE:
        goog.asserts.assert(goog.isString(instruction[1]));
        goog.asserts.assert(goog.isNumber(instruction[2]));
        goog.asserts.assert(goog.isString(instruction[3]));
        goog.asserts.assert(goog.isString(instruction[4]));
        goog.asserts.assert(goog.isNumber(instruction[5]));
        goog.asserts.assert(!goog.isNull(instruction[6]));
        var usePixelRatio = goog.isDef(instruction[7]) ? instruction[7] : true;
        var lineWidth = /** @type {number} */ (instruction[2]);
        context.strokeStyle = /** @type {string} */ (instruction[1]);
        context.lineWidth = usePixelRatio ? lineWidth * pixelRatio : lineWidth;
        context.lineCap = /** @type {string} */ (instruction[3]);
        context.lineJoin = /** @type {string} */ (instruction[4]);
        context.miterLimit = /** @type {number} */ (instruction[5]);
        if (ol.has.CANVAS_LINE_DASH) {
          context.setLineDash(/** @type {Array.<number>} */ (instruction[6]));
        }
        ++i;
        break;
      case ol.render.canvas.Instruction.SET_TEXT_STYLE:
        goog.asserts.assert(goog.isString(instruction[1]));
        goog.asserts.assert(goog.isString(instruction[2]));
        goog.asserts.assert(goog.isString(instruction[3]));
        context.font = /** @type {string} */ (instruction[1]);
        context.textAlign = /** @type {string} */ (instruction[2]);
        context.textBaseline = /** @type {string} */ (instruction[3]);
        ++i;
        break;
      case ol.render.canvas.Instruction.STROKE:
        context.stroke();
        ++i;
        break;
      default:
        goog.asserts.fail();
        ++i; // consume the instruction anyway, to avoid an infinite loop
        break;
    }
  }
  // assert that all instructions were consumed
  goog.asserts.assert(i == instructions.length);
  return undefined;
};


/**
 * @param {CanvasRenderingContext2D} context Context.
 * @param {number} pixelRatio Pixel ratio.
 * @param {goog.vec.Mat4.Number} transform Transform.
 * @param {number} viewRotation View rotation.
 * @param {Object} skippedFeaturesHash Ids of features to skip
 */
ol.render.canvas.Replay.prototype.replay = function(
    context, pixelRatio, transform, viewRotation, skippedFeaturesHash) {
  var instructions = this.instructions;
  this.replay_(context, pixelRatio, transform, viewRotation,
      skippedFeaturesHash, instructions, undefined);
};


/**
 * @param {CanvasRenderingContext2D} context Context.
 * @param {goog.vec.Mat4.Number} transform Transform.
 * @param {number} viewRotation View rotation.
 * @param {Object} skippedFeaturesHash Ids of features to skip
 * @param {function(ol.Feature): T=} opt_featureCallback Feature callback.
 * @param {ol.Extent=} opt_hitExtent Only check features that intersect this
 *     extent.
 * @return {T|undefined} Callback result.
 * @template T
 */
ol.render.canvas.Replay.prototype.replayHitDetection = function(
    context, transform, viewRotation, skippedFeaturesHash,
    opt_featureCallback, opt_hitExtent) {
  var instructions = this.hitDetectionInstructions;
  return this.replay_(context, 1, transform, viewRotation,
      skippedFeaturesHash, instructions, opt_featureCallback, opt_hitExtent);
};


/**
 * @private
 */
ol.render.canvas.Replay.prototype.reverseHitDetectionInstructions_ =
    function() {
  var hitDetectionInstructions = this.hitDetectionInstructions;
  // step 1 - reverse array
  hitDetectionInstructions.reverse();
  // step 2 - reverse instructions within geometry blocks
  var i;
  var n = hitDetectionInstructions.length;
  var instruction;
  var type;
  var begin = -1;
  for (i = 0; i < n; ++i) {
    instruction = hitDetectionInstructions[i];
    type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
    if (type == ol.render.canvas.Instruction.END_GEOMETRY) {
      goog.asserts.assert(begin == -1);
      begin = i;
    } else if (type == ol.render.canvas.Instruction.BEGIN_GEOMETRY) {
      instruction[2] = i;
      goog.asserts.assert(begin >= 0);
      ol.array.reverseSubArray(this.hitDetectionInstructions, begin, i);
      begin = -1;
    }
  }
};


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawAsync = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawCircleGeometry = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawFeature = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawGeometryCollectionGeometry =
    goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawLineStringGeometry = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawMultiLineStringGeometry =
    goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawPointGeometry = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawMultiPointGeometry = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawPolygonGeometry = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawMultiPolygonGeometry =
    goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.drawText = goog.abstractMethod;


/**
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {ol.Feature} feature Feature.
 */
ol.render.canvas.Replay.prototype.endGeometry = function(geometry, feature) {
  goog.asserts.assert(!goog.isNull(this.beginGeometryInstruction1_));
  this.beginGeometryInstruction1_[2] = this.instructions.length;
  this.beginGeometryInstruction1_ = null;
  goog.asserts.assert(!goog.isNull(this.beginGeometryInstruction2_));
  this.beginGeometryInstruction2_[2] = this.hitDetectionInstructions.length;
  this.beginGeometryInstruction2_ = null;
  var endGeometryInstruction =
      [ol.render.canvas.Instruction.END_GEOMETRY, feature];
  this.instructions.push(endGeometryInstruction);
  this.hitDetectionInstructions.push(endGeometryInstruction);
};


/**
 * FIXME empty description for jsdoc
 */
ol.render.canvas.Replay.prototype.finish = goog.nullFunction;


/**
 * Get the buffered rendering extent.  Rendering will be clipped to the extent
 * provided to the constructor.  To account for symbolizers that may intersect
 * this extent, we calculate a buffered extent (e.g. based on stroke width).
 * @return {ol.Extent} The buffered rendering extent.
 * @protected
 */
ol.render.canvas.Replay.prototype.getBufferedMaxExtent = function() {
  return this.maxExtent;
};


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.setFillStrokeStyle = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.setImageStyle = goog.abstractMethod;


/**
 * @inheritDoc
 */
ol.render.canvas.Replay.prototype.setTextStyle = goog.abstractMethod;

