import type { AppMode } from "@/hooks/use-app-mode";
import type { ControlPlan } from "@/lib/types";
import { getToken } from "@/lib/auth";

const PROD_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UNAVAILABLE_MESSAGE = "Control Plan API not available or not responding";

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

export async function getControlPlans(mode: AppMode): Promise<ControlPlan[]> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        return await fetchData(`${PROD_API_BASE_URL}/control-plans`);
    }
    // In sandbox mode, we assume no multi-tenancy for mock data.
    // If you need to simulate this, you'd filter mock data based on a mock user.
    // For now, returning an empty array as a safe default for sandbox.
    return Promise.resolve([]);
}

export async function saveControlPlan(plan: ControlPlan, mode: AppMode): Promise<ControlPlan> {
    const isNew = !plan.id;
    const url = isNew ? `${PROD_API_BASE_URL}/control-plans` : `${PROD_API_BASE_URL}/control-plans/${plan.id}`;
    const method = isNew ? 'POST' : 'PUT';

    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        // The backend will associate the plan with the user from the auth token.
        return await fetchData(url, {
            method: method,
            body: JSON.stringify(plan),
        });
    }
    console.log(`Sandbox: ${method} plan`, plan);
    // Mock creating an ID for sandbox mode.
    return Promise.resolve({ ...plan, id: plan.id || crypto.randomUUID() });
}

export async function deleteControlPlan(planId: string, mode: AppMode): Promise<void> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        await fetchData(`${PROD_API_BASE_URL}/control-plans/${planId}`, {
            method: 'DELETE',
        });
        return;
    }
    console.log("Sandbox: Deleting plan", planId);
    return Promise.resolve();
}
