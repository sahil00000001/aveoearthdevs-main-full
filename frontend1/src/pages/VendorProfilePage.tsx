import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { vendorProfileService, VendorProfile } from '@/services/vendorProfileService';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  Shield, 
  Upload,
  Save,
  Edit,
  Check,
  X,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Award,
  Calendar,
  Users,
  Banknote,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

const VendorProfilePage = () => {
  const { vendor, isAuthenticated } = useVendorAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<Partial<VendorProfile>>({});

  useEffect(() => {
    // Load data immediately if vendor session exists (for mock version)
    const session = localStorage.getItem('vendorSession');
    if (session || vendor?.id) {
      loadProfile();
    }
  }, [vendor]);

  const loadProfile = async () => {
    // Use mock vendor ID if no vendor from auth
    const vendorId = vendor?.id || 'mock-vendor-1';
    
    setIsLoading(true);
    try {
      // Simulate a quick load for mock data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const profileData = await vendorProfileService.getProfile(vendorId);
      if (profileData) {
        setProfile(profileData);
        setFormData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[] || []), value]
        : (prev[field as keyof typeof prev] as string[] || []).filter(item => item !== value)
    }));
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (!vendor?.id) return;

    setIsSaving(true);
    try {
      let url: string | null = null;
      
      if (field === 'profile_image_url') {
        url = await vendorProfileService.uploadProfileImage(vendor.id, file);
      } else if (field === 'business_logo_url') {
        url = await vendorProfileService.uploadBusinessLogo(vendor.id, file);
      } else {
        url = await vendorProfileService.uploadDocument(vendor.id, file, field);
      }

      if (url) {
        handleInputChange(field, url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!vendor?.id) return;

    setIsSaving(true);
    try {
      const updatedProfile = await vendorProfileService.updateProfile(vendor.id, formData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-forest text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest mb-2">Profile Management</h1>
            <p className="text-muted-foreground">Manage your vendor profile and business information</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Verification Status */}
        {profile && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    profile.verification_status === 'approved' ? 'bg-green-500' :
                    profile.verification_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="font-medium">Verification Status:</span>
                  <Badge variant={
                    profile.verification_status === 'approved' ? 'default' :
                    profile.verification_status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                  </Badge>
                </div>
                {profile.verification_notes && (
                  <span className="text-sm text-muted-foreground">
                    {profile.verification_notes}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact_person_name">Contact Person Name</Label>
                    <Input
                      id="contact_person_name"
                      value={formData.contact_person_name || ''}
                      onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_person_designation">Designation</Label>
                    <Input
                      id="contact_person_designation"
                      value={formData.contact_person_designation || ''}
                      onChange={(e) => handleInputChange('contact_person_designation', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact_person_email">Contact Email</Label>
                    <Input
                      id="contact_person_email"
                      type="email"
                      value={formData.contact_person_email || ''}
                      onChange={(e) => handleInputChange('contact_person_email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_person_phone">Contact Phone</Label>
                    <Input
                      id="contact_person_phone"
                      value={formData.contact_person_phone || ''}
                      onChange={(e) => handleInputChange('contact_person_phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label>Profile Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.profile_image_url && (
                      <img 
                        src={formData.profile_image_url} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('profile_image_url', e.target.files[0])}
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Information Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name || ''}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business_type">Business Type</Label>
                    <Input
                      id="business_type"
                      value={formData.business_type || ''}
                      onChange={(e) => handleInputChange('business_type', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_website">Website</Label>
                    <Input
                      id="business_website"
                      type="url"
                      value={formData.business_website || ''}
                      onChange={(e) => handleInputChange('business_website', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description || ''}
                    onChange={(e) => handleInputChange('business_description', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="business_established_year">Established Year</Label>
                    <Input
                      id="business_established_year"
                      type="number"
                      value={formData.business_established_year || ''}
                      onChange={(e) => handleInputChange('business_established_year', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_employee_count">Employee Count</Label>
                    <Input
                      id="business_employee_count"
                      value={formData.business_employee_count || ''}
                      onChange={(e) => handleInputChange('business_employee_count', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_annual_revenue">Annual Revenue</Label>
                    <Input
                      id="business_annual_revenue"
                      value={formData.business_annual_revenue || ''}
                      onChange={(e) => handleInputChange('business_annual_revenue', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label>Business Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.business_logo_url && (
                      <img 
                        src={formData.business_logo_url} 
                        alt="Business Logo" 
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('business_logo_url', e.target.files[0])}
                          className="hidden"
                          id="business-logo-upload"
                        />
                        <label
                          htmlFor="business-logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Social Media</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <Input
                        placeholder="Facebook page URL"
                        value={formData.business_social_media?.facebook || ''}
                        onChange={(e) => handleNestedInputChange('business_social_media', 'facebook', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <Input
                        placeholder="Instagram profile URL"
                        value={formData.business_social_media?.instagram || ''}
                        onChange={(e) => handleNestedInputChange('business_social_media', 'instagram', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <Input
                        placeholder="Twitter profile URL"
                        value={formData.business_social_media?.twitter || ''}
                        onChange={(e) => handleNestedInputChange('business_social_media', 'twitter', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <Input
                        placeholder="LinkedIn company page URL"
                        value={formData.business_social_media?.linkedin || ''}
                        onChange={(e) => handleNestedInputChange('business_social_media', 'linkedin', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="business_address">Business Address</Label>
                  <Textarea
                    id="business_address"
                    value={formData.business_address || ''}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="business_city">City</Label>
                    <Input
                      id="business_city"
                      value={formData.business_city || ''}
                      onChange={(e) => handleInputChange('business_city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_state">State</Label>
                    <Input
                      id="business_state"
                      value={formData.business_state || ''}
                      onChange={(e) => handleInputChange('business_state', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_country">Country</Label>
                    <Input
                      id="business_country"
                      value={formData.business_country || ''}
                      onChange={(e) => handleInputChange('business_country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_pincode">Pincode</Label>
                    <Input
                      id="business_pincode"
                      value={formData.business_pincode || ''}
                      onChange={(e) => handleInputChange('business_pincode', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input
                      id="business_phone"
                      value={formData.business_phone || ''}
                      onChange={(e) => handleInputChange('business_phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_email">Business Email</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={formData.business_email || ''}
                      onChange={(e) => handleInputChange('business_email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Information Tab */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="bank_account_number">Bank Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={formData.bank_account_number || ''}
                      onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name || ''}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="bank_ifsc_code">IFSC Code</Label>
                    <Input
                      id="bank_ifsc_code"
                      value={formData.bank_ifsc_code || ''}
                      onChange={(e) => handleInputChange('bank_ifsc_code', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bank_account_holder_name">Account Holder Name</Label>
                    <Input
                      id="bank_account_holder_name"
                      value={formData.bank_account_holder_name || ''}
                      onChange={(e) => handleInputChange('bank_account_holder_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label>Payment Methods</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'COD'].map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.payment_methods?.includes(method) || false}
                          onChange={(e) => handleArrayChange('payment_methods', method, e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-forest focus:ring-forest"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Shipping Methods</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Standard Shipping', 'Express Shipping', 'Overnight Shipping', 'Pickup Available'].map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.shipping_methods?.includes(method) || false}
                          onChange={(e) => handleArrayChange('shipping_methods', method, e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-forest focus:ring-forest"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Registration Certificate</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.business_documents?.registration_certificate ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Document uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload registration certificate</p>
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('registration_certificate', e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Tax Certificate</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.business_documents?.tax_certificate ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Document uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload tax certificate</p>
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('tax_certificate', e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>License Document</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.business_documents?.license_document ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Document uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload license document</p>
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('license_document', e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Bank Statement</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.business_documents?.bank_statement ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Document uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload bank statement</p>
                        </div>
                      )}
                      {isEditing && (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('bank_statement', e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfilePage;
