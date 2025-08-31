import { NextResponse } from "next/server";

// mock users for sandbox
const validUsers = [
  {
    id: "1",
    firstName: "Qinan",
    lastName: "User",
    email: "user@edb.com",
    phone: "9999999999",
    password: "user123", // plain (sandbox only)
    participant: "EDB",
    role: "user",
    isActive: true,
  },
];

export async function POST(req: Request) {
  const body = await req.json();
  const { identifier, password, mode } = body;
  console.log("Login attempt:", { identifier, password, mode });

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Username (email/phone) and password are required" },
      { status: 400 }
    );
  }

  if (mode === "sandbox") {
    // ✅ Find user by email or phone
    const user = validUsers.find(
      (u) => u.email === identifier || u.phone === identifier
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "User inactive" }, { status: 403 });
    }

    return NextResponse.json({
      message: "Login successful (sandbox)",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        access: "sandbox-access-token",
        refresh: "sandbox-refresh-token", 
      },
    });
  }

  // ✅ Production: forward request to real API
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
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
