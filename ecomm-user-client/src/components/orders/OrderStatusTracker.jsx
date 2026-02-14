import React from 'react'
import PropTypes from 'prop-types'

const steps = [
  { id: 1, label: 'Order received' },
  { id: 2, label: 'Processing' },
  { id: 3, label: 'On the way' },
  { id: 4, label: 'Delivered' },
]

const OrderStatusTracker = ({ statusStep }) => {
  const clampedStep = Math.min(Math.max(statusStep, 0), steps.length)

  // Progress percentage between first and last step
  const progress = steps.length > 1 ? ((clampedStep - 1) / (steps.length - 1)) * 100 : 0

  return (
    <div className="bg-white border border-gray-100 rounded-lg px-6 py-5 mb-6">
      <div className="relative flex items-center justify-between">
        {/* Track bar spanning between first and last step centers */}
        <div
          className="absolute top-5 h-1 bg-gray-100 -translate-y-1/2 rounded-full"
          style={{ left: '12.5%', right: '12.5%' }}
        >
          {/* Filled progress */}
          <div
            className="h-1 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < clampedStep
          const isActive = step.id === clampedStep

          return (
            <div key={step.id} className="flex flex-col items-center z-10 w-1/4">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm ${isCompleted || isActive
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                  }`}
              >
                {isCompleted ? '✓' : step.id.toString().padStart(2, '0')}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${isCompleted || isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

OrderStatusTracker.propTypes = {
  statusStep: PropTypes.number.isRequired, // 0–4 (0 = cancelled/failed)
}

export default OrderStatusTracker
