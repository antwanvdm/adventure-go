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
const fs = require('node:fs');
const eventEmitter = new EventEmitter();

//TODO: SPLIT UP: SUCH A MESS...
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
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
  app.use(bodyParser.urlencoded({extended: true}));
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
      res.json({'error': 'No spawnId/userId given in URL'});
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
      res.json({'error': 'No userId given in URL'});
    }
  });
  app.get('/api/pokemon-list/store', async (req, res) => {
    const result = await fetch('https://pokeapi.co/api/v2/pokemon?limit=721');
    const data = await result.json();

    let pokemonList = [];
    for (let pokemonData of data.results) {
      const detailResult = await fetch(pokemonData.url);
      const pokemon = await detailResult.json();
      const speciesDetailResult = await fetch(pokemon.species.url);
      const pokemonSpecies = await speciesDetailResult.json();
      pokemonList.push({
        id: pokemon.id,
        name: pokemon.name,
        images: {
          default: pokemon.sprites.other.home.front_default,
          shiny: pokemon.sprites.other.home.front_shiny,
          thumb: pokemon.sprites.front_default,
          gif: pokemon.sprites.other.showdown.front_default
        },
        types: pokemon.types,
        names: {
          'en': pokemonSpecies.names.find((specieName) => specieName.language.name === 'en').name,
          'ja-JP': pokemonSpecies.names.find((specieName) => specieName.language.name === 'ja').name,
          'ko-KR': pokemonSpecies.names.find((specieName) => specieName.language.name === 'ko').name,
          'fr-FR': pokemonSpecies.names.find((specieName) => specieName.language.name === 'fr').name,
          'es-ES': pokemonSpecies.names.find((specieName) => specieName.language.name === 'es').name,
          'de-DE': pokemonSpecies.names.find((specieName) => specieName.language.name === 'de').name,
          'it-IT': pokemonSpecies.names.find((specieName) => specieName.language.name === 'it').name,
          'zh-CN': pokemonSpecies.names.find((specieName) => specieName.language.name === 'zh-Hans').name
        }
      });
    }

    fs.writeFile('pokemon-list.json', JSON.stringify(pokemonList), (err) => {
      if (err) throw err;
      res.json(['Data saved!']);
    });
  });
  app.get('/api/pokemon-list/get', async (req, res) => {
    const pokemonList = fs.readFileSync('pokemon-list.json').toString();
    res.json(JSON.parse(pokemonList));
  });
  app.get('/api/pokemon-types/store', async (req, res) => {
    const result = await fetch('https://pokeapi.co/api/v2/type?limit=18');
    const data = await result.json();

    let types = [];
    for (let type of data.results) {
      const typeResult = await fetch(type.url);
      const typeData = await typeResult.json();

      types.push({
        id: typeData.id,
        name: type.name,
        names: {
          'en': typeData.names.find((typeName) => typeName.language.name === 'en').name,
          'ja-JP': typeData.names.find((typeName) => typeName.language.name === 'ja').name,
          'ko-KR': typeData.names.find((typeName) => typeName.language.name === 'ko').name,
          'fr-FR': typeData.names.find((typeName) => typeName.language.name === 'fr').name,
          'es-ES': typeData.names.find((typeName) => typeName.language.name === 'es').name,
          'de-DE': typeData.names.find((typeName) => typeName.language.name === 'de').name,
          'it-IT': typeData.names.find((typeName) => typeName.language.name === 'it').name,
          'zh-CN': typeData.names.find((typeName) => typeName.language.name === 'zh-Hans').name
        }
      });
    }

    fs.writeFile('pokemon-types.json', JSON.stringify(types), (err) => {
      if (err) throw err;
      res.json(['Data saved!']);
    });
  });
  app.get('/api/pokemon-types/get', async (req, res) => {
    const pokemonList = fs.readFileSync('pokemon-types.json').toString();
    res.json(JSON.parse(pokemonList));
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  //Whenever someone connects this gets executed
  const wss = new WebSocket.Server({server});
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

  function cronTask() {
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
