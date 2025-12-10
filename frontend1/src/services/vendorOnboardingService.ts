import { mockVendorOnboardingService } from './mockVendorServices';

export const vendorOnboardingService = {
  async completeOnboarding(formData: any) {
    return await mockVendorOnboardingService.completeOnboarding(formData);
  }
};
