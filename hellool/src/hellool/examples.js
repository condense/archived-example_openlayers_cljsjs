
goog.provide("hellool.examples");

/**
 * GOTCHA: Can't goog.require(cljsjs.openlayers) from js, use a cljs require.
 */

/**
 * GOTCHA: {layers: ...} bad, {'layers': ...} good.
 *
 * Advanced compilation will eat your non-string object names.
 *
 */

hellool.examples.getting_started = function () {
    var map = new ol.Map({
        'target': 'map',
        'layers': [
            new ol.layer.Tile({
                'source': new ol.source.MapQuest({'layer': 'sat'})
            })
        ],
        'view': new ol.View({
            'center': ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
            'zoom': 4
        })
    });
}
