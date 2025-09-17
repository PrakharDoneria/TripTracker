export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface Destination extends GeoLocation {
    name: string;
    isNicePlace?: boolean;
    isBusiness?: boolean;
    contactNumber?: string;
    website?: string;
    isCustomPlace?: boolean;
    description?: string;
}
