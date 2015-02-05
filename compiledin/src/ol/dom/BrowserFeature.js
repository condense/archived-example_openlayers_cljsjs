// FIXME add tests for browser features (Modernizr?)

goog.provide('ol.dom.BrowserFeature');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.userAgent');
goog.require('goog.vec.Mat4');
goog.require('ol');


/**
 * @enum {boolean}
 */
ol.dom.BrowserFeature = {
  USE_MS_MATRIX_TRANSFORM: ol.LEGACY_IE_SUPPORT && ol.IS_LEGACY_IE,
  USE_MS_ALPHA_FILTER: ol.LEGACY_IE_SUPPORT && ol.IS_LEGACY_IE
};

