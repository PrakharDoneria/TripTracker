export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface Destination extends GeoLocation {
    name: string;
    isNicePlace?: boolean;
}
