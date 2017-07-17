/**
 * Created by kavyam on 6/29/2017.
 */


var map;
require(["cedar_script", "esri/map","esri/layers/ArcGISDynamicMapServiceLayer"],
    function( cedar_script, Map, ArcGISDynamicMapServiceLayer
    ) {
        //create esri map
        map = new Map("map", {
            center: [-76.1474, 43.04812],
            zoom: 4,
            basemap: "topo",
            smartNavigation: true
        });
        cedar_script.cedarscript();

        var dynamicLayer = new ArcGISDynamicMapServiceLayer("https://solutions.puretechltd.com/wwsarcgis/rest/services/Tempe/TempeTracking/MapServer", {
            opacity: 1
        });
        var mapLayerArray = [];
        mapLayerArray[0] = dynamicLayer;
        map.addLayers(mapLayerArray);


    });
