import { mockICPData } from "@/lib/mock-data-user";
import { RegistrationFormData } from "@/lib/validation";
import { NextResponse } from "next/server";

// mock users for sandbox
const validUsers = mockICPData;

export async function POST(req: Request) {
  const { data, mode } = await req.json();

  if (mode === "sandbox") {
    // // Validate ICP ID against mock data
    const icpRecord = mockICPData.find((record) => record.icpId === data.icpId);

    if (!icpRecord) {
      return NextResponse.json(
        { error: "User Not Found in Record" },
        { status: 400 }
      );
    }

    // Check if address details match
    const addressMatches =
      icpRecord.streetAddress.toLowerCase() ===
        data.streetAddress.toLowerCase() &&
      icpRecord.town.toLowerCase() === data.town.toLowerCase() &&
      icpRecord.region.toLowerCase() === data.region.toLowerCase();

    if (!addressMatches) {
      return NextResponse.json(
        { error: "Address does not match" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Validation Success",
      user: {
        icpId: data.icpId,
        region: data.region,
        streetAddress: data.streetAddress,
        town: data.town,
      },
    });
  }

  // ✅ Production: forward request to real API
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Production API failed", details: err.message },
      { status: 500 }
    );
  }
}
