import mapboxgl from "mapbox-gl/dist/mapbox-gl";
import MapboxUtils from "../helpers/mapboxutils";
import MapBox from "../maps/mapbox";
import storage from "../helpers/storage";

export default class SpawnObject {
    public spawn: any;
    private marker: mapboxgl.Marker;
    private active: boolean = false;

    constructor(spawn: any) {
        this.spawn = spawn;
    }

    /**
     * @param focusLocation
     * @return boolean
     */
    public update(focusLocation: [number, number]): boolean {
        let meterDifference = MapboxUtils.getLatLngDistanceInMeters(this.spawn.loc.coordinates, focusLocation);

        if (this.active && meterDifference > 100) {
            this.marker.remove();
            this.active = false;
            return false;
        } else if (!this.active && meterDifference <= 100) {
            this.createMarker();
        }
        return true;
    }

    private createMarker(): void {
        let $el = document.createElement('div');
        $el.classList.add('marker', `marker-pokemon-${this.spawn.number}`);
        $el.addEventListener('click', () => {
            fetch('/api/spawns/catch', {
                method: 'POST',
                body: JSON.stringify({ spawnId: this.spawn._id, userId: 1 }),
                headers: {
                  'Content-Type': 'application/json'
                }
              }).then(res => res.json())
              .then(() => {
                storage.addSpawn(this.spawn);
                const bag = storage.find('bag');
                console.log(bag.length, bag);
              })
              .catch(error => console.error('Error:', error));
        });
        this.active = true;
        this.marker = new mapboxgl.Marker($el)
            .setLngLat(this.spawn.loc.coordinates)
            .addTo(MapBox.i().map);
    }

    public removeMarker(): void {
        this.marker.remove();
    }
}
