
goog.provide("hellool.examples");
goog.require("ol.Map");
goog.require("ol.layer.Tile");
goog.require("ol.View");
goog.require("ol.proj");
goog.require("ol.source.MapQuest");

/**
 * This is based on a version of ol3 modified to fit with the clojurescript
 * compilation coventions: filenames match goog.provide statements.
 */

/**
 * GOTCHA: don't use string attributes to parameters
 * because we're compiling with the source code and name mangling needs
 * to match up.
 */

hellool.examples.getting_started = function () {
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
            })
        ],
        view: new ol.View({
            center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
            zoom: 4
        })
    });
}
