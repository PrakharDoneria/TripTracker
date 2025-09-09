'use client'

import { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

interface Place {
  label: string;
  value: string;
  lat: number;
  lon: number;
}
interface PlaceSearchProps {
  onPlaceSelect: (place: Place | null) => void;
  placeholder?: string;
}

export default function PlaceSearch({ onPlaceSelect, placeholder }: PlaceSearchProps) {
  const [value, setValue] = useState<Place | null>(null);

  const loadOptions = async (search: string, loadedOptions: any, { page }: any) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        console.error("Geoapify API key is not set.");
        return {
          options: [],
          hasMore: false,
        }
      }
      const response = await fetch(`${GEOAPIFY_URL}?text=${search}&apiKey=${GEOAPIFY_API_KEY}&limit=5&skip=${(page - 1) * 5}`);
      const data = await response.json();
      
      const options = Array.isArray(data.features) ? data.features.map((feature: any) => ({
        label: feature.properties.formatted,
        value: feature.properties.place_id,
        lat: feature.properties.lat,
        lon: feature.properties.lon,
      })) : [];

      return {
        options,
        hasMore: options.length > 0,
        additional: {
          page: page + 1,
        }
      };
    } catch (error) {
      console.error(error);
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: any) => {
    setValue(selectedOption);
    onPlaceSelect(selectedOption);
  }

  return (
    <AsyncPaginate
      value={value}
      loadOptions={loadOptions}
      onChange={handleChange}
      placeholder={placeholder || "Search for a place"}
      debounceTimeout={600}
      additional={{
        page: 1,
      }}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '40px',
        }),
      }}
    />
  );
}
