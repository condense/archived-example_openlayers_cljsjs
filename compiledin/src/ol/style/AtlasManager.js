goog.provide('ol.style.AtlasManager');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('ol');
goog.require('ol.style.Atlas');


/**
 * Provides information for an image inside an atlas manager.
 * `offsetX` and `offsetY` is the position of the image inside
 * the atlas image `image` and the position of the hit-detection image
 * inside the hit-detection atlas image `hitImage`.
 * @typedef {{offsetX: number, offsetY: number, image: HTMLCanvasElement,
 *    hitImage: HTMLCanvasElement}}
 */
ol.style.AtlasManagerInfo;



/**
 * Manages the creation of image atlases.
 *
 * Images added to this manager will be inserted into an atlas, which
 * will be used for rendering.
 * The `size` given in the constructor is the size for the first
 * atlas. After that, when new atlases are created, they will have
 * twice the size as the latest atlas (until `maxSize` is reached).
 *
 * If an application uses many images or very large images, it is recommended
 * to set a higher `size` value to avoid the creation of too many atlases.
 *
 * @constructor
 * @struct
 * @api
 * @param {olx.style.AtlasManagerOptions=} opt_options Options.
 */
ol.style.AtlasManager = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * The size in pixels of the latest atlas image.
   * @private
   * @type {number}
   */
  this.currentSize_ = goog.isDef(options.initialSize) ?
      options.initialSize : ol.INITIAL_ATLAS_SIZE;

  /**
   * The maximum size in pixels of atlas images.
   * @private
   * @type {number}
   */
  this.maxSize_ = goog.isDef(options.maxSize) ?
      options.maxSize : ol.MAX_ATLAS_SIZE != -1 ?
          ol.MAX_ATLAS_SIZE : goog.isDef(ol.WEBGL_MAX_TEXTURE_SIZE) ?
              ol.WEBGL_MAX_TEXTURE_SIZE : 2048;

  /**
   * The size in pixels between images.
   * @private
   * @type {number}
   */
  this.space_ = goog.isDef(options.space) ? options.space : 1;

  /**
   * @private
   * @type {Array.<ol.style.Atlas>}
   */
  this.atlases_ = [new ol.style.Atlas(this.currentSize_, this.space_)];

  /**
   * The size in pixels of the latest atlas image for hit-detection images.
   * @private
   * @type {number}
   */
  this.currentHitSize_ = this.currentSize_;

  /**
   * @private
   * @type {Array.<ol.style.Atlas>}
   */
  this.hitAtlases_ = [new ol.style.Atlas(this.currentHitSize_, this.space_)];
};


/**
 * @param {string} id The identifier of the entry to check.
 * @return {?ol.style.AtlasManagerInfo} The position and atlas image for the
 *    entry, or `null` if the entry is not part of the atlas manager.
 */
ol.style.AtlasManager.prototype.getInfo = function(id) {
  /** @type {?ol.style.AtlasInfo} */
  var info = this.getInfo_(this.atlases_, id);

  if (goog.isNull(info)) {
    return null;
  }
  /** @type {?ol.style.AtlasInfo} */
  var hitInfo = this.getInfo_(this.hitAtlases_, id);
  goog.asserts.assert(!goog.isNull(hitInfo));

  return this.mergeInfos_(info, hitInfo);
};


/**
 * @private
 * @param {Array.<ol.style.Atlas>} atlases The atlases to search.
 * @param {string} id The identifier of the entry to check.
 * @return {?ol.style.AtlasInfo} The position and atlas image for the entry,
 *    or `null` if the entry is not part of the atlases.
 */
ol.style.AtlasManager.prototype.getInfo_ = function(atlases, id) {
  var atlas, info, i, ii;
  for (i = 0, ii = atlases.length; i < ii; ++i) {
    atlas = atlases[i];
    info = atlas.get(id);
    if (!goog.isNull(info)) {
      return info;
    }
  }
  return null;
};


/**
 * @private
 * @param {ol.style.AtlasInfo} info The info for the real image.
 * @param {ol.style.AtlasInfo} hitInfo The info for the hit-detection
 *    image.
 * @return {?ol.style.AtlasManagerInfo} The position and atlas image for the
 *    entry, or `null` if the entry is not part of the atlases.
 */
ol.style.AtlasManager.prototype.mergeInfos_ = function(info, hitInfo) {
  goog.asserts.assert(info.offsetX === hitInfo.offsetX);
  goog.asserts.assert(info.offsetY === hitInfo.offsetY);
  return /** @type {ol.style.AtlasManagerInfo} */ ({
    offsetX: info.offsetX,
    offsetY: info.offsetY,
    image: info.image,
    hitImage: hitInfo.image
  });
};


/**
 * Add an image to the atlas manager.
 *
 * If an entry for the given id already exists, the entry will
 * be overridden (but the space on the atlas graphic will not be freed).
 *
 * If `renderHitCallback` is provided, the image (or the hit-detection version
 * of the image) will be rendered into a separate hit-detection atlas image.
 *
 * @param {string} id The identifier of the entry to add.
 * @param {number} width The width.
 * @param {number} height The height.
 * @param {function(CanvasRenderingContext2D, number, number)} renderCallback
 *    Called to render the new image onto an atlas image.
 * @param {function(CanvasRenderingContext2D, number, number)=}
 *    opt_renderHitCallback Called to render a hit-detection image onto a hit
 *    detection atlas image.
 * @param {Object=} opt_this Value to use as `this` when executing
 *    `renderCallback` and `renderHitCallback`.
 * @return {?ol.style.AtlasManagerInfo}  The position and atlas image for the
 *    entry, or `null` if the image is too big.
 */
ol.style.AtlasManager.prototype.add =
    function(id, width, height,
        renderCallback, opt_renderHitCallback, opt_this) {
  if (width + this.space_ > this.maxSize_ ||
      height + this.space_ > this.maxSize_) {
    return null;
  }

  /** @type {?ol.style.AtlasInfo} */
  var info = this.add_(false,
      id, width, height, renderCallback, opt_this);
  if (goog.isNull(info)) {
    return null;
  }

  // even if no hit-detection entry is requested, we insert a fake entry into
  // the hit-detection atlas, to make sure that the offset is the same for
  // the original image and the hit-detection image.
  var renderHitCallback = goog.isDef(opt_renderHitCallback) ?
      opt_renderHitCallback : goog.functions.NULL;

  /** @type {?ol.style.AtlasInfo} */
  var hitInfo = this.add_(true,
      id, width, height, renderHitCallback, opt_this);
  goog.asserts.assert(!goog.isNull(hitInfo));

  return this.mergeInfos_(info, hitInfo);
};


/**
 * @private
 * @param {boolean} isHitAtlas If the hit-detection atlases are used.
 * @param {string} id The identifier of the entry to add.
 * @param {number} width The width.
 * @param {number} height The height.
 * @param {function(CanvasRenderingContext2D, number, number)} renderCallback
 *    Called to render the new image onto an atlas image.
 * @param {Object=} opt_this Value to use as `this` when executing
 *    `renderCallback` and `renderHitCallback`.
 * @return {?ol.style.AtlasInfo}  The position and atlas image for the entry,
 *    or `null` if the image is too big.
 */
ol.style.AtlasManager.prototype.add_ =
    function(isHitAtlas, id, width, height,
        renderCallback, opt_this) {
  var atlases = (isHitAtlas) ? this.hitAtlases_ : this.atlases_;
  var atlas, info, i, ii;
  for (i = 0, ii = atlases.length; i < ii; ++i) {
    atlas = atlases[i];
    info = atlas.add(id, width, height, renderCallback, opt_this);
    if (!goog.isNull(info)) {
      return info;
    } else if (goog.isNull(info) && i === ii - 1) {
      // the entry could not be added to one of the existing atlases,
      // create a new atlas that is twice as big and try to add to this one.
      var size;
      if (isHitAtlas) {
        size = Math.min(this.currentHitSize_ * 2, this.maxSize_);
        this.currentHitSize_ = size;
      } else {
        size = Math.min(this.currentSize_ * 2, this.maxSize_);
        this.currentSize_ = size;
      }
      atlas = new ol.style.Atlas(size, this.space_);
      atlases.push(atlas);
      // run the loop another time
      ++ii;
    }
  }
  goog.asserts.fail();
};


/**
 * Provides information for an image inside an atlas.
 * `offsetX` and `offsetY` are the position of the image inside
 * the atlas image `image`.
 * @typedef {{offsetX: number, offsetY: number, image: HTMLCanvasElement}}
 */
ol.style.AtlasInfo;


