
import type { AppMode } from "@/hooks/use-app-mode";
import type { GridAsset, Alert } from "@/lib/types";

// The base URL for your production API, configured in your environment variables.
const PROD_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UNAVAILABLE_MESSAGE = "API not available or API not responding";


/**
 * A helper function to safely fetch data from an API endpoint.
 * It includes error handling for network issues and non-successful responses.
 * @param url The URL to fetch data from.
 * @returns The JSON response from the API.
 * @throws An error if the fetch operation fails.
 */
async function fetchData(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        // Throw a more user-friendly error for the UI to catch
        throw new Error(API_UNAVAILABLE_MESSAGE);
    }
}

/**
 * Fetches the grid assets.
 * 
 * In 'production' mode, it attempts to fetch from the live backend API.
 * If the API URL is not configured or the fetch fails, it throws an error.
 * 
 * In 'sandbox' mode, it directly fetches from the local sandbox API.
 * 
 * @param mode The current application mode ('sandbox' or 'production').
 * @returns A promise that resolves to an array of GridAsset objects.
 */
export async function getGridAssets(mode: AppMode): Promise<GridAsset[]> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) {
            console.error("Production API URL is not configured.");
            throw new Error(API_UNAVAILABLE_MESSAGE);
        }
        // Attempt to fetch from the production API.
        const data = await fetchData(`${PROD_API_BASE_URL}/assets`);
        return data.assets;
    }
    
    // Default to sandbox mode.
    return await fetchData('/api/sandbox/assets');
}

/**
 * Fetches the alerts.
 * 
 * This function follows the same logic as getGridAssets, switching between
 * production and sandbox data sources based on the app mode.
 * 
 * @param mode The current application mode ('sandbox' or 'production').
 * @returns A promise that resolves to an array of Alert objects.
 */
export async function getAlerts(mode: AppMode): Promise<Alert[]> {
     if (mode === 'production') {
        if (!PROD_API_BASE_URL) {
            console.error("Production API URL is not configured.");
            throw new Error(API_UNAVAILABLE_MESSAGE);
        }
        // Attempt to fetch from the production API.
        const data = await fetchData(`${PROD_API_BASE_URL}/alerts`);
        return data.alerts;
    }
    
    // Default to sandbox mode.
    return await fetchData('/api/sandbox/alerts');
}
