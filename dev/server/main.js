const config = require("./config");
const express = require('express');
const path = require('path');
const Spawns = require('./spawns');
const MongoClient = require('mongodb').MongoClient;
const url = config.mongodb.connectionString; //https://stackoverflow.com/a/37374366
const dbName = config.mongodb.dbName;
const app = express();

MongoClient.connect(url,{useNewUrlParser: true}, function(error, client) {
    if (error !== null) {
        console.log(error);
        return;
    }
    const db = client.db(dbName);

    app.use('/', express.static(path.join(__dirname, '../../docs/')));
    app.get('/api/generate/spawns', (req, res) => Spawns.fillDatabase(db, () => res.send('ok')));
    app.get('/api/spawns', (req, res) => {
        let lng = req.query.lng;
        let lat = req.query.lat;

        if (lng && lat) {
            const spawns = new Spawns();
            spawns.getResponse([parseFloat(lng), parseFloat(lat)], db, (docs) => {
                res.json(docs);
            });
        } else {
            res.statusCode = 401;
            res.json({"error": "No lat/lng given in URL"});
        }
    });
});

app.listen(config.ports.web, '0.0.0.0', () => console.log(`App listening on port ${config.ports.web}!`));
