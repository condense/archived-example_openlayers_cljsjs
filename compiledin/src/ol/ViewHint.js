
goog.provide('ol.ViewHint');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol');
goog.require('ol.CenterConstraint');
goog.require('ol.Constraints');
goog.require('ol.Object');
goog.require('ol.ResolutionConstraint');
goog.require('ol.RotationConstraint');
goog.require('ol.RotationConstraintType');
goog.require('ol.Size');
goog.require('ol.coordinate');
goog.require('ol.extent');
goog.require('ol.proj');
goog.require('ol.proj.METERS_PER_UNIT');
goog.require('ol.proj.Projection');
goog.require('ol.proj.Units');



/**
 * @enum {number}
 */
ol.ViewHint = {
  ANIMATING: 0,
  INTERACTING: 1
};

