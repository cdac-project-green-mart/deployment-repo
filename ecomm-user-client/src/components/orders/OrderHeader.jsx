import React from 'react'
import PropTypes from 'prop-types'

const OrderHeader = ({ date, productsCount, onBackClick }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Order Details</h1>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{date}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{productsCount} Products</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackClick}
        className="text-sm font-medium text-green-600 hover:text-green-700"
      >
        Back to List
      </button>
    </div>
  )
}

OrderHeader.propTypes = {
  date: PropTypes.string.isRequired,
  productsCount: PropTypes.number.isRequired,
  onBackClick: PropTypes.func,
}

export default OrderHeader
