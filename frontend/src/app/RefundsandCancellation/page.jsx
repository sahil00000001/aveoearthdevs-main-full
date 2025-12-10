import React from 'react';

export const metadata = {
  title: 'Shipping & Delivery | Refunds & Cancellations - AveoEarth',
  description: 'Learn about our shipping, delivery, refunds, and cancellation policies. Understand timelines, charges, and return procedures.',
};

export default function RefundsAndCancellationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Delivery | Refunds & Cancellations</h1>
          <p className="text-lg text-gray-600">
            Understand our policies for shipping, delivery, returns, and refunds.
          </p>
        </div>

        {/* Shipping & Delivery Policy */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
            Shipping & Delivery Policy
          </h2>

          <div className="prose prose-lg max-w-none">

            {/* Section 1 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Coverage & Modes</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>1.1</strong> Deliveries are performed by Sellers or logistics partners to serviceable pincodes in India. Some products may have location-based restrictions (visible on the PDP/checkout).</p>
                <p><strong>1.2</strong> Digital/services: fulfilment occurs by email, download link, or account activation.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Timelines</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>2.1</strong> Dispatch: typically within 1–2 business days of order acceptance unless otherwise stated.</p>
                <p><strong>2.2</strong> Delivery: usually 3–7 business days post-dispatch depending on pincode, carrier capacity, and Seller location. Delivery estimates are shown at checkout and in order tracking.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Charges</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>3.1</strong> Shipping/handling fees (if any) are displayed at checkout; promotions or free-shipping thresholds may apply per Seller.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Tracking & Attempts</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>4.1</strong> Tracking details and status updates will be shared. Carriers may make up to 3 attempts; undelivered shipments may be marked RTO (Return to Origin).</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Risk of Loss & Title</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>5.1</strong> Risk and title pass on delivery to the shipping address (or on digital/service fulfilment). Please refuse open/visibly damaged packages and report issues within 48 hours to support@aveoearth.com with photos.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Delays & Force Majeure</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>6.1</strong> Weather, strikes, containment zones, regulatory checks, or force majeure may affect timelines. We will keep you informed and attempt expedited redelivery or refund, as applicable.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Cross-border</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>7.1</strong> Unless explicitly stated, we do not ship internationally.</p>
              </div>
            </section>

            {/* Contact */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Contact:</strong> support@aveoearth.com, +91-99100 77670
              </p>
            </div>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Last updated: 11-09-2025
              </p>
            </div>
          </div>
        </div>

        {/* Refunds & Cancellations Policy */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
            Refunds & Cancellations Policy
          </h2>

          <div className="prose prose-lg max-w-none">

            {/* Section 1 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Order Cancellation (Before Dispatch/Fulfilment)</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>1.1</strong> You may cancel an order from your account or by contacting support@aveoearth.com before dispatch (or before digital/service fulfilment). Approved cancellations receive a full refund.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Returns & Replacements (After Delivery)</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>2.1</strong> Standard return window: 7 days from delivery for eligible items, unless the PDP states a different window.</p>
                <p><strong>2.2</strong> Item must be unused, in original condition with tags/accessories/IMEI intact and in the original packaging.</p>
                <p><strong>2.3</strong> After a successful quality check, you may choose refund to original source or replacement (subject to stock).</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Non-returnable/Non-cancellable Items</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>3.1</strong> Perishables; hygiene/consumables (opened); intimate or personal-care items; made-to-order/customised goods; "final sale" items; downloadable/digital products once delivered/activated; items damaged due to misuse; serial/IMEI-mismatched returns.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Damage/Shortage on Delivery</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>4.1</strong> Report within 48 hours to support@aveoearth.com with photos/unboxing video (if available). We may arrange pickup/inspection and process replacement/refund as applicable.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Method & Timelines</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>5.1</strong> Refunds are issued to the original payment method only.</p>
                <p><strong>5.2</strong> On approval, we initiate refunds within 48 hours. Bank/card/UPI credit typically reflects in 5–7 working days (subject to issuer/network).</p>
                <p><strong>5.3</strong> For COD (if offered), refunds are made to a verified bank account/UPI you provide.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Return Logistics</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>6.1</strong> We may offer pickup; if pickup isn't available, use a trackable courier and share proof. Postage for approved returns is reimbursed as per Seller/Platform rules.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Abuse & Fraud</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>7.1</strong> Returns are monitored. Excessive/abusive returns, wardrobing or fraud may lead to account limitations or refusal of service as permitted by law.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Marketplace Clarification</h3>
              <div className="text-gray-700 space-y-3">
                <p><strong>8.1</strong> AveoEarth facilitates returns between you and the Seller. Where a Seller policy provides better terms than ours, the better terms prevail for that item.</p>
              </div>
            </section>

            {/* Contact & Grievance */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Contact & Grievance:</strong> support@aveoearth.com | Grievance Officer: Anand B, grievance@aveoearth.com
              </p>
            </div>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Last updated: 11-09-2025
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            If you have any questions about our policies, please contact us at{' '}
            <a href="mailto:support@aveoearth.com" className="text-[#1a4032] hover:underline">
              support@aveoearth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
