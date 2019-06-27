import MapBox from "./maps/mapbox";
import SpawnFactory from "./subjects/spawnfactory";

export default class Game {
    constructor() {
        MapBox.i();
        new SpawnFactory();
        this.gameLoop();
    }

    private gameLoop(): void {
        window.requestAnimationFrame(() => this.gameLoop());
    }
}
