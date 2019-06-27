declare module "*.json" {
    const value: any;
    export default value;
}

//This is only done because of a weird unresolved error...
declare module "mapbox-gl/dist/mapbox-gl" {
    export default mapboxgl;
}
