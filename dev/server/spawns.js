const config = require('./config');

class Spawns
{
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
    return [this.getRandomNumberInRange(config.lngLatGameRange.lngFrom, config.lngLatGameRange.lngTo, 6), this.getRandomNumberInRange(config.lngLatGameRange.latFrom, config.lngLatGameRange.latTo, 6)];
  }

  /**
   * @param lngLat
   * @param callback
   * @return {*}
   */
  getResponse(lngLat, callback)
  {
    this.collection.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: lngLat },
          distanceField: 'metersDifference',
          maxDistance: 250,
          query: {
            time: { $gt: Date.now() }
          },
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
    catchCollection.insertOne({ spawnId: spawnId, userId: userId }, (error, result) => callback(result));
  }

  /**
   * @param userId
   * @param callback
   */
  getCatches(userId, callback)
  {
    const catchCollection = this.db.collection('catches');
    catchCollection.find({ userId: userId }).toArray((error, docs) => callback(docs));
  }

  /**
   * @param callback
   * @return void
   */
  async fillDatabase(callback)
  {
    let currentTotalItems = await this.collection.countDocuments();
    console.log(`Current DB: ${currentTotalItems}`);
    if (currentTotalItems >= this.totalActiveSpawns) {
      return;
    }
    let newSpawns = this.totalActiveSpawns - currentTotalItems;

    let items = [];
    for (let i = 0; i < newSpawns; i++) {
      let isSpecial = this.getRandomNumberInRange(1, 512, 0);
      items.push({
        loc: { type: 'Point', coordinates: this.getRandomLngLat() },
        time: Date.now() + (this.getRandomNumberInRange(15, 30, 0) * 30000),
        value: this.getRandomNumberInRange(1, 10, 0),
        special: (isSpecial === 1),
        number: this.getRandomNumberInRange(1, 721, 0)
      });
    }

    if (items.length > 0) {
      await this.collection.insertMany(items, (error, result) => callback(result));
    }
  }

  /**
   * @param callback
   */
  deleteTimeBasedSpawns(callback)
  {
    this.collection.find({ time: { $lt: Date.now() } }).toArray(async (error, docs) => {
      //First get all the ID's, because the client need them
      let ids = docs.map((doc) => {
        return doc._id;
      });

      this.collection.deleteMany({
        _id: { $in: ids }
      }, (error, result) => console.log(`Deleted: ${result.deletedCount}`));
      callback(ids);
    });
  }
}

module.exports = Spawns;
