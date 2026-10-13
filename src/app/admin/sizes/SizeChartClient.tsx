'use client';

import { useState } from 'react';
import { saveSizeChart, deleteSizeChart, toggleSizeChartStatus } from '@/app/actions/sizeChartActions';
import toast from 'react-hot-toast';

export default function SizeChartClient({ initialData }: { initialData: any[] }) {
  const [items, setItems] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [columns, setColumns] = useState<string[]>(['Chest', 'Length']);
  const [sizes, setSizes] = useState<{name: string, measurements: Record<string, string>}[]>([
    { name: 'M', measurements: { 'Chest': '', 'Length': '' } }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom prompt state
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const openModal = (item: any = null) => {
    if (item) {
      setEditingId(item._id);
      setName(item.name);
      setIsActive(item.is_active !== false);
      setColumns([...item.columns]);
      setSizes(item.sizes.map((s: any) => ({
        name: s.name,
        measurements: { ...s.measurements }
      })));
    } else {
      setEditingId(null);
      setName('');
      setIsActive(true);
      setColumns(['Chest (round)', 'Length', 'Sleeve']);
      setSizes([
        { name: 'M', measurements: {} },
        { name: 'L', measurements: {} },
        { name: 'XL', measurements: {} }
      ]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openAddColumnModal = () => {
    setNewColumnName('');
    setIsAddColumnModalOpen(true);
  };

  const confirmAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    if (columns.includes(newColumnName.trim())) {
      toast.error("Column already exists");
      return;
    }
    setColumns([...columns, newColumnName.trim()]);
    setIsAddColumnModalOpen(false);
    setNewColumnName('');
  };

  const removeColumn = (colToRemove: string) => {
    setColumns(columns.filter(c => c !== colToRemove));
    // Clean up measurements
    const newSizes = sizes.map(s => {
      const newM = { ...s.measurements };
      delete newM[colToRemove];
      return { ...s, measurements: newM };
    });
    setSizes(newSizes);
  };

  const addSizeRow = () => {
    setSizes([...sizes, { name: '', measurements: {} }]);
  };

  const removeSizeRow = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  const updateSizeName = (index: number, val: string) => {
    const newSizes = [...sizes];
    newSizes[index].name = val;
    setSizes(newSizes);
  };

  const updateMeasurement = (rowIndex: number, colName: string, val: string) => {
    const newSizes = [...sizes];
    if (!newSizes[rowIndex].measurements) newSizes[rowIndex].measurements = {};
    newSizes[rowIndex].measurements[colName] = val;
    setSizes(newSizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Model Name is required');
    if (columns.length === 0) return toast.error('At least one measurement column is required');
    if (sizes.length === 0) return toast.error('At least one size row is required');
    
    // Validate sizes have names
    if (sizes.some(s => !s.name.trim())) return toast.error('All size rows must have a name (e.g. S, M, L)');

    setIsLoading(true);
    const data = {
      id: editingId,
      name: name.trim(),
      columns,
      sizes,
      is_active: isActive
    };
    
    const res = await saveSizeChart(data);
    
    if (res.success) {
      toast.success('Size chart saved successfully');
      window.location.reload();
    } else {
      toast.error(res.error || 'Failed to save');
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setItems(items.map(i => i._id === id ? { ...i, is_active: !currentStatus } : i));
    const res = await toggleSizeChartStatus(id, !currentStatus);
    if (res.error) {
      toast.error(res.error);
      setItems(items.map(i => i._id === id ? { ...i, is_active: currentStatus } : i));
    } else {
      toast.success(!currentStatus ? 'Activated' : 'Deactivated');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const res = await deleteSizeChart(itemToDelete);
    if (res.success) {
      toast.success('Deleted successfully');
      setItems(items.filter(i => i._id !== itemToDelete));
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setIsDeleting(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Size Charts</h2>
          <p className="text-sm text-gray-500 mt-1">Manage advanced size guides for your products.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Size Chart
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-5">Model Name</th>
              <th className="px-6 py-5">Sizes Available</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No Size Charts found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <span className="text-base">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.sizes.map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer" title={item.is_active ? 'Deactivate' : 'Activate'}>
                      <input type="checkbox" className="sr-only peer" checked={item.is_active !== false} onChange={() => toggleStatus(item._id, item.is_active !== false)} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => openModal(item)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setItemToDelete(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h3 className="font-bold text-gray-900">{editingId ? 'Edit Size Chart' : 'Add Size Chart'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none"
                    placeholder="e.g. Men's T-Shirt, Panjabi"
                    required
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Active Status</span>
                  </label>
                </div>
              </div>

              {/* Table Builder */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-medium text-gray-700">Measurements Grid</label>
                  <button type="button" onClick={openAddColumnModal} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Column
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-3 font-semibold text-gray-700 w-32 border-r border-gray-200">Size</th>
                        {columns.map((col, idx) => (
                          <th key={idx} className="p-3 font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                            <div className="flex justify-between items-center">
                              <span>{col}</span>
                              <button type="button" onClick={() => removeColumn(col)} className="text-gray-400 hover:text-red-500" title="Remove Column">✕</button>
                            </div>
                          </th>
                        ))}
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {sizes.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          <td className="p-2 border-r border-gray-200 bg-gray-50/30">
                            <input 
                              type="text" 
                              value={row.name}
                              onChange={e => updateSizeName(rowIdx, e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-black outline-none uppercase"
                              placeholder="e.g. M, L"
                              required
                            />
                          </td>
                          {columns.map((col, colIdx) => (
                            <td key={colIdx} className="p-2 border-r border-gray-200">
                              <input 
                                type="text" 
                                value={row.measurements?.[col] || ''}
                                onChange={e => updateMeasurement(rowIdx, col, e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-black outline-none font-mono text-sm"
                                placeholder="e.g. 40"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <button 
                              type="button" 
                              onClick={() => removeSizeRow(rowIdx)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Remove Row"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <button type="button" onClick={addSizeRow} className="text-sm text-black hover:text-gray-700 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Size Row
                  </button>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors">
                  {isLoading ? 'Saving...' : 'Save Size Chart'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Size Chart</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this size chart? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Add Column Modal */}
      {isAddColumnModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <h3 className="font-bold text-gray-900">Add New Column</h3>
              <button onClick={() => setIsAddColumnModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors">✕</button>
            </div>
            <form onSubmit={confirmAddColumn} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Column Name</label>
                <input 
                  type="text" 
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none"
                  placeholder="e.g. Shoulder, Waist"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddColumnModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

