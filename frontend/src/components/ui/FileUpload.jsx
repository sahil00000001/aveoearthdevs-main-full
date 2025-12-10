// Reusable file upload component with validation and preview
"use client";

import { useState, useRef } from 'react';
import { validateFile, validateImageFile, validateDocumentFile, formatFileSize } from '../../lib/fileUtils';

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  multiple = false, 
  maxFiles = 1,
  fileType = 'document', // 'image' or 'document'
  label = "Upload File",
  description = "Drag and drop files here or click to browse",
  className = "",
  required = false,
  currentFile = null,
  isUploading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const validateFileSelection = (files) => {
    const fileArray = Array.from(files);
    const validationErrors = [];
    const validFiles = [];

    // Check file count
    if (!multiple && fileArray.length > 1) {
      validationErrors.push("Only one file is allowed");
      return { validFiles: [], errors: validationErrors };
    }

    if (fileArray.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed`);
      return { validFiles: [], errors: validationErrors };
    }

    // Validate each file
    fileArray.forEach((file, index) => {
      const validation = fileType === 'image' 
        ? validateImageFile(file) 
        : validateDocumentFile(file);
      
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return { validFiles, errors: validationErrors };
  };

  const handleFiles = (files) => {
    const { validFiles, errors: validationErrors } = validateFileSelection(files);
    setErrors(validationErrors);

    if (validFiles.length > 0) {
      // Create previews for images
      if (fileType === 'image') {
        const newPreviews = validFiles.map(file => ({
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        }));
        setPreviews(newPreviews);
      } else {
        const newPreviews = validFiles.map(file => ({
          file,
          name: file.name,
          size: file.size,
          type: file.type
        }));
        setPreviews(newPreviews);
      }

      // Call parent callback
      if (onFileSelect) {
        onFileSelect(multiple ? validFiles : validFiles[0]);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    if (newPreviews.length === 0) {
      if (onFileSelect) {
        onFileSelect(null);
      }
    } else {
      const files = newPreviews.map(p => p.file);
      if (onFileSelect) {
        onFileSelect(multiple ? files : files[0]);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isUploading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
          ${dragActive && !isUploading ? 'border-[#12b74f] bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${errors.length > 0 ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={!isUploading ? handleDrag : undefined}
        onDragLeave={!isUploading ? handleDrag : undefined}
        onDragOver={!isUploading ? handleDrag : undefined}
        onDrop={!isUploading ? handleDrop : undefined}
        onClick={!isUploading ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        
        <div className="space-y-2">
          {isUploading ? (
            <>
              <div className="mx-auto w-12 h-12 text-[#12b74f]">
                <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                    className="animate-pulse"
                  />
                </svg>
              </div>
              <div className="text-sm text-[#12b74f] font-medium">
                Uploading...
              </div>
              <p className="text-xs text-gray-500">Please wait while your file is being uploaded</p>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-[#12b74f] hover:text-[#0f8f3f]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">{description}</p>
              <p className="text-xs text-gray-400">
                Max size: 2MB • {fileType === 'image' ? 'Images' : 'Documents'} only
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          {previews.map((preview, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {fileType === 'image' && preview.url ? (
                  <img 
                    src={preview.url} 
                    alt={preview.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {preview.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(preview.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Current File Display */}
      {currentFile && previews.length === 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Current file: {typeof currentFile === 'string' ? currentFile.split('/').pop() : currentFile.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
