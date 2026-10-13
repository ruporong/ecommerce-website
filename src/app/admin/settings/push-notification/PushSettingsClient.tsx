"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { saveSettings } from '@/app/actions/settingsActions';

export default function PushSettingsClient({ initialData, children }: { initialData: any, children?: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('welcome');
  const [savingForm, setSavingForm] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, formName: string) => {
    e.preventDefault();
    setSavingForm(formName);

    const formData = new FormData(e.currentTarget);
    
    // Add checkbox states explicitly since unchecked boxes aren't included in FormData
    const formElements = Array.from(e.currentTarget.elements) as HTMLInputElement[];
    formElements.forEach(el => {
      if (el.type === 'checkbox') {
        formData.set(el.name, el.checked ? 'true' : 'false');
      }
    });

    try {
      const result = await saveSettings(formData, '/admin/settings/push-notification');
      if (result.success) toast.success('Settings saved successfully!');
      else toast.error(result.error || 'Failed to save settings.');
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setSavingForm(null);
    }
  };

  const notificationTypes = [
    { 
      id: 'welcome', 
      title: 'Welcome Alert', 
      desc: 'Sent when users allow notifications', 
      namePrefix: 'welcome', 
      vars: [],
      defaultTitle: 'Welcome to {store_name}! 🎉',
      defaultBody: 'Thank you for subscribing! Get ready for exclusive VIP offers, early access to new arrivals, and special discounts. Use code WELCOME10 for 10% off your first order!'
    },
    { 
      id: 'order_placed', 
      title: 'Order Placed', 
      desc: 'Sent after successful checkout', 
      namePrefix: 'order_placed', 
      vars: ['[customer_name]', '[order_id]'],
      defaultTitle: 'Order Confirmed! ✨',
      defaultBody: "Hi [customer_name], we've received your order #[order_id]! We're preparing it with care and will notify you once it ships. Thanks for choosing {store_name}!"
    },
    { 
      id: 'order_shipped', 
      title: 'Order Shipped', 
      desc: 'Sent when order status is shipped', 
      namePrefix: 'order_shipped', 
      vars: ['[order_id]'],
      defaultTitle: 'Great News! Your Order is on the Way 🚚',
      defaultBody: 'Your order #[order_id] has just been shipped and is heading your way! Keep an eye on your phone for delivery updates from our courier.'
    },
    { 
      id: 'order_delivered', 
      title: 'Order Delivered', 
      desc: 'Sent when order is delivered', 
      namePrefix: 'order_delivered', 
      vars: ['[order_id]'],
      defaultTitle: 'Package Delivered! 🎁',
      defaultBody: "Your order #[order_id] has been successfully delivered! We hope you love your new items. Don't forget to leave a review and share your experience with us!"
    },
    { 
      id: 'order_cancelled', 
      title: 'Order Cancelled', 
      desc: 'Sent when order is cancelled', 
      namePrefix: 'order_cancelled', 
      vars: ['[order_id]'],
      defaultTitle: 'Order Cancelled ❌',
      defaultBody: "Your order #[order_id] has been cancelled. If you have any questions or want to re-order, please contact our support team. We're here to help!"
    },
    { 
      id: 'cart_abandonment', 
      title: 'Cart Abandonment', 
      desc: 'Hourly cron reminder for abandoned carts', 
      namePrefix: 'cart_abandonment', 
      vars: [],
      defaultTitle: 'Did you forget something? 🛒',
      defaultBody: "You left some amazing items in your cart! Complete your purchase now before they sell out. We've saved them for you—just tap here to check out."
    },
    { 
      id: 'back_in_stock', 
      title: 'Back in Stock', 
      desc: 'Sent when requested products restock', 
      namePrefix: 'back_in_stock', 
      vars: ['[product_name]'],
      defaultTitle: "Good News! It's Back in Stock 📢",
      defaultBody: 'The wait is over! [product_name] is finally back in stock. Grab yours quickly before it sells out again!'
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8 items-start">
      <div className="space-y-8">
        {/* Firebase Config */}
        <form onSubmit={(e) => handleSave(e, 'firebase')} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Firebase Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Setup Firebase Cloud Messaging (FCM) credentials.</p>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Firebase Client Config (JSON)</label>
              <textarea 
                name="firebase_client_config" 
                defaultValue={initialData.firebase_client_config}
                className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-mono text-sm text-gray-600"
                placeholder={'{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">VAPID Key (Frontend Web Push)</label>
              <input 
                type="text" 
                name="firebase_vapid_key" 
                defaultValue={initialData.firebase_vapid_key}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-mono text-sm text-gray-600"
                placeholder="e.g. BKT..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Account JSON (Backend Server)</label>
              <textarea 
                name="firebase_service_account" 
                defaultValue={initialData.firebase_service_account}
                className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-mono text-sm text-gray-600"
                placeholder='e.g. { "type": "service_account", "project_id": "...", ... }'
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={savingForm === 'firebase'} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
              {savingForm === 'firebase' ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {children}
      </div>

      {/* Automated Notifications */}
      <form onSubmit={(e) => handleSave(e, 'templates')} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Automated Templates</h2>
            <p className="text-sm text-gray-500 mt-1">Configure auto-responses for user actions.</p>
          </div>
          <button type="submit" disabled={savingForm === 'templates'} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {savingForm === 'templates' ? 'Saving...' : 'Save All'}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-56 border-r border-gray-100 bg-white p-3 space-y-1">
            {notificationTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveTab(type.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === type.id ? 'bg-gray-100 text-black font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {type.title}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-6 md:p-8 bg-white">
            {notificationTypes.map(type => (
              <div key={type.id} className={`${activeTab === type.id ? 'block' : 'hidden'} animate-in fade-in duration-200`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name={`notify_${type.namePrefix}`} defaultChecked={initialData[`notify_${type.namePrefix}`] === 'true'} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {type.vars.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm">
                    <p className="text-blue-800 font-semibold mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {type.vars.map(v => (
                        <span key={v} className="bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-md font-mono text-xs shadow-sm">{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Title</label>
                    <input 
                      type="text" 
                      name={`msg_${type.namePrefix}_title`}
                      defaultValue={initialData[`msg_${type.namePrefix}_title`] || type.defaultTitle}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium text-gray-900 placeholder-gray-300"
                      placeholder={type.defaultTitle}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Body</label>
                    <textarea 
                      name={`msg_${type.namePrefix}_body`}
                      defaultValue={initialData[`msg_${type.namePrefix}_body`] || type.defaultBody}
                      className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm text-gray-700 placeholder-gray-300 resize-none"
                      placeholder={type.defaultBody}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
