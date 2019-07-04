const config = require("./config");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Spawns = require('./spawns');
const MongoClient = require('mongodb').MongoClient;
const url = config.mongodb.connectionString; //https://stackoverflow.com/a/37374366
const dbName = config.mongodb.dbName;
const app = express();

MongoClient.connect(url, {useNewUrlParser: true}, function (error, client) {
    if (error !== null) {
        console.log(error);
        return;
    }
    const db = client.db(dbName);
    const spawns = new Spawns(db);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/', express.static(path.join(__dirname, '../../docs/')));
    app.get('/api/spawns', (req, res) => {
        let lng = req.query.lng;
        let lat = req.query.lat;

        if (lng && lat) {
            spawns.getResponse([parseFloat(lng), parseFloat(lat)], (docs) => {
                res.json(docs);
            });
        } else {
            res.statusCode = 401;
            res.json({"error": "No lat/lng given in URL"});
        }
    });
    app.post('/api/spawns/catch', (req, res) => {
        let spawnId = req.body.spawnId;
        let userId = req.body.userId;

        if (spawnId && userId) {
            spawns.catchSpawn(req.body.spawnId, req.body.userId, (result) => {
                res.json(result);
            });
        } else {
            res.statusCode = 401;
            res.json({"error": "No spawnId/userId given in URL"});
        }
    });
    app.get('/api/spawns/catches', (req, res) => {
        let userId = req.query.userId;
        spawns.getCatches(userId, (docs) => {
            res.json(docs);
        });
    });
});

app.listen(config.ports.web, '0.0.0.0', () => console.log(`App listening on port ${config.ports.web}!`));
