import MapBox from './maps/mapbox';
import SpawnFactory from './subjects/spawnfactory';
import GUI from './gui/gui';
import Storage from './helpers/storage';
import {v4 as uuidv4} from 'uuid';
import Translator from './helpers/translator';

export default class Game {
    constructor() {
        this.registerUser();
        MapBox.i();
        new SpawnFactory();
        this.registerServiceWorker();
    }

    private registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                console.log('ServiceWorker registration success: ', registration.scope);
            }, (err) => console.log('ServiceWorker registration failed: ', err));
        }
    }

    /**
     * Make a initialise compatible with chain
     * @return Game
     */
    public async initialize(): Promise<Game> {
        await Translator.i().setT();
        return this;
    }

    public start() {
        new GUI();
        this.updateTitle();
        window.addEventListener('translator:languageChange', () => this.updateTitle());
        this.gameLoop();
    }

    private updateTitle(): void {
        document.title = Translator.i().t('title');
    }

    private registerUser(): void {
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
