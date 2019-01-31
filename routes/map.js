var express = require('express');
var router = express.Router();


const {reproject, reverse} = require("reproject");

/* PostgreSQL and PostGIS module and connection setup */
const pool = require('../db');
const config = require('../secrets/db_configuration');

const {Client, Query} = require('pg');

const TM65 = {
    'EPSG:29902': "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +a=6377340.189 +b=6356034.447938534 +units=m +no_defs",
    'ESPG:2157': "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.99982 +x_0=600000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
}; //specifying projection system (4326 is in-built so no need to specify)

//const pool = new Pool(config); //user, host, database, password, port, configuration options to find database // add in eventually

// Setup connection
var conString = "postgres://" + config.user + ":" + config.password + "@" + config.host + ":" + config.port + "/" + config.database; // Your Database Connection

// Set up your database query to display GeoJSON
var allSCsQuery = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((sc, species, age, area)) As properties FROM vwebbrowserdata As lg) As f) As fc";

/* GET Postgres JSON data */ //requests a page named data, then in the request, connects to PostgreSQL, runs a query, adds the rows in the query return to a object named result, then sends the result to the page
router.get('/data', function (req, res) {
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(allSCsQuery));

    query.on("row", function (row, result) {
        result.addRow(row);
    });

    query.on("end", function (result) {
        const data = result.rows[0].row_to_json.features.map(function (geoJSON) { // how to reference each column if requried.
            let geoJSONnew = reproject(geoJSON, "EPSG:29902", "EPSG:4326", TM65);
            return geoJSONnew;
        });

        res.send(data);
        res.end();
    });
});

/* GET the map page */
router.get('/', function (req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(allSCsQuery)); // Run Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {

        // converting from TM65 to WGS84
        const data = result.rows[0].row_to_json.features.map(function (geoJSON) {
            let geoJSONnew = reproject(geoJSON, "EPSG:29902", "EPSG:4326", TM65);
            return geoJSONnew;
        });

        res.render('map', {
            title: "FSIM", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});


/* GET the filtered page */
router.get('/filter', function (req, res) {

    console.log(req.body + req.params + req.query + req.query.name);
    const name = req.query.name;
    console.log("We're here in the fitler api and the species to filter by is " + name);
    //this if clause is designed to prevent sql injection
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1) {
        console.log("Bad request detected");
        res.redirect('/map');
        return;

    } else {
        console.log("Request passed")
        var filter_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((age, species, area)) As properties FROM vwebbrowserdata As lg WHERE lg.species = \'" + name + "\') As f) As fc";

        var client = new Client(conString);
        client.connect();

        var query = client.query(new Query(filter_query)); // Run Query

        query.on("row", function (row, result) {
            result.addRow(row);
        });


        query.on("end", function (result) {

            if (result.rows[0].row_to_json.features === null) {
                console.log("There are no species with this code " + name);
                res.redirect('/map');
                return;
            } else {

                var data = result.rows[0].row_to_json.features.map(function (geoJSON) {
                    let geoJSONnew = reproject(geoJSON, "EPSG:29902", "EPSG:4326", TM65);
                    return geoJSONnew;
                });

                res.render('map', {
                    title: "FSIM", // Give a title to our page
                    jsonData: data // Pass data to the View
                });
            };
        });
    };
});

module.exports = router;