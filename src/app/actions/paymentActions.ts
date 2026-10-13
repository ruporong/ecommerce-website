"use server";
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function getPaymentSettings() {
  await connectToDatabase();
  const settings = await Setting.find({ 
    key: { $in: ['payment_cod_enabled', 'payment_bkash_enabled', 'payment_eps_enabled', 'payment_nagad_enabled', 'payment_sslcommerz_enabled'] } 
  }).lean();
  
  const getValue = (key: string, defaultValue: boolean) => {
    const s = settings.find(x => x.key === key);
    if (!s) return defaultValue;
    return s.value === 'true';
  };

  return { 
    hasCod: getValue('payment_cod_enabled', true),
    hasBkash: getValue('payment_bkash_enabled', false), 
    hasEps: getValue('payment_eps_enabled', false), 
    hasNagad: getValue('payment_nagad_enabled', false),
    hasSslcommerz: getValue('payment_sslcommerz_enabled', false)
  };
}
