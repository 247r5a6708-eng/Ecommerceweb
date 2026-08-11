import { CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react';

interface OrderStatusStepperProps {
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded' | string;
}

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  if (status === 'cancelled' || status === 'returned' || status === 'refunded') {
    return (
      <div className="flex items-center text-red-500 py-4 px-2">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="font-bold text-red-600 dark:text-red-400">Order {status.charAt(0).toUpperCase() + status.slice(1)}</p>
          <p className="text-xs text-red-500 dark:text-red-300 mt-0.5">This order is no longer active.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'processing', label: 'Processing', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Package },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  let currentStepIndex = 0;
  if (status === 'processing') currentStepIndex = 0;
  else if (status === 'shipped') currentStepIndex = 1;
  // If we had 'out for delivery' status it would be 2. Let's just assume shipped covers 1 and 2 if we want to fake it, or delivered is 3.
  else if (status === 'delivered') currentStepIndex = 3;

  return (
    <div className="py-8 px-4 sm:px-8 w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Line behind steps */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative flex justify-between items-center w-full">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${
                    isCompleted 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                      : 'bg-white dark:bg-[#1a1a24] border-2 border-gray-300 dark:border-gray-700 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="mt-4 absolute top-8 sm:top-10 text-center w-24 -ml-12 left-1/2">
                  <span className={`text-[10px] sm:text-xs font-semibold ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400' :
                    isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
