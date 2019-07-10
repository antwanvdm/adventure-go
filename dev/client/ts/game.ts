import MapBox from "./maps/mapbox";
import SpawnFactory from "./subjects/spawnfactory";
import GUI from "./gui/gui";

export default class Game {
    constructor() {
        MapBox.i();
        new SpawnFactory();
        new GUI();
        this.gameLoop();
    }

    private gameLoop(): void {
        window.requestAnimationFrame(() => this.gameLoop());
    }
}
