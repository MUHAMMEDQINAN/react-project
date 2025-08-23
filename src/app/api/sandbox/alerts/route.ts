
import { NextResponse } from 'next/server';
import { assetScenarios, alertScenarios } from '@/lib/data';

/**
 * API route handler for GET requests to fetch sandbox alert data.
 * This simulates a real API endpoint by serving mock alert data.
 * 
 * @returns A Next.js response object containing the alert data in JSON format.
 */
export async function GET() {
  // To keep data consistent, we'll use the same random scenario index
  // as the assets endpoint would, although in a stateless environment,
  // this won't be perfectly in sync. For a true sandbox, this is acceptable.
  const scenarioIndex = Math.floor(Math.random() * assetScenarios.length);
  const alerts = alertScenarios[scenarioIndex];

  return NextResponse.json(alerts);
}
