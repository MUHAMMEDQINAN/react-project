
import { NextResponse } from 'next/server';
import { mockDetailedCustomers } from '@/lib/customer-data';

/**
 * API route handler for GET requests to fetch sandbox customer (ICP) data.
 * This simulates a real API endpoint by serving mock customer data.
 * 
 * @returns A Next.js response object containing the customer data in JSON format.
 */
export async function GET() {
  // In a real scenario, you might have more complex logic here,
  // but for the sandbox, we just return the predefined mock data.
  return NextResponse.json(mockDetailedCustomers);
}
