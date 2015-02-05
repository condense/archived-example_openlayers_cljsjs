
goog.provide('ol.style.IconImageCache');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('ol.dom');
goog.require('ol.style.Image');
goog.require('ol.style.ImageState');



/**
 * @constructor
 */
ol.style.IconImageCache = function() {

  /**
   * @type {Object.<string, ol.style.IconImage_>}
   * @private
   */
  this.cache_ = {};

  /**
   * @type {number}
   * @private
   */
  this.cacheSize_ = 0;

  /**
   * @const
   * @type {number}
   * @private
   */
  this.maxCacheSize_ = 32;
};
goog.addSingletonGetter(ol.style.IconImageCache);


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @return {string} Cache key.
 */
ol.style.IconImageCache.getKey = function(src, crossOrigin) {
  goog.asserts.assert(goog.isDef(crossOrigin));
  return crossOrigin + ':' + src;
};


/**
 * FIXME empty description for jsdoc
 */
ol.style.IconImageCache.prototype.clear = function() {
  this.cache_ = {};
  this.cacheSize_ = 0;
};


/**
 * FIXME empty description for jsdoc
 */
ol.style.IconImageCache.prototype.expire = function() {
  if (this.cacheSize_ > this.maxCacheSize_) {
    var i = 0;
    var key, iconImage;
    for (key in this.cache_) {
      iconImage = this.cache_[key];
      if ((i++ & 3) === 0 && !goog.events.hasListener(iconImage)) {
        delete this.cache_[key];
        --this.cacheSize_;
      }
    }
  }
};


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @return {ol.style.IconImage_} Icon image.
 */
ol.style.IconImageCache.prototype.get = function(src, crossOrigin) {
  var key = ol.style.IconImageCache.getKey(src, crossOrigin);
  return key in this.cache_ ? this.cache_[key] : null;
};


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @param {ol.style.IconImage_} iconImage Icon image.
 */
ol.style.IconImageCache.prototype.set = function(src, crossOrigin, iconImage) {
  var key = ol.style.IconImageCache.getKey(src, crossOrigin);
  this.cache_[key] = iconImage;
  ++this.cacheSize_;
};
