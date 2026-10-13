'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InventoryOverviewClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = initialProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Current inventory levels for all products</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => {
                const isLow = product.stock <= 5;
                const isOut = product.stock === 0;
                return (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {product.mainImages?.[0] && <img src={product.mainImages[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">SKU: {product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isOut ? (
                        <span className="inline-flex px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md">Out of Stock</span>
                      ) : isLow ? (
                        <span className="inline-flex px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-md">Low Stock</span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-lg font-bold ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-gray-900'}`}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admin/inventory/manage?type=in&id=${product._id}`} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded font-medium text-xs cursor-pointer">Stock In</Link>
                        <Link href={`/admin/inventory/manage?type=out&id=${product._id}`} className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium text-xs cursor-pointer">Stock Out</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="text-center py-12 text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
