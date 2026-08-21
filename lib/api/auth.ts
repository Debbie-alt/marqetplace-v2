export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "buyer" | "seller";
};

export type AuthResponse = {
  message: string;
  token?: string;
  accessToken?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "buyer" | "seller";
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Something went wrong"
    );
  }

  return data;
}

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signup(
  payload: SignupPayload
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}