
import { NextResponse } from 'next/server';
import { assetScenarios } from '@/lib/data';

/**
 * API route handler for GET requests to fetch sandbox grid asset data.
 * This simulates a real API endpoint by serving mock data.
 * 
 * @returns A Next.js response object containing the asset data in JSON format.
 */
export async function GET() {
  // In a real scenario, you might have more complex logic here,
  // but for the sandbox, we just return one of the predefined scenarios.
  // We'll randomly pick one to make the sandbox feel more dynamic.
  const scenarioIndex = Math.floor(Math.random() * assetScenarios.length);
  const assets = assetScenarios[scenarioIndex];

  return NextResponse.json(assets);
}
