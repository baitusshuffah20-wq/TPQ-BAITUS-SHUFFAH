'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
  className?: string;
  showControls?: boolean;
  onGenerate?: (dataUrl: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  title = 'QR Code',
  description,
  size = 256,
  className = '',
  showControls = true,
  onGenerate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    if (!canvasRef.current || !data) return;

    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#0f766e', // Teal color
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
      
      if (onGenerate) {
        onGenerate(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [data, size]);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const copyImageToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {showControls && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateQR}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="text-center">
        {/* QR Code Canvas */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* Data Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Data:</p>
          <p className="text-sm font-mono break-all">{data}</p>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              disabled={!qrDataUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!data}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyImageToClipboard}
              disabled={!qrDataUrl}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Image
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating QR Code...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
