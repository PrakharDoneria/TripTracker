
'use client'

import { useState } from 'react';
import { AsyncPaginate, type AsyncPaginateProps } from 'react-select-async-paginate';
import type { GroupBase } from 'react-select';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

export interface Place {
  label: string;
  value: string;
  lat: number;
  lon: number;
}
interface PlaceSearchProps extends Omit<AsyncPaginateProps<Place, GroupBase<Place>, any, true>, 'loadOptions'> {
  onPlaceSelect: (place: Place | null) => void;
  placeholder?: string;
  instanceId?: string;
  defaultValue?: Place | null;
  value?: Place | null;
}

export default function PlaceSearch({ onPlaceSelect, placeholder, instanceId, defaultValue, value: controlledValue }: PlaceSearchProps) {
  const [value, setValue] = useState<Place | null>(defaultValue || null);
  
  const currentVal = controlledValue !== undefined ? controlledValue : value;

  const loadOptions = async (search: string, prevOptions: Place[], additional: { page: number }) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        console.error("Geoapify API key is not set.");
        return {
          options: [],
          hasMore: false,
          additional: {
            page: 1,
          },
        }
      }
      
      const page = additional?.page || 1;
      const skip = (page - 1) * 5;

      const response = await fetch(`${GEOAPIFY_URL}?text=${search}&apiKey=${GEOAPIFY_API_KEY}&limit=5&skip=${skip}`);
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
        },
      };
    } catch (error) {
      console.error(error);
      return {
        options: [],
        hasMore: false,
        additional: {
          page: 1,
        },
      };
    }
  };

  const handleChange = (selectedOption: any) => {
    setValue(selectedOption);
    onPlaceSelect(selectedOption);
  }

  return (
    <AsyncPaginate
      value={currentVal}
      loadOptions={loadOptions}
      onChange={handleChange}
      instanceId={instanceId}
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
