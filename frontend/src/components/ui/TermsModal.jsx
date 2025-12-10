'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsScrolledToBottom(isAtBottom);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
            <p className="text-sm text-gray-600 mt-1">Please read carefully before proceeding</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="prose max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                DIGITAL ACCEPTANCE & BINDING CONSENT
              </h3>
              <p className="text-yellow-700 text-sm">
                <strong>IMPORTANT NOTICE:</strong> These Terms & Conditions ("Agreement") govern your use of the
                AveoEarth marketplace platform operated by AveoEarth Impact Private Limited ("AveoEarth",
                "Company", "we", "us").
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                <strong>BY CLICKING "I AGREE AND ACCEPT" BELOW, YOU ACKNOWLEDGE AND CONFIRM:</strong><br />
                This creates a LEGALLY BINDING contract under Indian law and your acceptance is recorded with
                timestamp, IP address, and digital audit trail as permitted by law.
              </p>
            </div>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. DEFINITIONS & INTERPRETATION</h3>
              
              <h4 className="text-md font-medium text-gray-800 mb-2">1.1 Key Definitions</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-3">
                <li><strong>"Platform":</strong> AveoEarth's online marketplace accessible at aveoearth.com and mobile applications</li>
                <li><strong>"Vendor":</strong> Any individual or entity selling products through the Platform</li>
                <li><strong>"Customer":</strong> End users purchasing products through the Platform</li>
                <li><strong>"Products":</strong> All goods, services, and digital content offered by Vendors</li>
                <li><strong>"Agreement":</strong> These Terms & Conditions including all referenced policies and addendums</li>
              </ul>

              <h4 className="text-md font-medium text-gray-800 mb-2">1.2 Relationship of Parties</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Vendors are independent contractors, not employees, agents, or partners of AveoEarth</li>
                <li>AveoEarth operates as a technology platform facilitator connecting Vendors with Customers</li>
                <li>AveoEarth is NOT a seller, buyer, distributor, or marketplace participant</li>
                <li>No joint venture, partnership, or agency relationship exists between the parties</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. VENDOR ONBOARDING & ENHANCED COMPLIANCE</h3>
              
              <h4 className="text-md font-medium text-gray-800 mb-2">2.1 Registration Requirements</h4>
              <p className="text-gray-700 text-sm mb-2">All Vendors must provide complete and accurate documentation:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-3">
                <li><strong>Basic KYC:</strong> PAN, GSTIN, Udyam Registration, Incorporation/Identity Proofs</li>
                <li><strong>Enhanced Verification:</strong> Beneficial ownership disclosure (25%+ shareholding)</li>
                <li><strong>Industry Licenses:</strong> Sector-specific permits, quality certifications where applicable</li>
                <li><strong>Financial Information:</strong> Bank account details, tax compliance certificates</li>
              </ul>

              <h4 className="text-md font-medium text-gray-800 mb-2">2.2 Ongoing Compliance Obligations</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Annual Re-verification:</strong> Complete documentation renewal within 30 days</li>
                <li><strong>Real-time Monitoring:</strong> Automated system alerts for compliance deviations</li>
                <li><strong>Additional Documentation:</strong> AveoEarth may demand supplementary documents</li>
                <li><strong>Compliance Training:</strong> Mandatory participation in platform training programs</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. PRODUCT & SERVICE STANDARDS</h3>
              
              <h4 className="text-md font-medium text-gray-800 mb-2">3.1 Product Quality & Authenticity</h4>
              <p className="text-gray-700 text-sm mb-2">Vendors warrant that all Products are:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-3">
                <li><strong>Genuine and Non-counterfeit</strong> with authentic manufacturer authorization</li>
                <li><strong>Legally Compliant</strong> with all applicable Indian laws and regulations</li>
                <li><strong>Quality Assured</strong> meeting BIS/ISI standards where applicable</li>
                <li><strong>Safely Packaged</strong> with appropriate labeling and handling instructions</li>
                <li><strong>Accurately Described</strong> with no misleading claims or representations</li>
              </ul>

              <h4 className="text-md font-medium text-gray-800 mb-2">3.2 Service Level Standards</h4>
              <p className="text-gray-700 text-sm mb-2">Vendors are expected to maintain high service standards including:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Timely Order Confirmation:</strong> Prompt acknowledgment of customer orders</li>
                <li><strong>Efficient Dispatch:</strong> Timely processing and shipment of products</li>
                <li><strong>Return Processing:</strong> Professional handling of customer returns and exchanges</li>
                <li><strong>Customer Rating Maintenance:</strong> Consistent delivery of satisfactory experience</li>
                <li><strong>Responsive Communication:</strong> Timely response to queries and communications</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. TIER-BASED BENEFITS & PAYMENT FRAMEWORK</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border border-gray-300 rounded p-3">
                  <h5 className="font-semibold text-green-600 text-sm mb-1">FREE TIER:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Basic platform access</li>
                    <li>Payment cycle: T+21 days</li>
                    <li>Basic customer support</li>
                  </ul>
                </div>
                
                <div className="border border-blue-300 rounded p-3">
                  <h5 className="font-semibold text-blue-600 text-sm mb-1">PREMIUM TIER:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Enhanced product visibility</li>
                    <li>Payment cycle: T+15 days</li>
                    <li>Priority customer support</li>
                  </ul>
                </div>
                
                <div className="border border-yellow-300 rounded p-3">
                  <h5 className="font-semibold text-yellow-600 text-sm mb-1">GOLD TIER:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Priority search placement</li>
                    <li>Payment cycle: T+10 days</li>
                    <li>Dedicated account manager</li>
                  </ul>
                </div>
                
                <div className="border border-purple-300 rounded p-3">
                  <h5 className="font-semibold text-purple-600 text-sm mb-1">PLATINUM TIER:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Maximum product visibility</li>
                    <li>Payment cycle: T+5 days</li>
                    <li>Premium account management</li>
                  </ul>
                </div>
              </div>

              <h4 className="text-md font-medium text-gray-800 mb-2">4.2 Payment Terms</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Payment Method:</strong> Electronic transfer to registered bank account only</li>
                <li><strong>Currency:</strong> Indian Rupees (INR) unless specifically agreed otherwise</li>
                <li><strong>Zero Commission:</strong> AveoEarth operates on a zero-commission model for product sales</li>
                <li><strong>Platform Fees:</strong> Applicable only for premium tier services</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. INTELLECTUAL PROPERTY PROTECTION</h3>
              
              <h4 className="text-md font-medium text-gray-800 mb-2">5.1 IP Warranties</h4>
              <p className="text-gray-700 text-sm mb-2">Vendor warrants and guarantees:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Ownership Rights:</strong> Full ownership or licensed rights to all Product IP</li>
                <li><strong>No Infringement:</strong> Products do not violate any patent, trademark, copyright</li>
                <li><strong>Authentic Authorization:</strong> Valid authorization from brand owners</li>
                <li><strong>Trade Secret Protection:</strong> No unauthorized use of confidential information</li>
              </ul>
            </section>

            <div className="bg-gray-50 border border-gray-200 rounded p-4 mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Contact Information</h4>
              <p className="text-gray-700 text-sm">
                For any questions regarding these Terms & Conditions, please contact our support team at{' '}
                <a href="mailto:support@aveoearth.com" className="text-blue-600 hover:text-blue-800 underline">
                  support@aveoearth.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {!isScrolledToBottom && (
                <span className="text-orange-600 font-medium">
                  ⚠️ Please scroll down to read the complete terms
                </span>
              )}
              {isScrolledToBottom && (
                <span className="text-green-600 font-medium">
                  ✅ You have read the complete terms
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
