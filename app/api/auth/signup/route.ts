import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, password, role } = body;

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  // TODO: Implement actual signup logic (e.g., database insert, hash password)
  return NextResponse.json({
    message: "Signup successful",
    token: "placeholder-token",
    user: {
      id: "user_1",
      firstName,
      lastName,
      email,
      role: role || "buyer",
    },
  });
}
