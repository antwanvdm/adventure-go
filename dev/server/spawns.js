class Spawns {
    constructor(db)
    {
        this.db = db;
        this.totalActiveSpawns = 10000;
        this.collection = db.collection('spawns');
    }

    /**
     * @link https://stackoverflow.com/a/6878845
     * @param from
     * @param to
     * @param fixed
     * @return number
     */
    getRandomNumberInRange(from, to, fixed)
    {
        return parseFloat((Math.random() * (to - from) + from).toFixed(fixed));
    }

    /**
     * @description Max is -180/180 lng & -90/90 lat
     * @link https://gist.github.com/graydon/11198540 (per country bounding boxes)
     * @link https://boundingbox.klokantech.com/ (custom bounding boxes, currently used Rotterdam)
     * @return number[]
     */
    getRandomLngLat()
    {
        return [this.getRandomNumberInRange(4.4236095632, 4.5393182311, 5), this.getRandomNumberInRange(51.8849963082, 51.9429216581, 5)];
    }

    /**
     * @param lngLat
     * @param db
     * @param callback
     * @return {*}
     */
    getResponse(lngLat, callback)
    {
        this.collection.aggregate([
            {
                $geoNear: {
                    near: {type: "Point", coordinates: lngLat},
                    distanceField: "metersDifference",
                    maxDistance: 100,
                    spherical: true
                }
            }
        ]).toArray((error, docs) => callback(docs));
    }

    /**
     * @param spawnId
     * @param userId
     * @param callback
     */
    catchSpawn(spawnId, userId, callback)
    {
        const catchCollection = this.db.collection('catches');
        catchCollection.insert({spawnId: spawnId, userId: userId}, (error, result) => callback(result));
    }

    /**
     * @param userId
     * @param callback
     */
    getCatches(userId, callback)
    {
        const catchCollection = this.db.collection('catches');
        catchCollection.find({userId: userId}, (error, docs) => callback(docs));
    }

    /**
     * @param callback
     */
    async fillDatabase(callback)
    {
        let currentTotalItems = await this.collection.countDocuments();
        console.log(`Current DB: ${currentTotalItems}`);
        let newSpawns = this.totalActiveSpawns - currentTotalItems;

        let items = [];
        for (let i = 0; i < newSpawns; i++) {
            items.push({
                loc: {type: "Point", coordinates: this.getRandomLngLat()},
                time: Date.now() + (this.getRandomNumberInRange(15, 30, 0) * 30000),
                value: this.getRandomNumberInRange(1, 10, 0),
                special: false,
                number: this.getRandomNumberInRange(1, 151, 0)
            });
        }

        if (items.length > 0) {
            await this.collection.insertMany(items, (error, result) => callback(result));
        }
    }

    /**
     * @param callback
     */
    async deleteTimeBasedSpawns(callback)
    {
        await this.collection.deleteMany({
            time: {$lt: Date.now()}
        }, (error, result) => callback(result));
    }
}

module.exports = Spawns;
