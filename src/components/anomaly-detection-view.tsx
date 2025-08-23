
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { detectAnomalies } from "@/ai/flows/detect-anomalies"
import type { DetectAnomaliesOutput } from "@/ai/flows/detect-anomalies"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Bot, Zap, Shield, Wrench } from "lucide-react"
import { Badge } from "./ui/badge"

const formSchema = z.object({
  equipmentData: z.string().min(50, {
    message: "Please provide at least 50 characters of equipment data.",
  }),
})

export function AnomalyDetectionView() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DetectAnomaliesOutput | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentData: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setResult(null)
    try {
      const anomalyResult = await detectAnomalies({ equipmentData: values.equipmentData })
      setResult(anomalyResult)
    } catch (error) {
      console.error("Anomaly detection failed:", error)
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: "Could not analyze the equipment data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityBadge = (severity?: string) => {
    switch(severity?.toLowerCase()) {
        case 'high': return <Badge variant="destructive">High</Badge>;
        case 'medium': return <Badge variant="default" className="bg-accent hover:bg-accent/90">Medium</Badge>;
        case 'low': return <Badge variant="secondary">Low</Badge>;
        default: return <Badge variant="outline">{severity}</Badge>;
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> AI Anomaly Detector</CardTitle>
          <CardDescription>
            Paste raw equipment data (e.g., sensor logs, operational parameters) below to check for anomalies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
              <FormField
                control={form.control}
                name="equipmentData"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-col">
                    <FormLabel>Equipment Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., timestamp=2024-07-28T10:30:00Z, assetId=T-4512, temp_c=85.5, vibration_hz=62.1, voltage_kv=137.8..."
                        className="flex-1 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Detect Anomalies"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            The result of the anomaly detection will be shown here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <Bot className="h-10 w-10 animate-pulse" />
              <p>AI is analyzing the data...</p>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              {result.hasAnomaly ? (
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                    <div>
                      <h3 className="font-bold text-lg">Anomaly Detected</h3>
                      <p className="text-destructive/80">Potential issues identified in the provided data.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                            <h4 className="font-semibold">Severity</h4>
                            <p>{getSeverityBadge(result.severity)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                            <h4 className="font-semibold">Description</h4>
                            <p>{result.anomalyDescription}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Wrench className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                            <h4 className="font-semibold">Recommended Actions</h4>
                            <p>{result.recommendedActions}</p>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 text-green-600">
                    <CheckCircle className="h-8 w-8" />
                    <div>
                      <h3 className="font-bold text-lg">No Anomaly Detected</h3>
                      <p className="text-green-600/80">Equipment appears to be operating within normal parameters.</p>
                    </div>
                </div>
              )}
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex items-center justify-center text-muted-foreground h-48">
              <p>Waiting for data submission...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
