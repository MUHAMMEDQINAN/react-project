
import { NextResponse } from 'next/server';
import { mockDetailedCustomers } from '@/lib/customer-data';

/**
 * API route handler for GET requests to fetch a single detailed customer by ID.
 * This simulates fetching full details for a specific customer on demand.
 * 
 * @param request The incoming Next.js request object.
 * @param params An object containing the dynamic route parameters, e.g., { id: '...' }.
 * @returns A Next.js response object containing the customer data in JSON format or a 404 error.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const customer = mockDetailedCustomers.find(c => c.icp.id === id);

  if (customer) {
    return NextResponse.json(customer);
  } else {
    return new NextResponse(
      JSON.stringify({ message: `Customer with ID ${id} not found.` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}
