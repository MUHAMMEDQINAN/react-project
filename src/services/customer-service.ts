import type { AppMode } from "@/hooks/use-app-mode";
import type { DetailedCustomer, CustomerSummary, DerSchedule } from "@/lib/types";
import { getToken } from "@/lib/auth";

const PROD_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UNAVAILABLE_MESSAGE = "Customer API not available or API not responding";

async function fetchData(url: string, options?: RequestInit) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };
    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API call failed with status: ${response.status}`, errorBody);
            throw new Error(`API call failed: ${response.statusText}`);
        }
        if (response.status === 204) { // No Content
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        throw new Error(API_UNAVAILABLE_MESSAGE);
    }
}

export async function getCustomerSummaries(mode: AppMode, limit: number, offset: number): Promise<{summaries: CustomerSummary[], totalCount: number}> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        // The backend will use the auth token to filter ICPs by trader.
        const response = await fetchData(`${PROD_API_BASE_URL}/icps/summaries?limit=${limit}&offset=${offset}`);
        // Ensure the response structure matches what the frontend expects.
        return { summaries: response.data.summaries, totalCount: response.data.totalCount };
    }
    
    // Simulate pagination for sandbox mode
    const { mockCustomerSummaries } = await import('@/lib/customer-data');
    const paginatedSummaries = mockCustomerSummaries.slice(offset, offset + limit);
    return { summaries: paginatedSummaries, totalCount: mockCustomerSummaries.length };
}

export async function getCustomerDetails(id: string, mode: AppMode): Promise<DetailedCustomer> {
    console.log(`getCustomerDetails called with id: ${id}, mode: ${mode}`);
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) {
            console.error("getCustomerDetails: Production API URL is not configured.");
            throw new Error(API_UNAVAILABLE_MESSAGE);
        }
        try {
            console.log(`getCustomerDetails: Fetching from production API: ${PROD_API_BASE_URL}/icps/${id}`);
            const response = await fetchData(`${PROD_API_BASE_URL}/icps/${id}`);
            console.log("getCustomerDetails: Received response from production API:", response);
            return response.data;
        } catch (error) {
            console.error("getCustomerDetails: Error fetching from production API:", error);
            throw error; // Re-throw the original error
        }
    }
    
    // Sandbox mode
    console.log("getCustomerDetails: Using sandbox mode.");
    const { mockDetailedCustomers } = await import('@/lib/customer-data');
    const customer = mockDetailedCustomers.find(c => c.icp.id === id);
    if (customer) {
        console.log("getCustomerDetails: Found customer in sandbox data.");
        return Promise.resolve(customer);
    }
    console.warn("getCustomerDetails: Customer not found in sandbox data.");
    return Promise.reject(new Error("Customer not found in sandbox data."));
}

export async function saveCustomerSchedule(customerIds: string[], schedule: DerSchedule, mode: AppMode): Promise<any> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        
        const body = {
            customerIds,
            schedule: {
                derType: schedule.derType,
                from: schedule.from.toISOString(),
                to: schedule.to.toISOString(),
                cron: schedule.cron,
            }
        };

        return await fetchData(`${PROD_API_BASE_URL}/icp-schedules`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    // This is a mock for sandbox mode.
    console.log("Sandbox: Saving schedule for customers", customerIds, schedule);
    return Promise.resolve({ success: true, updatedCount: customerIds.length });
}

export async function deleteCustomerSchedule(customerId: string, derType: string, mode: AppMode): Promise<any> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        
        return await fetchData(`${PROD_API_BASE_URL}/icps/${customerId}/schedules/${derType}`, {
            method: 'DELETE',
        });
    }
    // This is a mock for sandbox mode.
    console.log("Sandbox: Deleting schedule for customer", customerId, derType);
    return Promise.resolve(null);
}
