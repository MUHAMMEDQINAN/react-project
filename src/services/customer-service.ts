
import type { AppMode } from "@/hooks/use-app-mode";
import type { DetailedCustomer, CustomerSummary, DerSchedule } from "@/lib/types";

const PROD_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UNAVAILABLE_MESSAGE = "Customer API not available or API not responding";

async function fetchData(url: string, options?: RequestInit) {
    try {
        const response = await fetch(url, options);
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

export async function getCustomerSummaries(mode: AppMode): Promise<CustomerSummary[]> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        return await fetchData(`${PROD_API_BASE_URL}/icps/summaries`);
    }
    return await fetchData('/api/sandbox/customer-summaries');
}

export async function getCustomerDetails(id: string, mode: AppMode): Promise<DetailedCustomer> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        return await fetchData(`${PROD_API_BASE_URL}/icps/${id}`);
    }
    return await fetchData(`/api/sandbox/customers/${id}`);
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
            headers: { 'Content-Type': 'application/json' },
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
