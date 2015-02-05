// FIXME handle geolocation not supported

goog.provide('ol.GeolocationProperty');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math');
goog.require('ol.Coordinate');
goog.require('ol.Object');
goog.require('ol.geom.Geometry');
goog.require('ol.geom.Polygon');
goog.require('ol.has');
goog.require('ol.proj');
goog.require('ol.sphere.WGS84');


/**
 * @enum {string}
 */
ol.GeolocationProperty = {
  ACCURACY: 'accuracy',
  ACCURACY_GEOMETRY: 'accuracyGeometry',
  ALTITUDE: 'altitude',
  ALTITUDE_ACCURACY: 'altitudeAccuracy',
  HEADING: 'heading',
  POSITION: 'position',
  PROJECTION: 'projection',
  SPEED: 'speed',
  TRACKING: 'tracking',
  TRACKING_OPTIONS: 'trackingOptions'
};

