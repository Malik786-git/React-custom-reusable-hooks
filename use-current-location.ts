import { useState, useEffect } from 'react';

interface Location {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
    ready: boolean;
}

export default function useCurrentLocation() {
    const [location, setLocation] = useState<Location>({ lat: 33.6993393, lng: 73.0356431, ready: false });
    const [error, setError] = useState<string | null>(null);

    async function findAddressFromLatLon(lat: number, lng: number) {
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${Constants.MAPBOX_TOKEN}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            const resp = await response.json();
            const { city, country } = buildAddressInfo(resp);
            setLocation({
                lat: lat ?? location.lat,
                lng: lng ?? location.lng,
                city,
                country,
                ready: true
            });
        } catch (err) {
            setError('Failed to fetch address');
        }
    }

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocation({
                lat: location.lat,
                lng: location.lng,
                ready: true
            });
            return;
        }

        const success = (position: GeolocationPosition) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            findAddressFromLatLon(latitude, longitude);
        };

        const error = (err: GeolocationPositionError) => {
            if (err.PERMISSION_DENIED) {
                setLocation({
                    lat: location.lat,
                    lng: location.lng,
                    ready: true
                });
            }
            setError(err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error);
    }, []);

    return { ...location, error };
};



export function buildAddressInfo(mapboxResponse: any) {
    const features = mapboxResponse.features as any[];
    const country_obj = features.find(feat => {
        return feat.place_type.includes("country");
    });
    const region_obj = features.find(feat => {
        return feat.place_type.includes("region");
    });
    const place_obj = features.find(feat => {
        return feat.place_type.includes("place");
    });
    const localtiy_obj = features.find(feat => {
        return feat.place_type.includes("locality");
    });
    let line1 = "";
    let address_obj = features.find(feat => {
        return feat.place_type.includes("poi");
    });

    if (!!address_obj?.place_name) {

        line1 = address_obj?.place_name;
    }
    else {
        address_obj = features.find(feat => {
            return feat.place_type.includes("address");
        });

        if (!!address_obj?.address) {

            line1 = address_obj?.address + " " + address_obj?.text
        }
        else {
            if (!!localtiy_obj?.text) {
                line1 = localtiy_obj.text;
            }
        }
    }

    // console.log(features);

    const branchAddress: IMapAddress = {
        address_line1: line1,
        address_line2: country_obj?.text ?? "",
        city: place_obj?.text ?? region_obj?.text ?? "",
        town: localtiy_obj?.text ?? "",
        country: country_obj?.text ?? "",
    }
    // console.log({ branchAddress })
    return branchAddress;

}


export type IMapAddress = {
    address_id?: number;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postcode?: string;
    town?: string;
    country?: string;
}