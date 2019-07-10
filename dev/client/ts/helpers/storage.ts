export default class Storage {
    /**
     * @param key
     */
    static find(key: string) {
        const state = localStorage.getItem(key);
        if (state === null) return null;
        return JSON.parse(state);
    }

    /**
     * @param key
     * @param state
     * @param override
     */
    static insert(key: string, state: any, override = false) {
        if (!override && localStorage.getItem(key) !== null) return;
        localStorage.setItem(key, JSON.stringify(state));
    }

    /**
     * @param spawn
     */
    static addSpawn(spawn: any) {
        const bag = this.find('bag');
        bag.push(spawn);
        this.insert('bag', bag, true);
    }
}
