// Product Verification Service Integration
const PRODUCT_VERIFICATION_URL = import.meta.env.VITE_PRODUCT_VERIFICATION_URL || 'http://localhost:8001';

export interface VerificationResult {
  filename: string;
  title: string;
  probability: number;
  is_match: boolean;
  threshold: number;
  device_used: string;
}

export interface BatchVerificationResult {
  filename: string;
  results: Array<{
    title: string;
    probability: number;
    is_match: boolean;
  }>;
  best_match: {
    title: string;
    probability: number;
    is_match: boolean;
  };
  any_match_above_threshold: boolean;
  threshold: number;
  device_used: string;
}

class ProductVerificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = PRODUCT_VERIFICATION_URL;
  }

  async verifyProduct(imageFile: File, title: string): Promise<VerificationResult> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('title', title);

      const response = await fetch(`${this.baseUrl}/verify-product`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Product verification error:', error);
      throw error;
    }
  }

  async verifyProductBatch(imageFile: File, titles: string[]): Promise<BatchVerificationResult> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('titles', titles.join(','));

      const response = await fetch(`${this.baseUrl}/verify-product-batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Batch verification failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch product verification error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    message: string;
    status: string;
    device: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Please upload an image smaller than 10MB.',
      };
    }

    return { valid: true };
  }

  // Helper method to get verification confidence level
  getConfidenceLevel(probability: number): {
    level: 'low' | 'medium' | 'high' | 'very_high';
    color: string;
    description: string;
  } {
    if (probability >= 0.9) {
      return {
        level: 'very_high',
        color: 'green',
        description: 'Very High Confidence',
      };
    } else if (probability >= 0.8) {
      return {
        level: 'high',
        color: 'blue',
        description: 'High Confidence',
      };
    } else if (probability >= 0.7) {
      return {
        level: 'medium',
        color: 'yellow',
        description: 'Medium Confidence',
      };
    } else {
      return {
        level: 'low',
        color: 'red',
        description: 'Low Confidence',
      };
    }
  }

  // Helper method to format probability as percentage
  formatProbability(probability: number): string {
    return `${(probability * 100).toFixed(1)}%`;
  }
}

// Create singleton instance
export const productVerificationService = new ProductVerificationService();

// Export for backward compatibility
export default productVerificationService;
