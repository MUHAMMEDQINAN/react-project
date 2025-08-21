"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
      router.push("/login");
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

  const handleStartOver = () => {
    // Clear all stored data
    localStorage.removeItem("registrationData");
    localStorage.removeItem("authData");
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Registration Complete!
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Your load management account has been successfully set up.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Registration Details */}
            <div className="bg-muted rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Property Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ICP ID:</span>
                  <p className="text-muted-foreground font-mono">
                    {userData.registration.icpId}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Region:</span>
                  <p className="text-muted-foreground">
                    {userData.registration.region}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Address:</span>
                  <p className="text-muted-foreground">
                    {userData.registration.streetAddress},{" "}
                    {userData.registration.town}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-muted-foreground">{userData.auth.email}</p>
                </div>
                <div>
                  <span className="font-medium">Mobile:</span>
                  <p className="text-muted-foreground">
                    {userData.auth.mobile}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  You'll receive a confirmation email within 24 hours
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Load management equipment will be installed within 5-10
                  business days
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  You'll be notified when your system is active
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Register Another Property
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                Print Confirmation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
