README

File system:
-Spacemaker_poly_manipulator
--main.html #main html file (frontend)
--graphics.css #css style sheet, for now only controls the map size (frontend)
--logic.js #javascript file that controls all front end logic (frontend)
--app.js #node.js file controlling all backend logic such as computation and storage (backend)
--saved_files #folder where geojson files are saved (backend)

Dependencies:
-Node.js
#install through website download
-Polygon clipping, computational geometry library to handle polygon operations
$npm i polygon-clipping
-Socket.io, handles socket communication
$npm i socket.io


Execution:
1. cd to the project folder
2. run app.js on node using $node app.js
3. open localhost:3000 in your web browser, the map and site should load
4. paste geojson string in the text box and press "load new geojson" to load up the current file
5. use union and intersection operations by selecting 2 polygons and then clicking on the buttons
6. save the file when desired by clicking "save file"
