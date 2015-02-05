// FIXME should handle all geo-referenced data, not just vector data

goog.provide('ol.interaction.DragAndDrop');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.FileDropHandler');
goog.require('goog.events.FileDropHandler.EventType');
goog.require('goog.fs.FileReader');
goog.require('goog.functions');
goog.require('ol.interaction.Interaction');
goog.require('ol.proj');
goog.require('ol.interaction.DragAndDropEvent');



/**
 * @classdesc
 * Handles input of vector data by drag and drop.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires ol.interaction.DragAndDropEvent
 * @param {olx.interaction.DragAndDropOptions=} opt_options Options.
 * @api stable
 */
ol.interaction.DragAndDrop = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  goog.base(this, {
    handleEvent: ol.interaction.DragAndDrop.handleEvent
  });

  /**
   * @private
   * @type {Array.<function(new: ol.format.Feature)>}
   */
  this.formatConstructors_ = goog.isDef(options.formatConstructors) ?
      options.formatConstructors : [];

  /**
   * @private
   * @type {ol.proj.Projection}
   */
  this.projection_ = goog.isDef(options.projection) ?
      ol.proj.get(options.projection) : null;

  /**
   * @private
   * @type {goog.events.FileDropHandler}
   */
  this.fileDropHandler_ = null;

  /**
   * @private
   * @type {goog.events.Key|undefined}
   */
  this.dropListenKey_ = undefined;

};
goog.inherits(ol.interaction.DragAndDrop, ol.interaction.Interaction);


/**
 * @inheritDoc
 */
ol.interaction.DragAndDrop.prototype.disposeInternal = function() {
  if (goog.isDef(this.dropListenKey_)) {
    goog.events.unlistenByKey(this.dropListenKey_);
  }
  goog.base(this, 'disposeInternal');
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 * @private
 */
ol.interaction.DragAndDrop.prototype.handleDrop_ = function(event) {
  var files = event.getBrowserEvent().dataTransfer.files;
  var i, ii, file;
  for (i = 0, ii = files.length; i < ii; ++i) {
    file = files[i];
    // The empty string param is a workaround for
    // https://code.google.com/p/closure-library/issues/detail?id=524
    var reader = goog.fs.FileReader.readAsText(file, '');
    reader.addCallback(goog.partial(this.handleResult_, file), this);
  }
};


/**
 * @param {File} file File.
 * @param {string} result Result.
 * @private
 */
ol.interaction.DragAndDrop.prototype.handleResult_ = function(file, result) {
  var map = this.getMap();
  goog.asserts.assert(!goog.isNull(map));
  var projection = this.projection_;
  if (goog.isNull(projection)) {
    var view = map.getView();
    goog.asserts.assert(!goog.isNull(view));
    projection = view.getProjection();
    goog.asserts.assert(goog.isDef(projection));
  }
  var formatConstructors = this.formatConstructors_;
  var features = [];
  var i, ii;
  for (i = 0, ii = formatConstructors.length; i < ii; ++i) {
    var formatConstructor = formatConstructors[i];
    var format = new formatConstructor();
    var readFeatures = this.tryReadFeatures_(format, result);
    if (!goog.isNull(readFeatures)) {
      var featureProjection = format.readProjection(result);
      var transform = ol.proj.getTransform(featureProjection, projection);
      var j, jj;
      for (j = 0, jj = readFeatures.length; j < jj; ++j) {
        var feature = readFeatures[j];
        var geometry = feature.getGeometry();
        if (goog.isDefAndNotNull(geometry)) {
          geometry.applyTransform(transform);
        }
        features.push(feature);
      }
    }
  }
  this.dispatchEvent(
      new ol.interaction.DragAndDropEvent(
          ol.interaction.DragAndDropEventType.ADD_FEATURES, this, file,
          features, projection));
};


/**
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {ol.interaction.DragAndDrop}
 * @api
 */
ol.interaction.DragAndDrop.handleEvent = goog.functions.TRUE;


/**
 * @inheritDoc
 */
ol.interaction.DragAndDrop.prototype.setMap = function(map) {
  if (goog.isDef(this.dropListenKey_)) {
    goog.events.unlistenByKey(this.dropListenKey_);
    this.dropListenKey_ = undefined;
  }
  if (!goog.isNull(this.fileDropHandler_)) {
    goog.dispose(this.fileDropHandler_);
    this.fileDropHandler_ = null;
  }
  goog.asserts.assert(!goog.isDef(this.dropListenKey_));
  goog.base(this, 'setMap', map);
  if (!goog.isNull(map)) {
    this.fileDropHandler_ = new goog.events.FileDropHandler(map.getViewport());
    this.dropListenKey_ = goog.events.listen(
        this.fileDropHandler_, goog.events.FileDropHandler.EventType.DROP,
        this.handleDrop_, false, this);
  }
};


/**
 * @param {ol.format.Feature} format Format.
 * @param {string} text Text.
 * @private
 * @return {Array.<ol.Feature>} Features.
 */
ol.interaction.DragAndDrop.prototype.tryReadFeatures_ = function(format, text) {
  try {
    return format.readFeatures(text);
  } catch (e) {
    return null;
  }
};
