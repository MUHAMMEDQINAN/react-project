"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Home, 
  FileText, 
  Users, 
  Shield, 
  Zap, 
  Sun, 
  Battery, 
  Car, 
  Droplets,
  X,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface ApplicationStage {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  estimatedTime?: string;
  completedAt?: string;
}

export default function ApplicationTrackingPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    registration: any;
    auth: any;
    derResources: any[];
  } | null>(null);
  const [applicationId] = useState(() => `APP-${Date.now().toString().slice(-8)}`);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Application stages
  const [stages, setStages] = useState<ApplicationStage[]>([
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your DER registration application has been received",
      status: "completed",
      completedAt: new Date().toLocaleString()
    },
    {
      id: "notified",
      title: "Retailer Notified",
      description: "Your electricity retailer has been notified about the DER installation",
      status: "current",
      estimatedTime: "1-2 business days"
    },
    {
      id: "processing",
      title: "Technical Assessment",
      description: "Technical review of your DER specifications and grid compatibility",
      status: "pending",
      estimatedTime: "3-5 business days"
    },
    {
      id: "retailer-approval",
      title: "Retailer Approval",
      description: "Awaiting final approval from your electricity retailer",
      status: "pending",
      estimatedTime: "2-3 business days"
    },
    {
      id: "installation-scheduled",
      title: "Installation Scheduled",
      description: "Remote monitoring equipment installation will be scheduled",
      status: "pending",
      estimatedTime: "5-10 business days"
    },
    {
      id: "completed",
      title: "System Active",
      description: "DER monitoring and load control system is fully operational",
      status: "pending",
      estimatedTime: "1-2 business days after installation"
    }
  ]);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Load user data
    const registrationData = localStorage.getItem("registrationData");
    const authData = localStorage.getItem("authData");
    const derResourceData = localStorage.getItem("derResourceData");
    
    if (registrationData && authData) {
      setUserData({
        registration: JSON.parse(registrationData),
        auth: JSON.parse(authData),
        derResources: derResourceData ? JSON.parse(derResourceData) : []
      });
    }

    // Simulate stage progression (in real app, this would come from API)
    const timer = setTimeout(() => {
      setStages(prev => prev.map((stage, index) => {
        if (stage.id === "notified") {
          return { ...stage, status: "completed", completedAt: new Date().toLocaleString() };
        }
        if (stage.id === "processing") {
          return { ...stage, status: "current" };
        }
        return stage;
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleWithdrawApplication = async () => {
    setIsWithdrawing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear all stored data
    localStorage.removeItem("registrationData");
    localStorage.removeItem("authData");
    localStorage.removeItem("derResourceData");
    localStorage.removeItem("isAuthenticated");
    
    router.push("/");
  };

  const handleStartNew = () => {
    // Clear all stored data
    localStorage.removeItem("registrationData");
    localStorage.removeItem("authData");
    localStorage.removeItem("derResourceData");
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  };

  const getDERIcon = (type: string) => {
    switch (type) {
      case "hot-water": return Droplets;
      case "solar": return Sun;
      case "solar-battery": return Battery;
      case "ev": return Car;
      default: return Zap;
    }
  };

  const getStageIcon = (stage: ApplicationStage) => {
    switch (stage.status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "current":
        return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.status === "current");
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Application Tracking
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Track your DER registration application progress
            </p>
            <Badge variant="secondary" className="mt-2 font-mono">
              {applicationId}
            </Badge>
          </CardHeader>
        </Card>

        {/* Progress Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              Application Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-start gap-4">
                  {/* Stage Icon */}
                  <div className="flex flex-col items-center">
                    {getStageIcon(stage)}
                    {index < stages.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        stage.status === "completed" ? "bg-green-600" : "bg-muted-foreground/30"
                      }`} />
                    )}
                  </div>
                  
                  {/* Stage Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        stage.status === "current" ? "text-blue-600" : 
                        stage.status === "completed" ? "text-green-600" : 
                        "text-muted-foreground"
                      }`}>
                        {stage.title}
                      </h3>
                      {stage.status === "completed" && stage.completedAt && (
                        <Badge variant="outline" className="text-xs">
                          {stage.completedAt}
                        </Badge>
                      )}
                      {stage.status === "current" && (
                        <Badge className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {stage.description}
                    </p>
                    {stage.estimatedTime && stage.status !== "completed" && (
                      <p className="text-xs text-muted-foreground">
                        Estimated time: {stage.estimatedTime}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-sm">ICP ID:</span>
                <p className="text-muted-foreground font-mono">{userData.registration.icpId}</p>
              </div>
              <div>
                <span className="font-medium text-sm">Address:</span>
                <p className="text-muted-foreground">
                  {userData.registration.streetAddress}, {userData.registration.town}
                </p>
              </div>
              <div>
                <span className="font-medium text-sm">Region:</span>
                <p className="text-muted-foreground">{userData.registration.region}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{userData.auth.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{userData.auth.mobile}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DER Resources */}
        {userData.derResources && userData.derResources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                DER Resources ({userData.derResources.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.derResources.map((resource: any, index: number) => {
                  const Icon = getDERIcon(resource.type);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{resource.typeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.power}W • {resource.communicationProtocol}
                        </p>
                      </div>
                      {resource.imagePreview && (
                        <Badge variant="outline" className="text-xs">
                          Image
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Warning */}
        {getCurrentStageIndex() <= 2 && (
          <Alert className="border-yellow-500">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              You can withdraw your application at any time before retailer approval. 
              After approval, please contact your retailer directly for any changes.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleStartNew}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Register New Property
              </Button>
              
              {getCurrentStageIndex() <= 2 && (
                <Button 
                  onClick={() => setShowWithdrawConfirm(true)}
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                >
                  <X className="w-4 h-4 mr-2" />
                  Withdraw Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Confirmation */}
        {showWithdrawConfirm && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Application Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to withdraw your DER registration application? 
                This action cannot be undone and you'll need to start the process again if you change your mind.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={handleWithdrawApplication}
                  variant="destructive"
                  disabled={isWithdrawing}
                  className="flex-1"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Withdrawing...
                    </>
                  ) : (
                    "Yes, Withdraw Application"
                  )}
                </Button>
                <Button 
                  onClick={() => setShowWithdrawConfirm(false)}
                  variant="outline"
                  disabled={isWithdrawing}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}