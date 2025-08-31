
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generateAnomalyReport } from "@/ai/flows/generate-anomaly-report"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Bot } from "lucide-react"

const formSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required."),
  timeRange: z.string().min(1, "Time range is required."),
  anomalyDetails: z.string().min(20, {
    message: "Please provide at least 20 characters of anomaly details.",
  }),
})

export function ReportingView() {
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: "",
      timeRange: "last 24 hours",
      anomalyDetails: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setReport(null)
    try {
      const result = await generateAnomalyReport(values)
      setReport(result.report)
    } catch (error) {
      console.error("Report generation failed:", error)
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: "Could not generate the report. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Automated Report Generator</CardTitle>
          <CardDescription>
            Fill in the details below to generate a formal anomaly report.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., T-4512" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="last hour">Last Hour</SelectItem>
                        <SelectItem value="last 24 hours">Last 24 Hours</SelectItem>
                        <SelectItem value="last 7 days">Last 7 Days</SelectItem>
                        <SelectItem value="last 30 days">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anomalyDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anomaly Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the detected anomalies. e.g., High temperature spikes observed, exceeding 85°C multiple times. Correlated with minor voltage drops."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Report</CardTitle>
          <CardDescription>
            The AI-generated report will appear below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <Bot className="h-10 w-10 animate-pulse" />
              <p>AI is writing the report...</p>
            </div>
          )}
          {report && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
              {report}
            </div>
          )}
          {!isLoading && !report && (
            <div className="flex items-center justify-center text-muted-foreground h-48">
              <p>Waiting for report generation...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
