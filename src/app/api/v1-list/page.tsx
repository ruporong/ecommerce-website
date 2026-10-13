import React from 'react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mobile App API Documentation' };

export default function ApiList() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/products',
      description: 'Fetch all active products with pagination.',
      params: '?page=1&limit=20&category=ID',
      response: '{ "success": true, "data": [...], "meta": { "total": 100, "page": 1 } }'
    },
    {
      method: 'GET',
      path: '/api/v1/categories',
      description: 'Fetch all categories.',
      params: 'None',
      response: '{ "success": true, "data": [...] }'
    },
    {
      method: 'POST',
      path: '/api/v1/checkout',
      description: 'Place a new order from the mobile app.',
      params: 'Body JSON',
      body: '{\n  "customer_name": "John Doe",\n  "customer_phone": "017...",\n  "customer_address": "Dhaka",\n  "payment_method": "COD",\n  "items": [{ "product_id": "123", "quantity": 1 }]\n}',
      response: '{ "success": true, "order_id": "API-123456", "message": "Order placed successfully" }'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-8 md:p-16 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Mobile App API Documentation (v1)</h1>
          <p className="text-zinc-500 mt-2">REST API endpoints designed for Flutter / React Native integration.</p>
        </div>

        <div className="space-y-6">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-semibold text-zinc-800">{ep.path}</code>
              </div>
              
              <div className="p-6 space-y-4 text-sm">
                <p className="text-zinc-600">{ep.description}</p>
                
                {ep.method === 'GET' ? (
                  <div>
                    <h4 className="font-semibold text-zinc-700 mb-1">Query Parameters:</h4>
                    <code className="bg-zinc-100 px-2 py-1 rounded text-zinc-600">{ep.params}</code>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-zinc-700 mb-1">Request Body (JSON):</h4>
                    <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                      {ep.body}
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-zinc-700 mb-1">Success Response:</h4>
                  <pre className="bg-zinc-100 text-zinc-700 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-zinc-200">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-zinc-400 pt-8">
          eComBuild v1.0 • JSON REST APIs
        </div>

      </div>
    </div>
  );
}
