# ... Go!

## What is this game about?
Nothing yet, want to make it a "Go" concept based on GPS. First steps first..

## Why did I start this?
Based on the popular games from Niantic (Ingress, Pokémon Go, Wizard Unite),
this seemed the perfect excuse to try and build my own (web based) version
of this concept. Time to learn some more!

## Live demo
The current demo setup can be found [here](https://adventure-go.antwan.eu).
Try it out by walking around and experiencing spawns/de-spawns around you in
real time. (Currently working in Rotterdam - The Netherlands only)

## How to get it running?
1. Make sure latest versions of node (8.11.2) and npm (6.9.0) are installed
2. Install typescript with `npm install -g typescript`
3. Git clone this project
4. Run `npm install` in the root folder for the right tools
5. For client side dev: run `npm run client:watch` in the root folder
6. For server side dev: run `npm run server:start` (or `npm run
server:start:cron` for the cronjobs) in the root folder
7. Add the `dev/client/ts/config.json` && `dev/server/config.json` files as
these were not part of the git code.  Contents should look like the following
2 snippets for both files:
```
{
  "languages": [
    "en"
  ],
  "mapbox": {
    "accessToken": "<GET FROM MAPBOX WEBSITE>",
    "mapSettings": {
      "zoom": 8,
      "center": [
        5.12222,
        52.09083
      ],
      "container": "map",
      "style": "mapbox://styles/mapbox/streets-v11",
      "interactive": false
    }
  },
  "geoOptions": {
    "enableHighAccuracy": true,
    "maximumAge": 30000,
    "timeout": 27000
  }
}
```
```
{
  "ports": {
    "web": 3000,
    "cli": 3001
  },
  "mongodb": {
    "connectionString": "mongodb://<username>:<password>@localhost:27017/realtimemaps",
    "dbName": "realtimemaps"
  }
}

```

## Road map
* ~~Extend cronjob to actually have a logic behind adding & removing items.
The logic should prevent a database which is too heavy and refresh data for
the clients.~~
* ~~Embed Pokémon as example of the concept~~
* Think out the concept further (What will Adventure Go do?)
* Have a more variations/hierarchy in spawns
* Make it a PWA
* Refactor backend code to have logging and more separate files
* Enrich frontend with better stylingh
* Make menu work with actual result lists (catches/settings/etc)
* Have a decent login for users to use the application (SSO Google)
