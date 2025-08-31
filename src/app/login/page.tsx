"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Participant, Role } from "@/lib/rbac";
import { ModeSwitcher } from "@/components/mode-switcher";
import { useAppMode } from "@/hooks/use-app-mode";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hashed_password: string; // plain text for mock
  participant: Participant;
  role: Role;
  isActive: boolean;
};

const validUsers: User[] = [
    { id: "1", firstName: "Admin", lastName: "User", email: "admin@edb.com", hashed_password: "admin", participant: "EDB", role: "admin", isActive: true },
    { id: "2", firstName: "Controller", lastName: "User", email: "controller@edb.com", hashed_password: "admin", participant: "EDB", role: "controller", isActive: true },
    { id: "3", firstName: "Viewer", lastName: "User", email: "viewer@edb.com", hashed_password: "admin", participant: "EDB", role: "viewer", isActive: true },
    { id: "4", firstName: "Admin", lastName: "User", email: "admin@ng.com", hashed_password: "admin", participant: "National Grid", role: "admin", isActive: true },
    { id: "5", firstName: "Controller", lastName: "User", email: "controller@ng.com", hashed_password: "admin", participant: "National Grid", role: "controller", isActive: true },
    { id: "6", firstName: "Admin", lastName: "User", email: "admin@retailer.com", hashed_password: "admin", participant: "Retailer", role: "admin", isActive: true },
    { id: "7", firstName: "Admin", lastName: "User", email: "admin@ea.com", hashed_password: "admin", participant: "Electricity Authority", role: "admin", isActive: true },
    { id: "8", firstName: "Admin", lastName: "User", email: "admin@comcom.com", hashed_password: "admin", participant: "Admin", role: "admin", isActive: true },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, sandboxLogin } = useAuth();
  const router = useRouter();
  const { mode } = useAppMode();

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'production') {
      try {
        const success = await login(email, password);
        if (success) {
          router.push("/");
        } else {
          setError("Invalid credentials. Please try again.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    } else {
      // Sandbox mode logic
      const user = validUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.hashed_password === password
      );

      if (user && user.isActive) {
        sandboxLogin(user.participant, user.role);
        router.push("/");
      } else {
        setError("Invalid email, password, or inactive user.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <ModeSwitcher />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@edb.com"
                required
                                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}