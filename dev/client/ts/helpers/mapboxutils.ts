import Utils from "./utils";

export default class MapboxUtils {
    /**
     * @link https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
     * @param lngLat1
     * @param lngLat2
     */
    static getLatLngDistanceInMeters(lngLat1: [number, number], lngLat2: [number, number]) {
        let r = 6371; // Radius of the earth in km
        let dLat = deg2rad(lngLat2[1] - lngLat1[1]);  // deg2rad below
        let dLon = deg2rad(lngLat2[0] - lngLat1[0]);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lngLat1[1])) * Math.cos(deg2rad(lngLat2[1])) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c * 1000; // Distance in meters

        function deg2rad(deg: number): number {
            return deg * (Math.PI / 180);
        }
    }

    /**
     * @link https://github.com/mapbox/mapbox-gl-js/issues/4278#issuecomment-459936875
     * @param map
     * @param lnglat
     */
    static lngLatIsInMapBounds(map: mapboxgl.Map, lnglat: [number, number]) {
        const bounds = map.getBounds();
        const lng = (lnglat[0] - bounds.getNorthEast().lng) * (lnglat[0] - bounds.getSouthWest().lng) < 0;
        const lat = (lnglat[1] - bounds.getNorthEast().lat) * (lnglat[1] - bounds.getSouthWest().lat) < 0;
        return lng && lat;
    }
}
