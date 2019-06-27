import mapboxgl from "mapbox-gl/dist/mapbox-gl";
import MapboxUtils from "../helpers/mapboxutils";
import MapBox from "../maps/mapbox";

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
        $el.classList.add('marker', 'marker-spawn');

        this.active = true;
        this.marker = new mapboxgl.Marker($el)
            .setLngLat(this.spawn.loc.coordinates)
            .setPopup(new mapboxgl.Popup({offset: 25})
                .setHTML('<h1>' + this.spawn._id + '</h1>'))
            .addTo(MapBox.i().map);
    }
}
