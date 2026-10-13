'use server';

import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function getShippingSettings() {
  await connectToDatabase();
  const settings = await Setting.find({
    key: {
      $in: [
        'shipping_inside_dhaka',
        'shipping_outside_dhaka',
        'shipping_free_threshold'
      ]
    }
  }).lean();

  const data: Record<string, any> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }
  
  return {
    insideDhakaCharge: Number(data.shipping_inside_dhaka || 60),
    outsideDhakaCharge: Number(data.shipping_outside_dhaka || 120),
    freeShippingThreshold: Number(data.shipping_free_threshold || 0)
  };
}
