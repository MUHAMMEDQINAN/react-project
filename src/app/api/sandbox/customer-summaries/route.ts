
import { NextResponse } from 'next/server';
import { mockDetailedCustomers } from '@/lib/customer-data';
import type { CustomerSummary } from '@/lib/types';

/**
 * API route handler for GET requests to fetch sandbox customer summary data.
 * This simulates fetching a lightweight list of customers for performance.
 * 
 * @returns A Next.js response object containing the customer summary data in JSON format.
 */
export async function GET() {
  const summaries: CustomerSummary[] = mockDetailedCustomers.map(customer => ({
    id: customer.icp.id,
    name: customer.icp.name,
    hasSchedule: !!customer.schedule,
  }));
  return NextResponse.json(summaries);
}
