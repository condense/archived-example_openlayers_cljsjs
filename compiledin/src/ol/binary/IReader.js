// FIXME Test on Internet Explorer with VBArray

goog.provide('ol.binary.IReader');

goog.require('goog.asserts');
goog.require('goog.userAgent');
goog.require('ol.has');


/**
 * @interface
 */
ol.binary.IReader = function() {};


/**
 * @return {boolean} At EOF.
 */
ol.binary.IReader.prototype.atEOF = function() {};


/**
 * @return {number} Byte.
 */
ol.binary.IReader.prototype.readByte = function() {};



/**
 * @constructor
 * @param {ArrayBuffer} arrayBuffer Array buffer.
 * @implements {ol.binary.IReader}
 */
ol.binary.ArrayBufferReader = function(arrayBuffer) {

  /**
   * @private
   * @type {Uint8Array}
   */
  this.uint8View_ = new Uint8Array(arrayBuffer);

  /**
   * @private
   * @type {number}
   */
  this.length_ = this.uint8View_.length;

  /**
   * @private
   * @type {number}
   */
  this.offset_ = 0;

};


/**
 * @inheritDoc
 */
ol.binary.ArrayBufferReader.prototype.atEOF = function() {
  return this.offset_ == this.length_;
};


/**
 * @inheritDoc
 */
ol.binary.ArrayBufferReader.prototype.readByte = function() {
  if (this.offset_ < this.length_) {
    return this.uint8View_[this.offset_++];
  } else {
    goog.asserts.fail();
    return 0;
  }
};



/**
 * @constructor
 * @implements {ol.binary.IReader}
 * @param {Array.<number>} array Array.
 */
ol.binary.ArrayReader = function(array) {

  /**
   * @private
   * @type {Array.<number>}
   */
  this.array_ = array;

  /**
   * @private
   * @type {number}
   */
  this.length_ = array.length;

  /**
   * @private
   * @type {number}
   */
  this.offset_ = 0;

};


/**
 * @inheritDoc
 */
ol.binary.ArrayReader.prototype.atEOF = function() {
  return this.offset_ == this.length_;
};


/**
 * @inheritDoc
 */
ol.binary.ArrayReader.prototype.readByte = function() {
  if (this.offset_ < this.length_) {
    return this.array_[this.offset_++];
  } else {
    goog.asserts.fail();
    return 0;
  }
};
