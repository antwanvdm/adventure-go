import SpawnObject from './spawnobject';

export default class SpawnFactory {
  private spawnObjects: { [key: string]: SpawnObject } = {};

  constructor ()
  {
    window.addEventListener('mapbox:activeMarkerUpdate', (e) => {
      let data = (e as CustomEvent).detail;
      this.loadNewSpawns(data.lng, data.lat);
      this.updateCurrentSpawns(data.lng, data.lat);
    });
  }

  /**
   * @param lng
   * @param lat
   */
  private loadNewSpawns (lng: number, lat: number)
  {
    fetch(`/api/spawns?lng=${lng}&lat=${lat}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((spawns) => {
        const keys = Object.keys(this.spawnObjects);
        for (const key of keys) {
          this.spawnObjects[key].removeMarker();
        }
        this.spawnObjects = {};
        for (let i = 0; i < spawns.length; i++) {
          let spawnObject = new SpawnObject(spawns[i]);
          spawnObject.update([lng, lat]);
          this.spawnObjects[spawnObject.spawn._id] = spawnObject;
        }
      });
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
