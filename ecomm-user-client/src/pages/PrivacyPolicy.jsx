import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email address, shipping address, phone number, and payment details when you create an account or place an order.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>We use your information to process orders, communicate with you, improve our services, send promotional offers (with your consent), and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share data with payment processors, shipping partners, and service providers necessary to fulfill your orders. We may disclose information when required by law.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. Data Security</h2>
            <p>We use industry-standard security measures to protect your data. Payment information is encrypted and processed by secure third-party payment gateways.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">5. Cookies & Tracking</h2>
            <p>We use cookies and similar technologies to improve your experience, analyze site traffic, and personalize content. You can manage cookie preferences in your browser settings.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">7. Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide services, comply with legal obligations, and resolve disputes.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website.</p>
          </section>

          <p className="pt-4 border-t text-gray-500">
            For privacy-related inquiries, please <Link to="/contact" className="text-green-600 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
