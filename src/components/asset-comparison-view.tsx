
"use client";

import type { GridAsset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Download, FileText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AssetComparisonViewProps = {
  assets: GridAsset[];
  attributes: string[];
  onClose: () => void;
};

const getAttributeLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

export function AssetComparisonView({ assets, attributes, onClose }: AssetComparisonViewProps) {
  if (assets.length === 0 || attributes.length === 0) return null;

  const getAttributeValue = (asset: GridAsset, attribute: string) => {
    const value = (asset as any)[attribute];
    if (attribute === 'maintenanceDate' && typeof value === 'string') {
        return new Date(value).toLocaleDateString();
    }
    if (typeof value === 'number') {
        return attribute.toLowerCase().includes('score') ? `${value}%` : value.toString();
    }
    if (typeof value === 'object' && value !== null && 'lat' in value && 'lng' in value) {
        return `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`;
    }
    return value?.toString() || 'N/A';
  }

  const handleDownload = (format: 'csv' | 'pdf') => {
    const headers = ["Attribute", ...assets.map(asset => asset.name)];
    const data = attributes.map(attr => {
        return [getAttributeLabel(attr), ...assets.map(asset => getAttributeValue(asset, attr))];
    });

    if (format === 'csv') {
        const csv = Papa.unparse({
            fields: headers,
            data: data
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "asset_comparison.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (format === 'pdf') {
        const doc = new jsPDF({ orientation: "landscape" });
        (doc as any).autoTable({
            head: [headers],
            body: data,
        });
        doc.save('asset_comparison.pdf');
    }
  }

  return (
    <Card className="shadow-2xl max-h-[40vh] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg">Asset Comparison ({assets.length})</CardTitle>
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownload('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Download as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Download as PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead className="font-semibold min-w-[150px]">Attribute</TableHead>
                        {assets.map((asset) => (
                           <TableHead key={asset.id} className="font-semibold min-w-[150px]">{asset.name}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attributes.map((attr) => (
                        <TableRow key={attr}>
                            <TableCell className="font-medium">{getAttributeLabel(attr)}</TableCell>
                             {assets.map((asset) => (
                                <TableCell key={`${asset.id}-${attr}`}>{getAttributeValue(asset, attr)}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
