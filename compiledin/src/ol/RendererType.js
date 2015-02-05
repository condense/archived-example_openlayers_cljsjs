goog.provide('ol.RendererType');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.dispose');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('ol.layer.Layer');
goog.require('ol.renderer.Layer');
goog.require('ol.style.IconImageCache');
goog.require('ol.vec.Mat4');


/**
 * Available renderers: `'canvas'`, `'dom'` or `'webgl'`.
 * @enum {string}
 * @api stable
 */
ol.RendererType = {
  CANVAS: 'canvas',
  DOM: 'dom',
  WEBGL: 'webgl'
};

