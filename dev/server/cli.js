const config = require("./config");
const cron = require("node-cron");
const express = require('express');
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

    cron.schedule("* * * * *", async () => {
        await spawns.deleteTimeBasedSpawns((result) => console.log(`Deleted: ${result.deletedCount}`));
        await spawns.fillDatabase((result) => console.log(`Inserted: ${result.insertedCount}`));
    });
});

app.listen(config.ports.cli, () => console.log(`Cron listening on port ${config.ports.cli}!`));
