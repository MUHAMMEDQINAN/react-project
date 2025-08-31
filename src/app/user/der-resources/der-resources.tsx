"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Sun,
  Battery,
  Car,
  Droplets,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

type DERType = "hot-water" | "solar" | "solar-battery" | "ev";

interface DEREntry {
  id: string;
  type: DERType;
  typeName: string;
  voltage: number;
  current: number;
  power: number;
  communicationProtocol: string;
  notes?: string;
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

export default function DERResourcePage() {
  const router = useRouter();
  const [derEntries, setDEREntries] = useState<DEREntry[]>([]);
  const [activeTab, setActiveTab] = useState<DERType>("hot-water");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // Load existing DER data
    const savedData = localStorage.getItem("derResourceData");
    if (savedData) {
      setDEREntries(JSON.parse(savedData));
    }
  }, []);

  const handleRemoveEntry = (id: string) => {
    const updatedEntries = derEntries.filter((entry) => entry.id !== id);
    setDEREntries(updatedEntries);
    localStorage.setItem("derResourceData", JSON.stringify(updatedEntries));
  };

  const handleAddNew = () => {
    router.push(`user/add?type=${activeTab}`);
  };

  const handleSaveAll = async () => {
    if (derEntries.length === 0) {
      setSubmitResult({
        type: "error",
        message: "Please add at least one DER resource before saving.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmitResult({
      type: "success",
      message: "DER resources saved successfully! Redirecting...",
    });

    setTimeout(() => {
      router.push("/user");
    }, 1500);

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.back();
  };

  const getEntriesForType = (type: DERType) => {
    return derEntries.filter((entry) => entry.type === type);
  };

  const getTotalCount = () => {
    return derEntries.length;
  };

  const getCountForType = (type: DERType) => {
    return getEntriesForType(type).length;
  };

  const renderResourceTable = (entries: DEREntry[]) => {
    if (entries.length === 0) {
      const typeInfo = DER_TYPES.find((t) => t.id === activeTab);
      const Icon = typeInfo?.icon || Zap;

      return (
        <div className="text-center py-12">
          <div
            className={`mx-auto mb-4 w-16 h-16 ${typeInfo?.color} rounded-full flex items-center justify-center opacity-50`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No {typeInfo?.name} Resources Added
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click the "Add New" button to add your first{" "}
            {typeInfo?.name.toLowerCase()} resource.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voltage (V)</TableHead>
              <TableHead>Current (A)</TableHead>
              <TableHead>Power (W)</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>View</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.voltage}</TableCell>
                <TableCell>{entry.current}</TableCell>
                <TableCell>{entry.power}</TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.communicationProtocol}</Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {entry.notes || "-"}
                </TableCell>

                <TableCell>
                  {entry.imagePreview ? (
                    <div className="relative group">
                      <img
                        src={entry.imagePreview}
                        alt="DER Resource"
                        className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer";
                          modal.innerHTML = `
                            <div class="relative max-w-4xl max-h-4xl p-4">
                              <img src="${entry.imagePreview}" alt="DER Resource" class="max-w-full max-h-full object-contain rounded-lg" />
                              <button class="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          `;
                          modal.onclick = () =>
                            document.body.removeChild(modal);
                          document.body.appendChild(modal);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded border">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`user/tracking`)}
                    className=" hover:text-red-700 hover:bg-red-50"
                  >
                    <span className="text-blue-600">View</span>
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        {/* <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              DER Resource Management
            </CardTitle>
            <CardDescription className="text-lg">
              Manage your Distributed Energy Resources for remote load control
            </CardDescription>
            {getTotalCount() > 0 && (
              <Badge variant="secondary" className="mt-2">
                {getTotalCount()} Resource{getTotalCount() !== 1 ? "s" : ""}{" "}
                Configured
              </Badge>
            )}
          </CardHeader>
        </Card> */}

        {/* Tabs for DER Categories */}
        <Card>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as DERType)}
              className="w-full"
            >
              <div className="border-b p-5">
                <div className="flex items-center justify-between p-6 pb-0">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    {DER_TYPES.map((type) => {
                      const Icon = type.icon;
                      const count = getCountForType(type.id);
                      return (
                        <TabsTrigger
                          key={type.id}
                          value={type.id}
                          className="flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{type.name}</span>
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {count}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {/* Add New Button */}
                  <Button
                    onClick={handleAddNew}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </Button>
                </div>
              </div>

              {DER_TYPES.map((type) => (
                <TabsContent key={type.id} value={type.id} className="p-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center`}
                      >
                        <type.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {type.name} Resources
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>

                    {renderResourceTable(getEntriesForType(type.id))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

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
                <Zap className="w-4 h-4 text-destructive" />
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

        {/* Action Buttons */}
      </div>
    </div>
  );
}
