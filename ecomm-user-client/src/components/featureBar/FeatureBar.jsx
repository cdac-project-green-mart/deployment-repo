import React from 'react'
import support from '../../assets/support.png'
import truck from '../../assets/truck.png'
import payment from '../../assets/payment.png'
import moneyback from '../../assets/money-back.png'

export default function FeatureBar() {
  const items = [
    {
      icon: truck,
      title: 'Free Shipping',
      desc: 'Free shipping on all your order',
    },
    {
      icon: support,
      title: 'Customer Support 24/7',
      desc: 'Instant access to Support',
    },
    {
      icon: payment,
      title: '100% Secure Payment',
      desc: 'We ensure your money is safe',
    },
    {
      icon: moneyback,
      title: 'Money-Back Guarantee',
      desc: '30 Days Money-Back Guarantee',
    },
  ]

  return (
    <div className="bg-white shadow-md  rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <img src={item.icon} alt="" className="w-10" />
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
