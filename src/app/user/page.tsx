"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DERResourcePage from "./der-resources/der-resources";
import { DashboardHeader } from "@/components/dashboard-header";

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    registration: any;
    auth: any;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/user/login");
      return;
    }

    // Load user data
    const registrationData = localStorage.getItem("registrationData");
    const authData = localStorage.getItem("authData");

    if (registrationData && authData) {
      setUserData({
        registration: JSON.parse(registrationData),
        auth: JSON.parse(authData),
      });
    }
  }, [router]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <DashboardHeader />
      <DERResourcePage />
    </div>
  );
}
