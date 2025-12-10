import React from 'react';

export const metadata = {
  title: 'Terms & Conditions - AveoEarth',
  description: 'Read the terms and conditions for using AveoEarth platform. Learn about our policies, user responsibilities, and legal agreements.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-lg text-gray-600">
            Please read these terms carefully before using our platform.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Contract & Scope</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1.1</strong> These Terms govern your access to and use of www.aveoearth.com and associated apps (the "Platform") operated by AveoEarth Impact Private Limited ("AveoEarth", "we", "us"). By using the Platform, you agree to these Terms and the policies referenced here.</p>
                <p><strong>1.2</strong> AveoEarth operates a marketplace/intermediary. Listings are published by independent sellers ("Sellers"). Your purchase contract is with the Seller. AveoEarth provides payment processing, order routing, customer support and dispute facilitation.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility & Account</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>2.1</strong> You must be at least 18 years old and competent to contract.</p>
                <p><strong>2.2</strong> You are responsible for safeguarding your account and for all activities under it.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Listings, Pricing & Taxes</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1</strong> Prices, shipping charges, taxes, availability and delivery estimates are shown before payment; many are set by Sellers.</p>
                <p><strong>3.2</strong> If a material error in price/description is discovered, we or the Seller may cancel the order and refund.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders & Acceptance</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1</strong> Order confirmation is an acknowledgement, not acceptance. Acceptance occurs on dispatch (or on access/fulfilment for digital/services).</p>
                <p><strong>4.2</strong> We may cancel and refund for reasons including suspected fraud, regulatory restrictions, stock unavailability, address issues, force majeure, or as required by law.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payments & Security</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>5.1</strong> Payments are processed by RBI-regulated payment aggregators/banks. AveoEarth does not store full card details; saved cards are tokens issued by our payment partners in line with RBI tokenisation norms.</p>
                <p><strong>5.2</strong> Accepted instruments and any surcharges are disclosed at checkout. Payment failures and refunds follow bank/network rules and our Refunds & Cancellations Policy.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Delivery & Risk of Loss</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1</strong> Delivery is performed by Sellers or logistics partners. Risk passes to you on delivery (or on digital/service fulfilment). Inspect on delivery and report issues per the Refunds & Cancellations Policy.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Returns, Replacements & Refunds</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1</strong> Options, windows and exclusions are set out in the Refunds & Cancellations Policy and/or item page.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Marketplace Role; Seller Responsibility</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>8.1</strong> AveoEarth is an intermediary. Sellers are solely responsible for product quality, description accuracy, warranties and statutory compliance.</p>
                <p><strong>8.2</strong> AveoEarth may facilitate support/refunds but is not the seller of record unless explicitly stated.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. User Content & Acceptable Use</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>9.1</strong> Reviews/questions must be lawful and truthful. No infringing/defamatory/obscene content; no scraping, reverse engineering or security circumvention.</p>
                <p><strong>9.2</strong> By posting content you grant us a licence to use/display it for Platform operations.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. IP & Ownership</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>10.1</strong> All Platform content, trademarks and software are owned by AveoEarth or licensors. No rights are granted except to use the Platform.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Warranty Disclaimer</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>11.1</strong> Except as required by law, the Platform is provided "as is", without implied warranties of merchantability/fitness or uninterrupted error-free operation.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>12.1</strong> To the maximum extent permitted by law, AveoEarth's aggregate liability for any claim shall not exceed the amount you paid for the relevant order.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnity</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>13.1</strong> You agree to indemnify AveoEarth against claims arising from your breach of these Terms or violation of law/third-party rights.</p>
              </div>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Compliance & Sanctions</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>14.1</strong> You must comply with applicable laws (including export controls/sanctions). We may restrict access where required by law or risk policy.</p>
              </div>
            </section>

            {/* Section 15 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes & Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>15.1</strong> We may modify these Terms/policies; continued use after changes constitutes acceptance. We may suspend/terminate accounts for policy or law violations.</p>
              </div>
            </section>

            {/* Section 16 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Governing Law & Dispute Resolution</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>16.1</strong> Indian law governs. Courts at Noida, Uttar Pradesh have exclusive jurisdiction, subject to statutory consumer remedies.</p>
              </div>
            </section>

            {/* Section 17 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact & Grievance</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>17.1</strong> Support: support@aveoearth.com, +91-99100 77670.</p>
                <p><strong>17.2</strong> Grievance Officer: Anand B, grievance@aveoearth.com, +91-99100 77670 (acknowledge within 48 hours; resolve within 1 month).</p>
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
            If you have any questions about these Terms & Conditions, please contact us at{' '}
            <a href="mailto:support@aveoearth.com" className="text-[#1a4032] hover:underline">
              support@aveoearth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
