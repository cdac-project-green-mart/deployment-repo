import React from 'react'
import PropTypes from 'prop-types'

const AddressBlock = ({ title, customer }) => {
  return (
    <div className="p-4 md:p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">{title}</h2>
      <p className="font-semibold text-gray-900 mb-1">{customer.name}</p>
      <p className="text-sm text-gray-600 mb-3">{customer.addressLine1}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <div>
          <span className="font-semibold">Email</span>
          <span className="block text-gray-600">{customer.email}</span>
        </div>
        <div className="pt-1">
          <span className="font-semibold">Phone</span>
          <span className="block text-gray-600">{customer.phone}</span>
        </div>
      </div>
    </div>
  )
}

AddressBlock.propTypes = {
  title: PropTypes.string.isRequired,
  customer: PropTypes.shape({
    name: PropTypes.string.isRequired,
    addressLine1: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }).isRequired,
}

const OrderAddressesCard = ({ customer }) => {
  return (
    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-gray-100">
          <AddressBlock title="Billing Address" customer={customer} />
        </div>
        <div>
          <AddressBlock title="Shipping Address" customer={customer} />
        </div>
      </div>
    </div>
  )
}

OrderAddressesCard.propTypes = {
  customer: PropTypes.shape({
    name: PropTypes.string.isRequired,
    addressLine1: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }).isRequired,
}

export default OrderAddressesCard
