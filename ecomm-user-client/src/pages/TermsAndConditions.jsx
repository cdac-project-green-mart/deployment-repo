import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using Ecobazar, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. Use of Service</h2>
            <p>You agree to use our platform only for lawful purposes. You must not use the service in any way that could harm, disable, or impair the website or interfere with others' use.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Account & Orders</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. All orders placed through your account are your responsibility. We reserve the right to refuse or cancel orders at our discretion.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. Pricing & Payment</h2>
            <p>All prices are displayed in INR and are subject to change without notice. Payment must be made in full at the time of purchase. We accept credit/debit cards and other methods as displayed at checkout.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">5. Shipping & Delivery</h2>
            <p>Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. We are not responsible for delays caused by shipping carriers or external factors.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">6. Returns & Refunds</h2>
            <p>Returns are subject to our return policy. Refunds will be processed within 7–14 business days of receiving the returned item. Some items may be non-returnable.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
            <p>Ecobazar shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service or any products purchased.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">8. Changes</h2>
            <p>We may update these Terms at any time. Continued use of the service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <p className="pt-4 border-t text-gray-500">
            For questions, contact us at <Link to="/contact" className="text-green-600 hover:underline">Contact Us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
