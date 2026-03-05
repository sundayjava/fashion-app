/**
 * Location Service using Google Places API
 * 
 * To use this service:
 * 1. Get a Google Places API key from: https://console.cloud.google.com/
 * 2. Enable the Places API (New) in your Google Cloud Console
 * 3. Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env file
 * 
 * Free tier includes:
 * - Autocomplete: $2.83 per 1000 requests (first $200/month free)
 * - Place Details: $17 per 1000 requests
 */

import Constants from 'expo-constants';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: {
      offset: number;
      length: number;
    }[];
  };
  types: string[];
}

export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  type: string;
}

/**
 * Search for places using Google Places Autocomplete API
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured. Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env file.');
    // Return empty results if no API key
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}&types=establishment|geocode`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied. Check your API key and billing settings.');
      return [];
    }

    if (data.status === 'ZERO_RESULTS' || !data.predictions) {
      return [];
    }

    return data.predictions.map((prediction: PlacePrediction) => ({
      id: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      address: prediction.structured_formatting.secondary_text || prediction.description,
      type: getLocationType(prediction.types),
    }));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Request was cancelled, ignore
      return [];
    }
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Get user-friendly location type from Google Places types
 */
function getLocationType(types: string[]): string {
  const typeMap: Record<string, string> = {
    locality: 'City',
    administrative_area_level_1: 'State/Province',
    administrative_area_level_2: 'County',
    country: 'Country',
    neighborhood: 'Neighborhood',
    sublocality: 'District',
    route: 'Street',
    street_address: 'Address',
    establishment: 'Place',
    point_of_interest: 'Point of Interest',
    premise: 'Building',
    airport: 'Airport',
    park: 'Park',
    shopping_mall: 'Mall',
    restaurant: 'Restaurant',
    lodging: 'Hotel',
    university: 'University',
    school: 'School',
    hospital: 'Hospital',
    store: 'Store',
  };

  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  return 'Location';
}

/**
 * Get place details by place ID (optional - for more info)
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&fields=name,formatted_address,geometry,types`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place details request failed: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}
