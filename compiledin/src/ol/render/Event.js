goog.provide('ol.render.Event');

goog.require('goog.events.Event');
goog.require('ol.render.IVectorContext');
goog.require('ol.render.EventType');


/**
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.render.Event}
 * @param {ol.render.EventType} type Type.
 * @param {Object=} opt_target Target.
 * @param {ol.render.IVectorContext=} opt_vectorContext Vector context.
 * @param {ol.render.IReplayGroup=} opt_replayGroup Replay group.
 * @param {olx.FrameState=} opt_frameState Frame state.
 * @param {?CanvasRenderingContext2D=} opt_context Context.
 * @param {?ol.webgl.Context=} opt_glContext WebGL Context.
 */
ol.render.Event = function(
    type, opt_target, opt_vectorContext, opt_replayGroup, opt_frameState,
    opt_context, opt_glContext) {

  goog.base(this, type, opt_target);

  /**
   * For canvas, this is an instance of {@link ol.render.canvas.Immediate}.
   * @type {ol.render.IVectorContext|undefined}
   * @api
   */
  this.vectorContext = opt_vectorContext;

  /**
   * @type {ol.render.IReplayGroup|undefined}
   */
  this.replayGroup = opt_replayGroup;

  /**
   * @type {olx.FrameState|undefined}
   * @api
   */
  this.frameState = opt_frameState;

  /**
   * Canvas context. Only available when a Canvas renderer is used, null
   * otherwise.
   * @type {CanvasRenderingContext2D|null|undefined}
   * @api
   */
  this.context = opt_context;

  /**
   * WebGL context. Only available when a WebGL renderer is used, null
   * otherwise.
   * @type {ol.webgl.Context|null|undefined}
   * @api
   */
  this.glContext = opt_glContext;

};
goog.inherits(ol.render.Event, goog.events.Event);
