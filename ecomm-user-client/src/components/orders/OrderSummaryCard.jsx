import React from 'react'
import PropTypes from 'prop-types'

const OrderSummaryCard = ({
  id,
  paymentMethod,
  subtotal,
  discountPercent,
  shippingLabel,
  total,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 md:p-5">
      {/* Order ID + Payment Method with subtle horizontal row */}
      <div className="pb-3 mb-4 border-b border-gray-100">
        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase">
          <span>Order ID:</span>
          <span>Payment Method:</span>
        </div>
        <div className="flex justify-between mt-1 text-sm font-medium text-gray-900">
          <span>{id}</span>
          <span>{paymentMethod}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>{discountPercent}%</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className="text-green-600">{shippingLabel}</span>
        </div>
        <hr className="my-2 border-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-semibold">Total</span>
          <span className="text-green-600 font-bold text-lg">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

OrderSummaryCard.propTypes = {
  id: PropTypes.string.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  subtotal: PropTypes.number.isRequired,
  discountPercent: PropTypes.number.isRequired,
  shippingLabel: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
}

export default OrderSummaryCard
