//operator functions
function setOperationUnion() {
    operation = "union";
    console.log(operation);
    operate(operation);
}

function setOperationIntersect() {
    operation = "intersect";
    console.log(operation);
    operate(operation);
}

function saveFile(){
    socket.emit("save geojson");
}

function operate(operation){
    try {
        commandJson = JSON.stringify({
        "polygon 1": polystack[0].feature.properties.ID,
        "polygon 2": polystack[1].feature.properties.ID,
        "operation": operation
        });
        socket.emit("update geojson", commandJson);
        polystack = [null, null];
    } catch (err) {
    window.alert("Make sure two polygons are selected!");
    }
}
//initialise map from leaflet using openmap layer
var mymap = L.map('mapid').setView([51.5027589576403, -0.12325286865234374], 15); //map object

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1Ijoia2hhcmlrMDQiLCJhIjoiY2s0eWZzOWRrMDA1dTNrcDhiaXF0M2FpciJ9.suKdlsG9GoJDefhqixzJ7Q'
}).addTo(mymap); //add tile layer to the mao object (openstreetmap layer)

var polystack = [null, null]; //can be extended to more than 2 features!
var jsoninit = false;
var operation = null;

//socket broadcasting and receiving from node.js server
var socket = io.connect();
$("form#controls").submit(function(e) {
    e.preventDefault();
        try {
            jsoncheck = JSON.parse($(this).find("#msg_text").val());
            jsoninit = true;
            socket.emit("init geojson", $(this).find("#msg_text").val(), function() {
                $("form#controls #msg_text").val("");
            });
        } catch (err) {
            window.alert("Invalid geojson file!");
        }

});
//receive message from server with updated geojson
socket.on("update geojson", function(msg) {
    myPolys = JSON.parse(msg);
    console.log(myPolys);
    //remove old layer
    var removeMarkers = function() {
        mymap.eachLayer(function(layer) {

            if (layer.myTag && layer.myTag === "myGeoJSON") {
                mymap.removeLayer(layer)
            }

        });

    }
    removeMarkers();
    //create new layer
    geoJsonObj = new L.GeoJSON(myPolys, {
        // Set default style
        'style': function() {
            return {
                'color': 'yellow',
            }
        },
        onEachFeature: function(feature, layer) {
            layer.myTag = "myGeoJSON"
        }
    }).on('click', function(e) {
        console.log(e.layer.feature.properties.ID);
        // Operations selecting the polygons 
        if (polystack[0] == null) {
            polystack[0] = e.layer;
            polystack[0].setStyle({
                'color': 'green'
            });
        } else if (polystack[1] == null) {
            polystack[1] = e.layer;
            polystack[1].setStyle({
                'color': 'green'
            });
        } else {
            e.target.resetStyle(polystack[0].layer);
            polystack[0] = polystack[1];
            polystack[1] = e.layer;
            polystack[0].setStyle({
                'color': 'green'
            });

            polystack[1].setStyle({
                'color': 'green'
            });

        }

    }).addTo(mymap);

});