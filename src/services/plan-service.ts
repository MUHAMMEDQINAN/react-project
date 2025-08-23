import type { AppMode } from "@/hooks/use-app-mode";
import type { ControlPlan } from "@/lib/types";

const PROD_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UNAVAILABLE_MESSAGE = "Control Plan API not available or not responding";

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

export async function getControlPlans(mode: AppMode): Promise<ControlPlan[]> {
    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        return await fetchData(`${PROD_API_BASE_URL}/control-plans`);
    }
    // Fallback to empty array for sandbox if no mock endpoint exists
    return Promise.resolve([]);
}

export async function saveControlPlan(plan: ControlPlan, mode: AppMode): Promise<ControlPlan> {
    const isNew = !plan.id;
    const url = isNew ? `${PROD_API_BASE_URL}/control-plans` : `${PROD_API_BASE_URL}/control-plans/${plan.id}`;
    const method = isNew ? 'POST' : 'PUT';

    if (mode === 'production') {
        if (!PROD_API_BASE_URL) throw new Error(API_UNAVAILABLE_MESSAGE);
        return await fetchData(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plan),
        });
    }
    console.log(`Sandbox: ${method} plan`, plan);
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
