'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { saveSettings } from '@/app/actions/settingsActions';
import { usePathname } from 'next/navigation';

export type SettingField = {
  hint?: string;
  name: string;
  label: string;
  type?: 'text' | 'password' | 'textarea' | 'number' | 'image' | 'color' | 'select' | 'switch';
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  options?: { label: string, value: string }[];
};

export type SettingsGroup = {
  title: string;
  description?: string;
  columns?: 1 | 2 | 3;
  fields: SettingField[];
};

export default function GenericSettingsClient({ 
  title, 
  description, 
  groups, 
  initialData,
  cardLayout = 'stack'
}: { 
  title: string; 
  description?: string; 
  groups: SettingsGroup[]; 
  initialData: Record<string, string>;
  cardLayout?: 'stack' | 'grid';
}) {
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Keep track of image previews
  const [previews, setPreviews] = useState<Record<string, string>>(initialData);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (fieldName: string) => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
    const fileInput = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `${fieldName}_deleted`;
    hiddenInput.value = 'true';
    fileInput?.parentNode?.appendChild(hiddenInput);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, groupTitle: string) => {
    e.preventDefault();
    setLoadingGroup(groupTitle);
    const formData = new FormData(e.currentTarget);
    const res = await saveSettings(formData, pathname);
    setLoadingGroup(null);
    
    if (res.success) {
      toast.success(`${groupTitle} saved successfully`);
    } else {
      toast.error(res.error || `Failed to save ${groupTitle}`);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>

      <div className={cardLayout === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-6 items-start" : "space-y-6"}>
        {groups.map((group, idx) => (
          <form key={idx} onSubmit={(e) => handleSubmit(e, group.title)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{group.title}</h3>
              {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
            </div>
            <div className={`p-6 md:p-8 grid grid-cols-1 ${group.columns === 1 ? 'md:grid-cols-1' : group.columns === 3 ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'} gap-x-8 gap-y-8`}>
              {group.fields.map(field => (
                <div key={field.name} className={`flex flex-col ${field.type === 'textarea' ? (group.columns === 3 ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2') : ''}`}>
                  {field.type !== 'switch' && <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    {field.description && <p className="text-xs text-gray-500 mb-3">{field.description}</p>}
                  </div>}
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.name}
                      defaultValue={initialData[field.name] || ''}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all text-sm mt-auto"
                    />
                  ) : field.type === 'select' ? (
                    <div className="relative mt-auto">
                      <select 
                        name={field.name}
                        defaultValue={initialData[field.name] || field.defaultValue || ''}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all appearance-none bg-white"
                      >
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  ) : field.type === 'image' ? (
                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-white p-6 text-center group relative hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[240px]">
                      {previews[field.name] && (
                        <div className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-4 group/preview">
                          <img src={previews[field.name]} alt="Preview" className="w-full h-full object-contain p-2" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); removeImage(field.name); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors z-10 shadow-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      )}
                      
                      <label className="cursor-pointer flex flex-col items-center w-full mt-auto">
                        <div className="text-gray-400 mb-3 group-hover:text-gray-600 transition-colors">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 7.5c-1.1-3.2-4.1-5.5-7.5-5.5-3.4 0-6.4 2.3-7.5 5.5C1.1 8.2 0 9.9 0 12c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5 0-2.1-1.1-3.8-2.5-4.5zM12 7l4 4h-3v4h-2v-4H8l4-4z"/></svg>
                        </div>
                        <p className="font-semibold text-gray-700">Drag files here or <span className="text-orange-500">browse</span></p>
                        
                        <p className="text-xs text-gray-400 mt-1">Supported Files: .png, .jpg, .jpeg</p>
                        {field.hint && <p className="text-red-500 text-[11px] text-center font-bold mt-2">{field.hint}</p>}

                        
                        <input 
                          type="file" 
                          name={field.name}
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, field.name)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : field.type === 'color' ? (
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-300 flex-shrink-0 cursor-pointer shadow-sm">
                        <input 
                          type="color"
                          defaultValue={initialData[field.name] || field.defaultValue || '#000000'}
                          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                          onChange={(e) => {
                            const textInput = e.target.parentElement?.nextElementSibling as HTMLInputElement;
                            if (textInput) textInput.value = e.target.value;
                          }}
                        />
                      </div>
                      <input 
                        type="text"
                        name={field.name}
                        defaultValue={initialData[field.name] || field.defaultValue || '#000000'}
                        placeholder="#000000"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none transition-all font-mono text-sm uppercase"
                        onChange={(e) => {
                          const colorInput = e.target.previousElementSibling?.querySelector('input[type="color"]') as HTMLInputElement;
                          if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            colorInput.value = e.target.value;
                          }
                        }}
                      />
                    </div>
                  ) : field.type === 'switch' ? (
                    <div className="flex items-center mt-auto py-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name={field.name}
                          value="true"
                          defaultChecked={initialData[field.name] === 'true'} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">{field.label}</span>
                      </label>
                      <input type="hidden" name={`${field.name}_exists`} value="1" />
                    </div>
                  ) : (
                    <input 
                      type={field.type || 'text'}
                      name={field.name}
                      defaultValue={initialData[field.name] || field.defaultValue || ''}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all mt-auto"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-4 px-6 md:px-8 border-t border-gray-100 bg-gray-50/30 flex justify-end">
              <button 
                type="submit"
                disabled={loadingGroup === group.title} 
                className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                {loadingGroup === group.title ? (
                  <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
