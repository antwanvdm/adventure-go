const config = require('./config');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const path = require('path');
const Spawns = require('./spawns');
const Users = require('./users');
const MongoClient = require('mongodb').MongoClient;
const url = config.mongodb.connectionString; //https://stackoverflow.com/a/37374366
const dbName = config.mongodb.dbName;
const app = express();
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

//TODO: SPLIT UP: SUCH A MESS...
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if (typeof error !== 'undefined') {
    console.log(error);
    return;
  }
  const db = client.db(dbName);
  const spawns = new Spawns(db);
  const users = new Users(db);

  passport.use(new TwitterStrategy({
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: config.twitter.callbackUrl
    },
    (token, tokenSecret, profile, done) => users.findOrCreate(token, tokenSecret, profile, done)
  ));

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  app.use('/', express.static(path.join(__dirname, '../../docs/')));
  app.use(session({
    secret: 'todosecret',
    resave: true,
    saveUninitialized: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.post('/api/spawns/catch', (req, res) => {
    let spawnId = req.body.spawnId;
    let userId = req.body.userId;

    if (spawnId && userId) {
      spawns.catchSpawn(req.body.spawnId, req.body.userId, (result) => {
        res.json(result);
      });
    } else {
      res.statusCode = 401;
      res.json({ 'error': 'No spawnId/userId given in URL' });
    }
  });
  app.get('/api/spawns/catches', (req, res) => {
    let userId = req.query.userId;

    if (userId) {
      spawns.getCatches(userId, (docs) => {
        res.json(docs);
      });
    } else {
      res.statusCode = 401;
      res.json({ 'error': 'No userId given in URL' });
    }
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  //Whenever someone connects this gets executed
  const wss = new WebSocket.Server({ server });
  let subscribers = {};

  wss.getUniqueID = function () {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
  };

  wss.on('connection', (ws, req) => {
    let userId = wss.getUniqueID();
    let deleteSpawnsEvent = (data) => {
      //TODO: don't send every delete, but only relevant ones
      ws.send(JSON.stringify({
        type: 'delete',
        content: data ?? []
      }));
    };
    let newSpawnsEvent = () => {
      let subscriber = subscribers[userId];
      console.log(subscriber.clientId);
      spawns.getResponse(subscriber.location, (docs) => {
        subscriber.ws.send(JSON.stringify({
          type: 'spawns',
          content: docs ?? []
        }));
      });
    };

    //connection is up, let's add a simple event
    ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (typeof data.type === 'undefined') {
        console.log('Corrupt message: %s', data);
        return;
      }

      switch (data.type) {
        case 'POSITION':
          //Check if we got the same user, if so: remove the old instance.
          const subscriber = Object.entries(subscribers).find(([id, sub]) => {
            return sub.clientId === data.id;
          });
          if (subscriber) {
            delete subscribers[subscriber[0]];
          }

          subscribers[userId] = {
            clientId: data.id,
            ws: ws,
            location: [parseFloat(data.lng), parseFloat(data.lat)]
          };
          spawns.getResponse(subscribers[userId].location, (docs) => {
            ws.send(JSON.stringify({
              type: 'spawns',
              content: docs ?? []
            }));
          });
      }

      eventEmitter.on('spawns:deleted', deleteSpawnsEvent);
      eventEmitter.on('spawns:new', newSpawnsEvent);
    });

    ws.on('close', function (req) {
      delete subscribers[userId];
      eventEmitter.off('spawns:deleted', deleteSpawnsEvent);
      eventEmitter.off('spawns:new', newSpawnsEvent);
      console.log('DISCONNECT: ' + userId);
    });
  });

  setInterval(cronTask, 20000);
  cronTask();

  function cronTask()
  {
    spawns.deleteTimeBasedSpawns((result) => {
      eventEmitter.emit('spawns:deleted', result);
    });
    spawns.fillDatabase((result) => {
      if (typeof result.insertedCount !== 'undefined') {
        console.log(`Inserted: ${result.insertedCount}`);
        eventEmitter.emit('spawns:new');
      }
    });
  }
});

server.listen(config.ports.web, '0.0.0.0', () => console.log(`App listening on port ${config.ports.web}!`));
