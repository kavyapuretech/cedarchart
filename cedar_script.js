/**
 * Created by kavyam on 6/29/2017.
 */

var datesarray = [];

define("cedar_script",[ "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/layers/GraphicsLayer",  "dojo/query",
        "esri/tasks/QueryTask","esri/tasks/query","esri/renderers/SimpleRenderer",  "esri/renderers/UniqueValueRenderer", "esri/Color", "esri/graphic", "dojo/dom","dojo/on",  "dojo/parser", "dojo/domReady!"],
    function( SimpleMarkerSymbol, SimpleLineSymbol, GraphicsLayer, query, QueryTask, Query, SimpleRenderer, UniqueValueRenderer, Color, Graphic, dom,on, parser) {

        function cedarscript(){
            parser.parse();
            var Graphic_Chart_Layer = new GraphicsLayer({
                id:  "graphiclayer"
            });
            map.addLayer(Graphic_Chart_Layer);
            //Symbol for points queried when hover over bar chart
            var QuickSelectSymbol =  new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15).setColor(new Color([175,14,105, 0.5]));
            QuickSelectSymbol.setSize(10);
            QuickSelectSymbol = new SimpleMarkerSymbol({
                "color": [204, 51, 255],
                "size": 12,
                "angle": -30,
                "fill-opacity":0.5,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",

                "outline": {
                    "color": [153, 0, 204, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            });
            // Graphic_Chart_Layer.add(QuickSelectSymbol);


            var queryTask = new QueryTask('https://solutions.puretechltd.com/wwsarcgis/rest/services/Tempe/TempeQuery/FeatureServer/5');
            var firstquery = new Query();
            firstquery.returnGeometry = true;
            firstquery.outFields = ["*"];

            map.on('load', function() {
                map.disableScrollWheelZoom();
            });
            function checkmarkCounts() {
                queryTask.execute(firstquery, showResults);
            }

            //fire event when results are returned
            function showResults(featureSet) {
                // Graphic_Chart_Layer.clear();
                map.graphics.clear();
                var resultFeatures = featureSet.features;
                for (var i = 0,
                         il = resultFeatures.length; i < il; i++) {
                    var graphic = resultFeatures[i];
                    graphic.setSymbol(QuickSelectSymbol);
                    // map.graphics.add(graphic);
                    Graphic_Chart_Layer.add(graphic);
                }
            }
            //create a cedar chart
            var chart = new Cedar({
                "type": "bar"
            });

            //create the dataset w/ mappings
            var dataset = {
                "url":"https://solutions.puretechltd.com/wwsarcgis/rest/services/Tempe/TempeQuery/FeatureServer/5",

                "query": {
                    "groupByFieldsForStatistics": "WWS_LAST_PT_EDITOR",
                    "outStatistics": [{
                        "statisticType": "count",
                        "onStatisticField": "OBJECTID",
                        "outStatisticFieldName": "OBJECTID"
                    }]
                },
                "mappings":{
                    "sort": "OBJECTID DESC",
                    "x": {"field":"WWS_LAST_PT_EDITOR","label":"User Initials"},
                    "y":  {"field":"OBJECTID","label":"COUNT"}
                }
                // ,
                // "infoTemplate": new InfoTemplate("EDITOR: ${WWS_LAST_PT_EDITOR}", "${OBJECTID}","visited by","${WWS_LAST_PT_EDITOR}")
            };
            chart.tooltip = {
                "title": "{WWS_LAST_PT_EDITOR}",
                "content": "{OBJECTID}"
            };

            chart.override = {
                "height": 180,
                "width": 40,
                "marks": [{"properties": {
                    "hover": {"fill": {"value": "#68869c"},"stroke":{"value":"white"}},
                    "update": {"fill": {"value": "#1896CE"},"stroke":{"value":"white"}}
                }
                }]
            };

            //assign to the chart
            chart.dataset = dataset;

            //show the chart

            chart.show({
                elementId: "#chart",
                renderer: "svg",
                autolabels: true
            }, function(err, data) {
                if (err) { console.log(err); }
            });



            //CHART EVENTS
            chart.on('mouseover', onChartHover);
            chart.on('mouseout', function(evt) {
                // map.graphics.clear();
                Graphic_Chart_Layer.clear();
            });

            var feature;
//
            function onChartHover(e,d) {
                if(d === undefined || d === null) {
                    chart.clearSelection();
                    return;
                }
                //get selected value for attribute in chart marker
                var selected = d[dataset.mappings.x.field];
                query.where = dataset.mappings.x.field + " = " + "'" +selected+ "'";

                checkmarkCounts();
            }
            window.chart = chart;

            // var changed_Graphic_Chart_Layer = new GraphicsLayer({
            //     id:  "changed_graphic_layer"
            // });
            // map.addLayer(changed_Graphic_Chart_Layer);
            // var changedQuickSelectSymbol =  new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 15).setColor(new Color([175,14,105, 0.5]));
            // changedQuickSelectSymbol.setSize(10);
            // changedQuickSelectSymbol = new SimpleMarkerSymbol({
            //     "color": [204, 51, 255],
            //     "size": 12,
            //     "angle": -30,
            //     "fill-opacity":0.5,
            //     "xoffset": 0,
            //     "yoffset": 0,
            //     "type": "esriSMS",
            //     "style": "esriSMSCircle",
            //
            //     "outline": {
            //         "color": [153, 0, 204, 255],
            //         "width": 1,
            //         "type": "esriSLS",
            //         "style": "esriSLSSolid"
            //     }
            // });

            var datelist_query_Task = new QueryTask('https://solutions.puretechltd.com/wwsarcgis/rest/services/Tempe/TempeQuery/FeatureServer/5');
            var datevisitedfield="VISIT_DATE_WEB";
            // var datevisited= testval.attributes[datevisitedfield];
            //  var datevisitedformate = datevisited.toISOString().substr(0,10);
            var today=new Date();
            var myDateTime = today.toISOString().substr(0,10);
            var query_val = new esri.tasks.Query();
            query_val.returnGeometry = true;
            query_val.where = "VISIT_DATE_WEB < date '"+myDateTime+"'";
            // query_val.where = "1=1";
            query_val.outFields = ["*"];
            datelist_query_Task.execute(query_val, displayResults);

            function displayResults(result) {

                var feature =  result.features;
                for(var i = 0 ;  i < feature.length ; i ++) {
                    var featur = feature[i];
                    datesarray.push(featur.attributes[datevisitedfield]);

                    // var changedgraphic = feature[i];
                    // changedgraphic.setSymbol(changedQuickSelectSymbol);
                    // // map.graphics.add(graphic);
                    // changed_Graphic_Chart_Layer.add(changedgraphic);
                }
                // unique values from array
                var unique;
                var dateformatarray = [];

                unique = datesarray.filter(function(item, j, ar){ return ar.indexOf(item) === j; });

                for(var j = 0 ;  j < unique.length ; j ++){
                    dateformatarray.push(timeConverter(unique[j]));
                }
                // dropdown values
                for(var k = 0 ;  k < unique.length ; k ++){
                    $("#selectelementid").append('<option value="' + unique[k] + '" where="'+ unique[k] + '" >' + dateformatarray[k] + '</option>');
                }
            }
            // });
            // onchange event

            on(dom.byId("selectelementid"), "change", executeQuerychartupdate);

            // function executeQuerychartupdate(d){
            //     var vistdate ="VISIT_DATE_WEB";
            //     var selecteddate = dom.byId("selectelementid").value;
            //     dataset.query.where=""+vistdate+"  = date '"+selecteddate+"'";
            //     chart.update();
            //     alert(selecteddate);
            // }
            // function newgraphics(Set){
            //     map.graphics.clear();
            //     var newresultFeatures = Set.features;
            //     for (var i = 0,
            //              il = newresultFeatures.length; i < il; i++) {
            //         var newgraphic = newresultFeatures[i];
            //         newgraphic.setSymbol(changedQuickSelectSymbol);
            //         // map.graphics.add(graphic);
            //         changed_Graphic_Chart_Layer.add(newgraphic);
            //     }
            // }
            function executeQuerychartupdate(evt){
                var today=new Date();
                // var myDateTime = today.toISOString().substr(0,10);
                var myDateTime = today.valueOf();
                var selecteddate = dom.byId("selectelementid").value;
                var bar_chart =new Cedar({
                    "type": "bar"
                });
                //create the dataset w/ mappings
                var changeddataset = {
                    "url":"https://solutions.puretechltd.com/wwsarcgis/rest/services/Tempe/TempeQuery/FeatureServer/5",

                    "query": {
                        "groupByFieldsForStatistics": "WWS_LAST_PT_EDITOR, VISIT_DATE_WEB",
                        "outStatistics": [{
                            "statisticType": "count",
                            "onStatisticField": "OBJECTID",
                            "outStatisticFieldName": "OBJECTID"
                        }]
                    },
                    "mappings":{
                        "sort": "OBJECTID DESC",
                        "x": {"field":"WWS_LAST_PT_EDITOR","label":"NEW User Initials"},
                        "y": {"field":"OBJECTID","label":"NEW COUNT"}
                    }
                };

                bar_chart.tooltip = {
                    "title": "{WWS_LAST_PT_EDITOR}",
                    "content": "{VISIT_DATE_WEB}"
                };

                bar_chart.override = {
                    "height": 180,
                    "width": 40,
                    "marks": [{"properties": {
                        "hover": {"fill": {"value": "#00e5da"},"stroke":{"value":"white"}},
                        "update": {"fill": {"value": "#065955"},"stroke":{"value":"white"}}
                    }
                    }]
                };

                //assign to the chart
                bar_chart.dataset = changeddataset;

                //show the chart
                bar_chart.show({
                    elementId: "#chart",
                    renderer: "svg",
                    autolabels: true
                }, function(err, data) {
                    if (err) { console.log(err); }
                });
//                 //CHART EVENTS
                bar_chart.on('mouseover', newonChartHover);
                bar_chart.on('mouseout', function(evt) {
                    // map.graphics.clear();
                    Graphic_Chart_Layer.clear();
                });

//                 var feature;

                function newonChartHover(e,d) {
                    if(d === undefined || d === null) {
                        bar_chart.clearSelection();
                        return;
                    }
//                     //get selected value for attribute in chart marker
                    var newselected = d[changeddataset.mappings.x.field];
                    query.where = changeddataset.mappings.x.field + " = " + "'" +newselected+ "'";
//
                    checkmarkCounts();
                }
//                 window.chart = bar_chart;

            }
            function timeConverter(UNIX_timestamp) {
                var a = new Date(UNIX_timestamp);
                var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
                var year = a.getFullYear();
                var month = months[a.getMonth()];
                var day = a.getDate();
                var hour = a.getHours();
                var min = a.getMinutes();
                var sec = a.getSeconds();
                var time = month + '/' + day + '/' + year;// + ' ' + hour + ':' + min + ':' + sec;
                return time;
            }
        }
        return{
            cedarscript:function(){
                cedarscript();
            }
        };
    });