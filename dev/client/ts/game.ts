import MapBox from "./maps/mapbox";
import SpawnFactory from "./subjects/spawnfactory";
import GUI from "./gui/gui";
import Storage from "./helpers/storage";
import uuidv4 from 'uuid/v4';

export default class Game {
    constructor() {
        this.registerUser();
        MapBox.i();
        new SpawnFactory();
        new GUI();
        this.gameLoop();
    }

    private registerUser():void{
        // Insert a new userId (without override)
        Storage.insert('userId', uuidv4());
        // Insert an empty bag (without override)
        Storage.insert('bag', []);
        // Show user connected info log
        console.info(`User connected with id: ${Storage.find('userId')}`, Storage.find('bag'));
    }

    private gameLoop(): void {
        window.requestAnimationFrame(() => this.gameLoop());
    }
}
