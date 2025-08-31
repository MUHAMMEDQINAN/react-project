import { Participant, Role } from "./rbac";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    participant: string;
    role: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log("Frontend: Sending login request to", `${API_BASE_URL}/auth/login`);
  console.log("Frontend: Request body (email only, password omitted for security):", { email });

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const responseData = await response.json();
  console.log("Frontend: Received response status:", response.status);
  console.log("Frontend: Received response data:", responseData);

  if (!response.ok) {
    throw new Error(responseData.message || "Login failed");
  }

  return responseData.data;
}

export function logout(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("userParticipant");
  sessionStorage.removeItem("userRole");
}

export function getToken(): string | null {
  return sessionStorage.getItem("access_token");
}

export function saveAuthData(token: string, user: { id: string; userName: string; firstName: string; lastName: string; participant: string; role: string }): void {
  sessionStorage.setItem("access_token", token);
  // You might want to store more user details or roles here if needed for frontend logic
  sessionStorage.setItem("userParticipant", user.participant); // Example: storing participant
  sessionStorage.setItem("userRole", user.role); // Example: default role
}

export function getAuthData(): { token: string | null; participant: Participant | null; role: Role | null } {
  console.log("getAuthData: Reading from sessionStorage");
  const token = sessionStorage.getItem("access_token");
  const participant = sessionStorage.getItem("userParticipant") as Participant | null;
  const role = sessionStorage.getItem("userRole") as Role | null;
  console.log("getAuthData: Found token:", !!token);
  return { token, participant, role };
}
