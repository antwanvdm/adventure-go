import SpawnObject from './spawnobject';

export default class SpawnFactory {
  private spawnObjects: { [key: string]: SpawnObject } = {};

  constructor ()
  {
    window.addEventListener('ws:message:spawns', (e) => {
      let data = (e as CustomEvent).detail;
      console.log('new', data);
      this.loadNewSpawns(data);
    });
    window.addEventListener('ws:message:delete', (e) => {
      let data = (e as CustomEvent).detail;
      console.log('remove', data);
      this.removeSpawns(data);
    });
  }

  /**
   *
   * @param newSpawns
   * @private
   */
  private loadNewSpawns (newSpawns: any)
  {
    for (const newSpawn of newSpawns) {
      let spawnExists = false;
      for (const [key, currentSpawn] of Object.entries(this.spawnObjects)) {
        if (newSpawn.number === currentSpawn.spawn.number) {
          spawnExists = true;
        }
      }

      if (spawnExists === false) {
        let spawnObject = new SpawnObject(newSpawn, (id: string) => this.removeSpawn(id));
        this.spawnObjects[spawnObject.spawn._id] = spawnObject;
      }
    }
  }

  /**
   *
   * @param ids
   * @private
   */
  private removeSpawns (ids: any)
  {
    for (const id of ids) {
      for (const [key, currentSpawn] of Object.entries(this.spawnObjects)) {
        if (id === currentSpawn.spawn._id) {
          this.removeSpawn(key);
        }
      }
    }
  }

  /**
   *
   * @param id
   * @private
   */
  private removeSpawn (id: string)
  {
    this.spawnObjects[id].removeMarker();
    delete this.spawnObjects[id];
  }

  /**
   * @param lng
   * @param lat
   */
  private updateCurrentSpawns (lng: number, lat: number)
  {
    for (let i of Object.keys(this.spawnObjects)) {
      let active = this.spawnObjects[i].update([lng, lat]);
      if (!active) {
        delete this.spawnObjects[i];
      }
    }
  }
}
