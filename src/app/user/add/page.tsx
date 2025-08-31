"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Sun,
  Battery,
  Car,
  Droplets,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  derResourceSchema,
  type DERResourceFormData,
} from "../../../lib/der-validation";

type DERType = "hot-water" | "solar" | "solar-battery" | "ev";

interface DEREntry extends DERResourceFormData {
  id: string;
  type: DERType;
  typeName: string;
  imagePreview?: string;
}

const DER_TYPES = [
  {
    id: "hot-water" as DERType,
    name: "Hot Water",
    icon: Droplets,
    description: "Electric hot water systems",
    color: "bg-blue-500",
  },
  {
    id: "solar" as DERType,
    name: "Solar",
    icon: Sun,
    description: "Solar panel systems",
    color: "bg-yellow-500",
  },
  {
    id: "solar-battery" as DERType,
    name: "Solar + Battery",
    icon: Battery,
    description: "Solar with battery storage",
    color: "bg-green-500",
  },
  {
    id: "ev" as DERType,
    name: "Electric Vehicles",
    icon: Car,
    description: "EV charging systems",
    color: "bg-purple-500",
  },
];

const COMMUNICATION_PROTOCOLS = ["Modbus", "MQTT", "IEC 61850"];

export default function AddDERResourcePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDERType, setSelectedDERType] = useState<DERType | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DERResourceFormData>({
    resolver: zodResolver(derResourceSchema),
  });

  const watchedProtocol = watch("communicationProtocol");

  useEffect(() => {
    // Get the type from URL params
    const typeParam = searchParams.get("type") as DERType;
    if (typeParam && DER_TYPES.find((t) => t.id === typeParam)) {
      setSelectedDERType(typeParam);
    }
  }, [searchParams]);

  const handleDERTypeSelect = (type: DERType) => {
    setSelectedDERType(type);
    setImagePreview(null);
    reset();
  };

  const onSubmit = async (data: DERResourceFormData) => {
    if (!selectedDERType) return;

    const selectedType = DER_TYPES.find((t) => t.id === selectedDERType);
    if (!selectedType) return;

    const newEntry: DEREntry = {
      ...data,
      id: Date.now().toString(),
      type: selectedDERType,
      typeName: selectedType.name,
      imagePreview: imagePreview || undefined,
    };

    // Get existing entries
    const existingData = localStorage.getItem("derResourceData");
    const existingEntries = existingData ? JSON.parse(existingData) : [];

    // Add new entry
    const updatedEntries = [...existingEntries, newEntry];
    localStorage.setItem("derResourceData", JSON.stringify(updatedEntries));

    setSubmitResult({
      type: "success",
      message: "DER resource added successfully! Redirecting...",
    });

    setTimeout(() => {
      router.push("/user");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/user");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setSubmitResult({
          type: "error",
          message: "Please select a valid image file.",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitResult({
          type: "error",
          message: "Image size must be less than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue("image", result);
        setSubmitResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", "");
  };

  const selectedTypeInfo = selectedDERType
    ? DER_TYPES.find((t) => t.id === selectedDERType)
    : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">
                  Add DER Resource
                </CardTitle>
                <CardDescription className="text-lg">
                  Configure a new Distributed Energy Resource for remote load
                  control
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* DER Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Select DER Type</CardTitle>
            <CardDescription>
              Choose the type of distributed energy resource you want to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DER_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedDERType === type.id;
                return (
                  <Button
                    key={type.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto p-6 flex flex-col items-center gap-3 ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleDERTypeSelect(type.id)}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* DER Configuration Form */}
        {selectedDERType && selectedTypeInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <selectedTypeInfo.icon className="w-6 h-6" />
                Configure {selectedTypeInfo.name}
              </CardTitle>
              <CardDescription>
                Enter the technical specifications for this DER resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage (V) *</Label>
                    <Input
                      id="voltage"
                      type="number"
                      step="0.1"
                      {...register("voltage", { valueAsNumber: true })}
                      placeholder="e.g., 230"
                      className={errors.voltage ? "border-red-500" : ""}
                    />
                    {errors.voltage && (
                      <p className="text-sm text-red-600">
                        {errors.voltage.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current">Current (A) *</Label>
                    <Input
                      id="current"
                      type="number"
                      step="0.1"
                      {...register("current", { valueAsNumber: true })}
                      placeholder="e.g., 10.5"
                      className={errors.current ? "border-red-500" : ""}
                    />
                    {errors.current && (
                      <p className="text-sm text-red-600">
                        {errors.current.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="power">Power (W) *</Label>
                    <Input
                      id="power"
                      type="number"
                      step="0.1"
                      {...register("power", { valueAsNumber: true })}
                      placeholder="e.g., 2400"
                      className={errors.power ? "border-red-500" : ""}
                    />
                    {errors.power && (
                      <p className="text-sm text-red-600">
                        {errors.power.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communicationProtocol">
                    Communication Protocol *
                  </Label>
                  <Select
                    value={watchedProtocol || ""}
                    onValueChange={(value) =>
                      setValue("communicationProtocol", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.communicationProtocol ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select communication protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNICATION_PROTOCOLS.map((protocol) => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.communicationProtocol && (
                    <p className="text-sm text-red-600">
                      {errors.communicationProtocol.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Additional information about this DER resource..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Resource Image (Optional)</Label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="DER Resource Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Upload an image of your DER resource
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {imagePreview ? "Change Image" : "Upload Image"}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Result */}
                {submitResult && (
                  <Alert
                    className={
                      submitResult.type === "success"
                        ? "border-green-500"
                        : "border-destructive"
                    }
                  >
                    <div className="flex items-center gap-2">
                      {submitResult.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-destructive" />
                      )}
                      <AlertDescription
                        className={
                          submitResult.type === "success"
                            ? "text-green-700"
                            : "text-destructive"
                        }
                      >
                        {submitResult.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Add DER Resource
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
