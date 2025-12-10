import React from 'react';

export const metadata = {
  title: 'Contact Us - AveoEarth',
  description: 'Get in touch with AveoEarth Impact Private Limited. Find our contact information, support details, and grievance redressal information.',
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">
            We're here to help you with any questions or concerns about our sustainable products.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Business Name</h3>
                <p className="text-gray-700">AveoEarth Impact Private Limited</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Registered & Operational Address</h3>
                <p className="text-gray-700">C-129, Sector 26, Noida, Uttar Pradesh, 201301</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-700">+91-99100 77670</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Support Email</h3>
                <p className="text-gray-700">support@aveoearth.com</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Support Hours</h3>
                <p className="text-gray-700">Mon–Sat, 10:00–18:00 IST (excluding public holidays)</p>
              </div>
            </div>
          </div>

          {/* Grievance Redressal */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Grievance Redressal (Consumer Protection (E-Commerce) Rules, 2020)
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Grievance Officer</h3>
                  <p className="text-gray-700 mb-4">Anand B</p>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-700 mb-4">grievance@aveoearth.com</p>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-700">+91-99100 77670</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Response Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Acknowledgement:</span>
                      <span className="text-gray-700 font-medium">within 48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Resolution:</span>
                      <span className="text-gray-700 font-medium">within 1 month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            Last updated: 11-09-2025
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about our products, orders, or need assistance with anything else,
            please don't hesitate to reach out to us using the contact information above.
          </p>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              We're committed to providing excellent customer service and ensuring your satisfaction
              with our sustainable products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
