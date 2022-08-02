class Users
{
  constructor(db)
  {
    this.db = db;
    this.collection = db.collection('users');
  }

  /**
   * @param token
   * @param tokenSecret
   * @param profile
   * @param done
   */
  findOrCreate(token, tokenSecret, profile, done)
  {
    this.collection.findOneAndUpdate(
      { twitterId: profile.id },
      { $set: { twitterId: profile.id, name: profile.username } },
      { upsert: true },
      (err, user) => {
        if (err) {
          return done(err);
        }
        done(null, user);
      });
  }
}

module.exports = Users;
