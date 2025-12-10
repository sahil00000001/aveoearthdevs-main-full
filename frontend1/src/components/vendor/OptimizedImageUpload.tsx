import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Zap,
  Shield,
  BarChart3,
  Settings,
  FileImage,
  Compress,
  Eye
} from 'lucide-react';

interface UploadResult {
  success: boolean;
  compression_ratio: number;
  space_saved_mb: number;
  efficiency_score: number;
  verification_passed: boolean;
  recommendations: string[];
  image_urls: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  };
}

interface OptimizedImageUploadProps {
  vendorId: string;
  productId: string;
  onUploadComplete?: (result: UploadResult) => void;
  maxFiles?: number;
  allowedFormats?: string[];
}

const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  vendorId,
  productId,
  onUploadComplete,
  maxFiles = 10,
  allowedFormats = ['JPEG', 'PNG', 'WEBP']
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState('auto');
  const [verifyImages, setVerifyImages] = useState(true);
  const [verificationLevel, setVerificationLevel] = useState('standard');
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionLevels = {
    auto: { label: 'Auto', description: 'Automatically detect optimal compression', icon: Zap },
    high: { label: 'High', description: 'Maximum compression (50-80%)', icon: Compress },
    medium: { label: 'Medium', description: 'Balanced compression (30-50%)', icon: BarChart3 },
    low: { label: 'Low', description: 'Minimal compression (10-30%)', icon: Eye }
  };

  const verificationLevels = {
    basic: { label: 'Basic', description: 'File integrity and format validation' },
    standard: { label: 'Standard', description: 'Quality assessment and compression efficiency' },
    advanced: { label: 'Advanced', description: 'Content analysis and optimization suggestions' }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }
    
    // Validate file formats
    const invalidFiles = selectedFiles.filter(file => 
      !allowedFormats.some(format => 
        file.type.toLowerCase().includes(format.toLowerCase())
      )
    );
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid file format',
        description: `Only ${allowedFormats.join(', ')} files are allowed`,
        variant: 'destructive'
      });
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one image to upload',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('vendor_id', vendorId);
      formData.append('product_id', productId);
      formData.append('compression_level', compressionLevel);
      formData.append('verify_image', verifyImages.toString());
      formData.append('verification_level', verificationLevel);

      const response = await fetch('/api/optimized-upload/vendor/batch', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadResults(result.data.results);
        
        toast({
          title: 'Upload successful!',
          description: `${result.data.total_uploaded} images processed with ${result.data.batch_compression_ratio.toFixed(1)}% compression`,
        });

        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
    setUploadResults([]);
  };

  const getCompressionIcon = (level: string) => {
    const Icon = compressionLevels[level as keyof typeof compressionLevels]?.icon || Zap;
    return <Icon className="w-4 h-4" />;
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio >= 60) return 'text-green-600';
    if (ratio >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Upload Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compression Level */}
            <div className="space-y-2">
              <Label htmlFor="compression">Compression Level</Label>
              <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select compression level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(compressionLevels).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getCompressionIcon(key)}
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verification Level */}
            <div className="space-y-2">
              <Label htmlFor="verification">Verification Level</Label>
              <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(verificationLevels).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-sm text-gray-500">{config.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verification Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="verify-images"
              checked={verifyImages}
              onCheckedChange={setVerifyImages}
            />
            <Label htmlFor="verify-images" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enable image verification
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Select Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Images
              </Button>
              <p className="text-sm text-gray-500">
                Select up to {maxFiles} images. Supported formats: {allowedFormats.join(', ')}
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected Files ({files.length})</h4>
                  <Button variant="outline" size="sm" onClick={handleClearFiles}>
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading images...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Upload Results
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Image {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                  
                  {result.success && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Compression:</span>
                        <span className={`ml-1 font-medium ${getCompressionColor(result.compression_ratio)}`}>
                          {result.compression_ratio.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Space Saved:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {result.space_saved_mb.toFixed(2)} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficiency:</span>
                        <span className="ml-1 font-medium">
                          {result.efficiency_score}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Verification:</span>
                        <span className="ml-1 font-medium">
                          {result.verification_passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="min-w-[200px]"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Optimize Images
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OptimizedImageUpload;
