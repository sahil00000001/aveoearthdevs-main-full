import React from 'react';

export const metadata = {
  title: 'Privacy Policy - AveoEarth',
  description: 'Learn about how AveoEarth collects, uses, and protects your personal information. Read our comprehensive privacy policy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            How we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Who we are</h2>
              <div className="text-gray-700">
                <p>AveoEarth Impact Private Limited operates a marketplace connecting eco-conscious buyers with Sellers.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data we collect</h2>
              <div className="text-gray-700 space-y-3">
                <p><strong>Identity & Contact:</strong> name, email, phone, addresses.</p>
                <p><strong>Order & Payment Metadata:</strong> order details, instrument type (masked card/UPI VPA), bank responses. We do not store full card data.</p>
                <p><strong>Device/Technical:</strong> IP, device/browser identifiers, logs, cookies.</p>
                <p><strong>Communications:</strong> chats, emails, support tickets, call recordings (where notified).</p>
                <p><strong>Seller KYC (for Seller accounts):</strong> GSTIN, PAN, bank details, business proofs as required by law/PG underwriting.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Purpose & lawful bases</h2>
              <div className="text-gray-700 space-y-3">
                <p><strong>Fulfil orders, payments, refunds, deliveries</strong> (contract).</p>
                <p><strong>Fraud detection, risk scoring, disputes, audits</strong> (legal obligation/legitimate interests).</p>
                <p><strong>Customer support & grievance redressal</strong> (legal obligation/contract).</p>
                <p><strong>Personalisation, analytics, platform improvement</strong> (legitimate interests).</p>
                <p><strong>Marketing with consent</strong> (you can withdraw anytime).</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing</h2>
              <div className="text-gray-700">
                <p>Shared strictly as needed with Sellers, payment aggregators/banks/card networks, logistics partners, support vendors, analytics providers, and regulators/law enforcement when required by law. We do not sell personal data.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. International transfers</h2>
              <div className="text-gray-700">
                <p>Where partners store/process data outside India, we use reasonable contractual and technical safeguards consistent with Indian law.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Security</h2>
              <div className="text-gray-700">
                <p>HTTPS, encryption in transit/at rest, access controls, audits. Card handling via PCI-DSS certified partners with RBI-compliant tokenisation; AveoEarth never stores PAN/CVV.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retention</h2>
              <div className="text-gray-700">
                <p>Kept only as long as necessary for the purposes above and to meet legal/regulatory requirements (e.g., tax and dispute windows). On account deletion or contract end, we delete or anonymise subject to statutory retention.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your rights</h2>
              <div className="text-gray-700">
                <p>Access, correction, deletion (where permitted), portability (where feasible), consent withdrawal, and grievance redressal.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children</h2>
              <div className="text-gray-700">
                <p>The Platform is intended for 18+ users. We do not knowingly collect data from children.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes</h2>
              <div className="text-gray-700">
                <p>We may update this policy; material changes will be notified on the Platform.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact & Grievance</h2>
              <div className="text-gray-700 space-y-3">
                <p><strong>Support:</strong> support@aveoearth.com, +91-99100 77670.</p>
                <p><strong>Grievance Officer:</strong> Anand B, grievance@aveoearth.com, +91-99100 77670 (acknowledge within 48 hours; resolve within 1 month).</p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Last updated: 11-09-2025
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            If you have any questions about our Privacy Policy, please contact us at{' '}
            <a href="mailto:support@aveoearth.com" className="text-[#1a4032] hover:underline">
              support@aveoearth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
