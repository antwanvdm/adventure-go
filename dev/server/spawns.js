class Spawns {
    /**
     * @link https://stackoverflow.com/a/6878845
     * @param from
     * @param to
     * @param fixed
     * @return number
     */
    static getRandomNumberInRange(from, to, fixed)
    {
        return parseFloat((Math.random() * (to - from) + from).toFixed(fixed));
    }

    /**
     * @description Max is -180/180 lng & -90/90 lat
     * @link https://gist.github.com/graydon/11198540 (per country bounding boxes)
     * @link https://boundingbox.klokantech.com/ (custom bounding boxes, currently used Rotterdam)
     * @return number[]
     */
    static getRandomLngLat()
    {
        return [this.getRandomNumberInRange(4.4236095632, 4.5393182311, 5), this.getRandomNumberInRange(51.8849963082, 51.9429216581, 5)];
    }

    /**
     * @param lngLat
     * @param db
     * @param callback
     * @return {*}
     */
    getResponse(lngLat, db, callback)
    {
        const collection = db.collection('spawns');
        collection.aggregate([
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
     * @param db
     * @param callback
     */
    static fillDatabase(db, callback)
    {
        let items = [];
        for (let i = 0; i < 10000; i++) {
            items.push({
                loc: {type: "Point", coordinates: this.getRandomLngLat()},
                time: Date.now() + (15 * 30000)
            });
        }

        const collection = db.collection('spawns');
        collection.deleteMany({}, () => {
            collection.insertMany(items, (error, result) => callback("YEAH"));
        });
    }
}

module.exports = Spawns;
