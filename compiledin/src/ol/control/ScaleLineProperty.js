goog.provide('ol.control.ScaleLineProperty');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.style');
goog.require('ol.Object');
goog.require('ol.TransformFunction');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.proj');
goog.require('ol.proj.Units');
goog.require('ol.sphere.NORMAL');


/**
 * @enum {string}
 */
ol.control.ScaleLineProperty = {
  UNITS: 'units'
};

