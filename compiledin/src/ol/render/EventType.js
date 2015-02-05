goog.provide('ol.render.EventType');

goog.require('goog.events.Event');
goog.require('ol.render.IVectorContext');


/**
 * @enum {string}
 */
ol.render.EventType = {
  /**
   * @event ol.render.Event#postcompose
   * @api
   */
  POSTCOMPOSE: 'postcompose',
  /**
   * @event ol.render.Event#precompose
   * @api
   */
  PRECOMPOSE: 'precompose',
  /**
   * @event ol.render.Event#render
   * @api
   */
  RENDER: 'render'
};


