"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { registrationSchema, type RegistrationFormData } from "@/lib/validation";
import { mockICPData, newZealandRegions } from "@/lib/mock-data";

export default function RegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });

  const watchedRegion = watch("region");

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setValidationResult(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validate ICP ID against mock data
    const icpRecord = mockICPData.find(record => record.icpId === data.icpId);
    
    if (!icpRecord) {
      setValidationResult({
        type: "error",
        message: "ICP ID not found. Please check your ICP ID and try again."
      });
      setIsLoading(false);
      return;
    }

    // Check if address details match
    const addressMatches = 
      icpRecord.streetAddress.toLowerCase() === data.streetAddress.toLowerCase() &&
      icpRecord.town.toLowerCase() === data.town.toLowerCase() &&
      icpRecord.region.toLowerCase() === data.region.toLowerCase();

    if (!addressMatches) {
      setValidationResult({
        type: "error",
        message: "Address details don't match our records for this ICP ID. Please verify your information."
      });
      setIsLoading(false);
      return;
    }

    // Store registration data in localStorage
    localStorage.setItem("registrationData", JSON.stringify(data));
    
    setValidationResult({
      type: "success",
      message: "Registration successful! Redirecting to authentication..."
    });

    // Redirect after success message
    setTimeout(() => {
      router.push("/auth");
    }, 1500);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Load Management</CardTitle>
          <CardDescription>
            Register your property for load management services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icpId">ICP ID *</Label>
              <Input
                id="icpId"
                {...register("icpId")}
                placeholder="e.g., ICP001234"
                className={errors.icpId ? "border-red-500" : ""}
              />
              {errors.icpId && (
                <p className="text-sm text-red-600">{errors.icpId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                {...register("streetAddress")}
                placeholder="e.g., 123 Main Street"
                className={errors.streetAddress ? "border-red-500" : ""}
              />
              {errors.streetAddress && (
                <p className="text-sm text-red-600">{errors.streetAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="town">Town *</Label>
              <Input
                id="town"
                {...register("town")}
                placeholder="e.g., Wellington"
                className={errors.town ? "border-red-500" : ""}
              />
              {errors.town && (
                <p className="text-sm text-red-600">{errors.town.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select
                value={watchedRegion || ""}
                onValueChange={(value) => setValue("region", value)}
              >
                <SelectTrigger className={errors.region ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {newZealandRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-600">{errors.region.message}</p>
              )}
            </div>

            {validationResult && (
              <Alert className={validationResult.type === "success" ? "border-green-500" : "border-destructive"}>
                <div className="flex items-center gap-2">
                  {validationResult.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <AlertDescription className={validationResult.type === "success" ? "text-green-700" : "text-destructive"}>
                    {validationResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate & Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-2">Sample ICP IDs for testing:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ICP001234 - 123 Main Street, Wellington</p>
              <p>ICP005678 - 456 Queen Street, Auckland</p>
              <p>ICP009876 - 789 George Street, Dunedin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}