"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  authenticationSchema,
  otpSchema,
  type AuthenticationFormData,
  type OTPFormData,
} from "@/lib/validation";
import { MOCK_OTP } from "@/lib/mock-data";

type AuthStep = "credentials" | "otp";

export default function CreateAccount() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<AuthStep>("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authResult, setAuthResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register: registerAuth,
    handleSubmit: handleAuthSubmit,
    formState: { errors: authErrors },
    watch,
  } = useForm<AuthenticationFormData>({
    resolver: zodResolver(authenticationSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[@$!%*?&]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-yellow-500";
    if (strength < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const onCredentialsSubmit = async (data: AuthenticationFormData) => {
    setIsLoading(true);
    setAuthResult(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Store auth data and simulate OTP sending
    localStorage.setItem("authData", JSON.stringify(data));

    setAuthResult({
      type: "success",
      message: `OTP sent to ${data.mobile}. Use code: ${MOCK_OTP}`,
    });

    setCurrentStep("otp");
    setIsLoading(false);
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    setAuthResult(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.otp !== MOCK_OTP) {
      setAuthResult({
        type: "error",
        message: "Invalid OTP. Please check the code and try again.",
      });
      setIsLoading(false);
      return;
    }

    setAuthResult({
      type: "success",
      message: "Authentication successful! Redirecting...",
    });

    // Store final auth status
    localStorage.setItem("isAuthenticated", "true");

    setTimeout(() => {
      router.push("/success");
    }, 1500);

    setIsLoading(false);
  };

  const resendOTP = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthResult({
      type: "success",
      message: `New OTP sent. Use code: ${MOCK_OTP}`,
    });
    setIsLoading(false);
  };

  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {currentStep === "credentials" ? "Create Account" : "Verify OTP"}
          </CardTitle>
          <CardDescription>
            {currentStep === "credentials"
              ? "Enter your credentials to continue"
              : "Enter the 6-digit code sent to your mobile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "credentials" ? (
            <form
              onSubmit={handleAuthSubmit(onCredentialsSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerAuth("email")}
                  placeholder="your.email@example.com"
                  className={authErrors.email ? "border-red-500" : ""}
                />
                {authErrors.email && (
                  <p className="text-sm text-red-600">
                    {authErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  {...registerAuth("mobile")}
                  placeholder="+64 21 123 4567"
                  className={authErrors.mobile ? "border-red-500" : ""}
                />
                {authErrors.mobile && (
                  <p className="text-sm text-red-600">
                    {authErrors.mobile.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...registerAuth("password")}
                    placeholder="Enter a strong password"
                    className={
                      authErrors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                </div>
                {password && (
                  <div className="space-y-2">
                    <Progress
                      value={passwordStrength}
                      className={`h-2 ${getPasswordStrengthColor(
                        passwordStrength
                      )}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password strength:{" "}
                      <span className="font-medium text-foreground">
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </p>
                  </div>
                )}
                {authErrors.password && (
                  <p className="text-sm text-red-600">
                    {authErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    {...registerAuth("confirmPassword")}
                    placeholder="Re-enter your password"
                    className={
                      authErrors.confirmPassword
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {authErrors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {authErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {authResult && (
                <Alert
                  className={
                    authResult.type === "success"
                      ? "border-green-500"
                      : "border-destructive"
                  }
                >
                  <div className="flex items-center gap-2">
                    {authResult.type === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <AlertDescription
                      className={
                        authResult.type === "success"
                          ? "text-green-700"
                          : "text-destructive"
                      }
                    >
                      {authResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Get OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit(onOTPSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-Digit OTP *</Label>
                <Input
                  id="otp"
                  {...registerOTP("otp")}
                  placeholder="123456"
                  maxLength={6}
                  className={`text-center text-lg tracking-widest ${
                    otpErrors.otp ? "border-red-500" : ""
                  }`}
                />
                {otpErrors.otp && (
                  <p className="text-sm text-red-600">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              {authResult && (
                <Alert
                  className={
                    authResult.type === "success"
                      ? "border-green-500"
                      : "border-destructive"
                  }
                >
                  <div className="flex items-center gap-2">
                    {authResult.type === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <AlertDescription
                      className={
                        authResult.type === "success"
                          ? "text-green-700"
                          : "text-destructive"
                      }
                    >
                      {authResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setCurrentStep("credentials")}
                  disabled={isLoading}
                >
                  Back to Credentials
                </Button>
              </div>
            </form>
          )}

          {currentStep === "otp" && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Testing Information:
              </p>
              <p className="text-xs text-muted-foreground">
                Use OTP code:{" "}
                <span className="font-mono font-bold text-foreground">
                  123456
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
