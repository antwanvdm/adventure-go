const config = require('./config');
const cron = require('node-cron');
const express = require('express');
const Spawns = require('./spawns');
const MongoClient = require('mongodb').MongoClient;
const url = config.mongodb.connectionString; //https://stackoverflow.com/a/37374366
const dbName = config.mongodb.dbName;
const app = express();

MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (typeof error !== "undefined") {
        console.log(error);
        return;
    }
    const db = client.db(dbName);
    const spawns = new Spawns(db);

    cron.schedule('* * * * *', async () => {
        await spawns.deleteTimeBasedSpawns((result) => {
            if (typeof result !== "undefined" && typeof result.deletedCount !== 'undefined') {
                console.log(`Deleted: ${result.deletedCount}`);
            }
        });
        await spawns.fillDatabase((result) => {
            if (typeof result.insertedCount !== 'undefined') {
                console.log(`Inserted: ${result.insertedCount}`);
            }
        });
    });
});

app.listen(config.ports.cli, () => console.log(`Cron listening on port ${config.ports.cli}!`));
