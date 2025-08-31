
import { NextResponse } from 'next/server';
import { mockCustomerSummaries } from '@/lib/customer-data';
import type { CustomerSummary } from '@/lib/types';

/**
 * API route handler for GET requests to fetch sandbox customer summary data.
 * This simulates fetching a lightweight list of customers for performance.
 * For the sandbox, we return all summaries at once, and the frontend service will paginate.
 * 
 * @returns A Next.js response object containing the customer summary data in JSON format.
 */
export async function GET() {
  return NextResponse.json(mockCustomerSummaries);
}
