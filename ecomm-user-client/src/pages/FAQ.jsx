import { Link } from 'react-router-dom';

export default function FAQ() {
  const faqs = [
    { q: "How can I place an order?", a: "Browse our products, add items to your cart, and proceed to checkout. You can pay using credit/debit card or other available payment methods." },
    { q: "What is your delivery time?", a: "We typically deliver within 3–7 business days depending on your location. You will receive a confirmation email with tracking details once your order is shipped." },
    { q: "Can I cancel or modify my order?", a: "You can cancel or modify your order within 1 hour of placement. After that, please contact our support team and we'll do our best to assist you." },
    { q: "What is your return policy?", a: "We offer a 7-day return policy for most products. Items must be unused and in original packaging. Contact us for a return authorization." },
    { q: "How do I track my order?", a: "Go to 'My Account' > 'Order History' and click on your order to view tracking status and shipment details." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-10">Find answers to common questions about Ecobazar.</p>

        <div className="space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-gray-500 text-sm">
          Still have questions? <Link to="/contact" className="text-green-600 hover:underline font-medium">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
