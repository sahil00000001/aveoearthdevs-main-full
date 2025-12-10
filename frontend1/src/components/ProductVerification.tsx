import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { productVerificationService, VerificationResult, BatchVerificationResult } from '@/services/productVerificationService';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface ProductVerificationProps {
  onVerificationComplete?: (result: VerificationResult | BatchVerificationResult) => void;
  className?: string;
}

const ProductVerification: React.FC<ProductVerificationProps> = ({
  onVerificationComplete,
  className = '',
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [titles, setTitles] = useState('');
  const [verificationMode, setVerificationMode] = useState<'single' | 'batch'>('single');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | BatchVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = productVerificationService.validateImageFile(file);
      if (validation.valid) {
        setImageFile(file);
        setError(null);
      } else {
        setError(validation.error || 'Invalid file');
        toast({
          title: 'Invalid File',
          description: validation.error,
          variant: 'destructive',
        });
      }
    }
  };

  const handleVerify = async () => {
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }

    if (verificationMode === 'single' && !title.trim()) {
      setError('Please enter a product title');
      return;
    }

    if (verificationMode === 'batch' && !titles.trim()) {
      setError('Please enter product titles (comma-separated)');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      let verificationResult: VerificationResult | BatchVerificationResult;

      if (verificationMode === 'single') {
        verificationResult = await productVerificationService.verifyProduct(imageFile, title);
      } else {
        const titleList = titles.split(',').map(t => t.trim()).filter(t => t);
        verificationResult = await productVerificationService.verifyProductBatch(imageFile, titleList);
      }

      setResult(verificationResult);
      onVerificationComplete?.(verificationResult);

      toast({
        title: 'Verification Complete',
        description: 'Product verification has been completed successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setTitle('');
    setTitles('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceLevel = (probability: number) => {
    return productVerificationService.getConfidenceLevel(probability);
  };

  const formatProbability = (probability: number) => {
    return productVerificationService.formatProbability(probability);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Product Verification</h3>
          <p className="text-sm text-gray-600">
            Verify if product images match their titles using AI-powered analysis.
          </p>
        </div>

        {/* Verification Mode Selection */}
        <div className="space-y-2">
          <Label>Verification Mode</Label>
          <div className="flex space-x-4">
            <Button
              variant={verificationMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVerificationMode('single')}
            >
              Single Product
            </Button>
            <Button
              variant={verificationMode === 'batch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVerificationMode('batch')}
            >
              Batch Comparison
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Product Image</Label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageFile ? (
              <div className="space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto text-green-500" />
                <p className="text-sm font-medium">{imageFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Single Product Mode */}
        {verificationMode === 'single' && (
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title..."
              disabled={isVerifying}
            />
          </div>
        )}

        {/* Batch Mode */}
        {verificationMode === 'batch' && (
          <div className="space-y-2">
            <Label htmlFor="titles">Product Titles (comma-separated)</Label>
            <Input
              id="titles"
              value={titles}
              onChange={(e) => setTitles(e.target.value)}
              placeholder="title1, title2, title3..."
              disabled={isVerifying}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleVerify}
            disabled={!imageFile || isVerifying || (verificationMode === 'single' ? !title.trim() : !titles.trim())}
            className="flex-1"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Product'
            )}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isVerifying}>
            Reset
          </Button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Verification Results</h4>
            
            {verificationMode === 'single' && 'is_match' in result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Match Status:</span>
                  <Badge
                    variant={result.is_match ? 'default' : 'destructive'}
                    className={result.is_match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {result.is_match ? 'Match Found' : 'No Match'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence Score:</span>
                    <span className="font-medium">{formatProbability(result.probability)}</span>
                  </div>
                  <Progress value={result.probability * 100} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Threshold: {formatProbability(result.threshold)}</span>
                    <span>Device: {result.device_used}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.is_match ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {result.is_match
                      ? 'The image matches the product title with high confidence.'
                      : 'The image does not match the product title.'}
                  </span>
                </div>
              </div>
            )}

            {verificationMode === 'batch' && 'results' in result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Match:</span>
                  <Badge
                    variant={result.best_match.is_match ? 'default' : 'destructive'}
                    className={result.best_match.is_match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {result.best_match.is_match ? 'Match Found' : 'No Match'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Best Match: {result.best_match.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence:</span>
                    <span className="font-medium">{formatProbability(result.best_match.probability)}</span>
                  </div>
                  <Progress value={result.best_match.probability * 100} className="h-2" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">All Results:</p>
                  {result.results.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1 mr-2">{item.title}</span>
                      <div className="flex items-center space-x-2">
                        <span>{formatProbability(item.probability)}</span>
                        {item.is_match ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductVerification;
