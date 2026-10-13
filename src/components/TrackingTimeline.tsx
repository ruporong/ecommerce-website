import React from 'react';

export default function TrackingTimeline({ 
  status, 
  courierProvider, courierStatus, courierConsignmentId 
}: { 
  status: string, 
  courierProvider?: string, courierStatus?: string, courierConsignmentId?: string 
}) {
  
  // Define steps
  const steps = [
    { key: 'pending', label: 'Placed', icon: '📝' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  // Map database status to index
  let currentIndex = 0;
  if (status === 'processing') currentIndex = 1;
  else if (status === 'shipped') currentIndex = 2;
  else if (status === 'delivered') currentIndex = 3;
  else if (status === 'cancelled') currentIndex = -1; // special case

  if (status === 'cancelled') {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">❌</div>
        <h3 className="font-bold text-red-900 text-lg">Order Cancelled</h3>
        <p className="text-red-700 text-sm mt-1">This order has been cancelled and cannot be tracked further.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        
        {/* Progress Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-900 rounded-full z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-gray-200' : ''}`}
              >
                {step.icon}
              </div>
              <div className="absolute top-14 text-center w-24">
                <span className={`text-xs md:text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra space for the labels below */}
      <div className="h-12 md:h-10"></div>

      {/* Steadfast Extra Info */}
      {status === 'shipped' && courierConsignmentId && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-blue-900">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
            <div>
              <p className="text-sm font-bold">Courier: {courierProvider || "Steadfast"}</p>
              {courierStatus && <p className="text-xs text-blue-700 capitalize">Status: {courierStatus}</p>}
            </div>
          </div>
          <a 
            href={`https://steadfast.com.bd/t/${courierConsignmentId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
          >
            Track on Steadfast
          </a>
        </div>
      )}
    </div>
  );
}
