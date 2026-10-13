'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { updateExpenseStatus, deleteExpense } from '@/app/actions/expenseActions';
import Link from 'next/link';

export default function ExpensesClient({ initialData, currentStatus }: { initialData: any[], currentStatus: string }) {
  const [expenses, setExpenses] = useState(initialData);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: 'status' | 'delete'; id: string; status?: string; message: string }>({ isOpen: false, action: 'delete', id: '', message: '' });


  useEffect(() => {
    setExpenses(initialData);
  }, [initialData, currentStatus]);

  const handleStatusUpdate = async (id: string, status: 'pending' | 'approved' | 'paid' | 'cancelled') => {
    const res = await updateExpenseStatus(id, status);
    if (res.success) {
      toast.success(`Expense marked as ${status}`);
      if (currentStatus !== 'all' && currentStatus !== status) {
        setExpenses(expenses.filter(e => e._id !== id));
      } else {
        setExpenses(expenses.map(e => e._id === id ? { ...e, status } : e));
      }
    } else {
      toast.error(res.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteExpense(id);
    if (res.success) {
      toast.success('Expense deleted');
      setExpenses(expenses.filter(e => e._id !== id));
    } else {
      toast.error(res.error || 'Operation failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'approved': return 'bg-blue-50 text-blue-700';
      case 'paid': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{currentStatus === 'all' ? 'All Expenses' : `${currentStatus} Expenses`}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your business expenses</p>
        </div>
        <Link href="/admin/expenses/add" className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors">
          + Add New Expense
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Date & Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(e => (
                <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {e.attachment && (
                        <a href={e.attachment} target="_blank" rel="noreferrer" className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors" title="View Attachment">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </a>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{e.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(e.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {e.category_id?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">৳{e.amount.toLocaleString()}</p>
                    {e.payment_method && <p className="text-xs text-gray-400 mt-0.5">{e.payment_method}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${getStatusColor(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedExpense(e)} title="View Details" className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded font-bold cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {e.status === 'pending' && (
                        <>
                          <button onClick={() => setConfirmModal({ isOpen: true, action: 'status', id: e._id, status: 'approved', message: 'Are you sure you want to approve this expense?' })} title="Approve" className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-bold cursor-pointer transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setConfirmModal({ isOpen: true, action: 'status', id: e._id, status: 'cancelled', message: 'Are you sure you want to cancel this expense?' })} title="Cancel" className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded font-bold cursor-pointer transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
                      {e.status === 'approved' && (
                        <>
                           <button onClick={() => setConfirmModal({ isOpen: true, action: 'status', id: e._id, status: 'paid', message: 'Are you sure you want to mark this expense as paid?' })} title="Mark Paid" className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded font-bold cursor-pointer transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </button>
                           <button onClick={() => setConfirmModal({ isOpen: true, action: 'status', id: e._id, status: 'cancelled', message: 'Are you sure you want to cancel this expense?' })} title="Cancel" className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded font-bold cursor-pointer transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </>
                      )}
                      {(e.status === 'cancelled' || e.status === 'paid') && (
                        <button onClick={() => setConfirmModal({ isOpen: true, action: 'delete', id: e._id, message: 'Are you sure you want to completely delete this expense record?' })} title="Delete" className="p-1.5 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded font-bold cursor-pointer transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">No expenses found for this status.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.action === 'delete' || confirmModal.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (confirmModal.action === 'delete') {
                    await handleDelete(confirmModal.id);
                  } else if (confirmModal.action === 'status' && confirmModal.status) {
                    await handleStatusUpdate(confirmModal.id, confirmModal.status as any);
                  }
                }} 
                className={`flex-1 py-3 font-bold rounded-xl text-white transition-colors ${confirmModal.action === 'delete' || confirmModal.status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-900'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Expense Details Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Expense Details</h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedExpense.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                      {selectedExpense.category_id?.name || 'Uncategorized'}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${getStatusColor(selectedExpense.status)}`}>
                      {selectedExpense.status}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl font-black text-gray-900">৳{selectedExpense.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 font-medium mt-1">{new Date(selectedExpense.date).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedExpense.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reference / TrxID</p>
                  <p className="font-semibold text-gray-900">{selectedExpense.reference_no || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Additional Notes</p>
                  <p className="font-medium text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {selectedExpense.notes || 'No additional notes provided.'}
                  </p>
                </div>
              </div>

              {selectedExpense.attachment && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attachment (Memo / Screenshot)</p>
                  <a href={selectedExpense.attachment} target="_blank" rel="noreferrer" className="block relative rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 max-w-sm">
                    <img src={selectedExpense.attachment} alt="Attachment" className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Open Full Image
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button onClick={() => setSelectedExpense(null)} className="px-6 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
