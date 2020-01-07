//Author: Khariton Gorbunov
function updateJson(commandJson, myPolys) {//updates json file by removing the old polygons and inserting the new
    var ID1 = commandJson["polygon 1"];
    var ID2 = commandJson["polygon 2"];
    var p1 = myPolys["features"][ID1]["geometry"]["coordinates"];
    var p2 = myPolys["features"][ID2]["geometry"]["coordinates"];
    var p3 = null;
    if (commandJson["operation"] == "union") {
        p3 = polygonClipping.union(p1, p2);
    } else if (commandJson["operation"] == "intersect") {
        p3 = polygonClipping.intersection(p1, p2);
    }
    if (p3[0]) {
        myPolys["features"][ID2]["geometry"]["coordinates"] = p3[0];
    } else {
        myPolys["features"].splice(ID2, 1);
        if (ID2 < ID1) {
            ID1 = ID1 - 1;
        }
    }
    myPolys["features"].splice(ID1, 1);
    myPolys = addID(myPolys);
    return (myPolys);
}

function addID(myPolys) {
    for (var i = 0; i < myPolys["features"].length; i++) {
        myPolys["features"][i]["properties"]["ID"] = i;
    }
    return (myPolys);
}

function saveGeoJsonFile(geoJSONLoc) {
    if(geoJSONLoc){
        var fs = require('fs')
        geoJSONLoc = JSON.stringify(geoJSONLoc);
        fs.writeFile("saved_files/geoJSON-" + getCurrentDate() + ".geojson", geoJSONLoc, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
}
//get current date function from the web
function getCurrentDate() {
    var currentDate = new Date();
    var day = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate();
    var month = ((currentDate.getMonth() + 1) < 10 ? '0' : '') + (currentDate.getMonth() + 1);
    var year = currentDate.getFullYear();
    var hour = (currentDate.getHours() < 10 ? '0' : '') + currentDate.getHours();
    var minute = (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes();
    var second = (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
    return year + "-" + month + "-" + day + "-" + hour + "-" + minute + "-" + second;
}


const polygonClipping = require('polygon-clipping');
var app = require('http').createServer(response);
var fs = require('fs');
var io = require('socket.io')(app);
app.listen(3000);//listen on port 3000
var myPolys;//current active json file, stored in the memory. Can be saved on disk using saveGeoJson function
console.log("Server running...");

//access all files through localhost
function response(req, res) {
    var file = "";
    if (req.url == "/") {
        file = __dirname + '/main.html';
    } else {
        file = __dirname + req.url;
    }
    fs.readFile(file, function(err, data) {
        if (err) {
            res.writeHead(404);
            return res.end('Page or file not found');
        }
        res.writeHead(200);

        res.end(data);
    });
}
io.on("connection", function(socket) {
    socket.on("init geojson", function(sent_msg, callback) {//receive message to initialise geojson
        //sent_msg = "[ " + getCurrentDate() + " ]: " + sent_msg;
        myPolys = JSON.parse(sent_msg);
        myPolys = addID(myPolys);
        myPolysJson = JSON.stringify(myPolys);
        io.sockets.emit("update geojson", myPolysJson);
        callback();
    });
    socket.on("update geojson", function(sent_msg) {
        commandJson = JSON.parse(sent_msg);
        myPolys = updateJson(commandJson, myPolys);
        myPolysJson = JSON.stringify(myPolys);
        io.sockets.emit("update geojson", myPolysJson);
    });
    socket.on("save geojson", function(sent_msg) {
        saveGeoJsonFile(myPolys);
    });
});