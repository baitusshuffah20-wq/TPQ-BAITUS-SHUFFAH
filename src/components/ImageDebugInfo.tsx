"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface ImageDebugInfoProps {
  imagePath: string;
  appType: string;
  fileType: string;
}

export default function ImageDebugInfo({
  imagePath,
  appType,
  fileType,
}: ImageDebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkImageStatus = async () => {
    setIsLoading(true);
    try {
      // Test direct file access
      const directResponse = await fetch(imagePath);
      const directStatus = directResponse.status;
      
      // Test API endpoint
      const apiPath = imagePath.replace('/uploads/mobile-assets/', '/api/mobile-builds/assets/');
      const apiResponse = await fetch(apiPath);
      const apiStatus = apiResponse.status;
      
      // Test file existence via test endpoint
      const testResponse = await fetch(`/api/mobile-builds/test-image?path=${encodeURIComponent(imagePath)}`);
      const testData = await testResponse.json();
      
      setDebugInfo({
        imagePath,
        apiPath,
        directAccess: {
          status: directStatus,
          ok: directResponse.ok,
        },
        apiAccess: {
          status: apiStatus,
          ok: apiResponse.ok,
        },
        fileTest: testData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  };

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsVisible(true)}
        className="mt-2"
      >
        <Eye className="w-4 h-4 mr-1" />
        Debug Info
      </Button>
    );
  }

  return (
    <Card className="mt-2 text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Debug Info - {fileType}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <Badge variant="outline">{appType}</Badge>
          <Badge variant="outline" className="ml-1">{fileType}</Badge>
        </div>
        
        <div className="space-y-1">
          <div className="font-medium">Image Path:</div>
          <div className="bg-gray-100 p-1 rounded text-xs break-all">
            {imagePath}
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={checkImageStatus}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1" />
          )}
          Check Status
        </Button>
        
        {debugInfo && (
          <div className="space-y-2 mt-2">
            <div className="font-medium">Results:</div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
