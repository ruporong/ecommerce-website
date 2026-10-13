"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { processCheckout } from "@/app/actions/checkoutActions";
import { validateCoupon } from "@/app/actions/couponActions";
import { getShippingSettings } from "@/app/actions/shippingActions";
import { getPaymentSettings } from "@/app/actions/paymentActions";
import Image from "next/image";
import bdData from "@/lib/bdData.json";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const status = searchParams.get('status');
    const order = searchParams.get('orderId');
    const reason = searchParams.get('reason');
    
    if (status === 'success' && order) {
      setSuccess(true);
      setOrderId(order);
      clearCart();
    } else if (status === 'fail') {
      toast.error('Payment Failed: ' + (reason || 'Unknown error'));
    }
  }, [searchParams, clearCart]);
  
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number } | null>(null);

  // Shipping State
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [shippingZone, setShippingZone] = useState<"inside" | "outside">("inside");
  const [shippingLoading, setShippingLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const thanasList = selectedCity && bdData[selectedCity as keyof typeof bdData] ? bdData[selectedCity as keyof typeof bdData] : [];
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentSettings, setPaymentSettings] = useState({ hasCod: true, hasBkash: false, hasEps: false, hasNagad: false, hasSslcommerz: false });

  useEffect(() => {
    setMounted(true);
    getPaymentSettings().then(res => setPaymentSettings(res));
    getShippingSettings().then(settings => {
      setShippingSettings(settings);
      setShippingLoading(false);
    });
  }, []);

  const handleApplyCoupon = async () => {
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const subtotal = getTotalPrice();
      const res = await validateCoupon(couponCode, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon({ id: res.coupon._id, code: res.coupon.code, discount: res.discountAmount || 0 });
        setCouponCode("");
      } else {
        setCouponError(res.error || "Invalid coupon.");
      }
    } catch (err) {
      setCouponError("An error occurred.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = getTotalPrice();
  let shippingCost = 0;
  let isFreeShipping = false;
  
  if (shippingSettings) {
    if (shippingSettings.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold) {
      shippingCost = 0;
      isFreeShipping = true;
    } else {
      if (shippingZone === "inside") {
        shippingCost = shippingSettings.insideDhakaCharge;
      } else if (shippingZone === "outside") {
        shippingCost = shippingSettings.outsideDhakaCharge;
      }
    }
  }

  const finalTotal = subtotal - (appliedCoupon?.discount || 0) + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const utmSource = localStorage.getItem('utm_source');
    const utmMedium = localStorage.getItem('utm_medium');
    const utmCampaign = localStorage.getItem('utm_campaign');
    if (utmSource) formData.append('utm_source', utmSource);
    if (utmMedium) formData.append('utm_medium', utmMedium);
    if (utmCampaign) formData.append('utm_campaign', utmCampaign);
    formData.append("shipping_zone", shippingZone);
    formData.append("shipping_cost", shippingCost.toString());
    const fcmToken = localStorage.getItem('fcm_token_value');
    if (fcmToken) {
      formData.append('fcmToken', fcmToken);
    }
    
    if (appliedCoupon) {
      formData.append("coupon_id", appliedCoupon.id);
      formData.append("discount_amount", appliedCoupon.discount.toString());
    }
    formData.append("payment_method", paymentMethod);
    
    const result = await processCheckout(
      formData, 
      items.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      })),
      finalTotal,
      appliedCoupon || undefined
    );
    
    if (result.success && result.orderId) {
      if (paymentMethod === 'bkash') {
        router.push(`/api/payment/bkash/create?orderId=${result.orderId}`);
        return;
      } else if (paymentMethod === 'EPS' || paymentMethod === 'eps') {
        router.push(`/api/payment/eps/create?orderId=${result.orderId}`);
        return;
      } else if (paymentMethod === 'SSLCommerz') {
        router.push(`/api/payment/sslcommerz/create?orderId=${result.orderId}`);
        return;
      }
      setSuccess(true);
      setOrderId(result.orderId);
      clearCart();
    } else {
      toast.error(result.error || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  
  if (!mounted || shippingLoading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20 min-h-[80vh]">
        <div className="mb-12">
          <div className="h-10 bg-gray-200 rounded-md w-48 mb-4 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded-md w-64 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7 xl:col-span-7 space-y-10">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_40px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
              <div className="h-8 bg-gray-200 rounded-md w-48 mb-8 animate-pulse"></div>
              <div className="space-y-6">
                
                  <div className="space-y-1.5 mb-3 sm:mb-5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">Email Address <span className="text-gray-400 text-xs">(Optional - for Order Updates)</span></label>
                    <input type="email" id="email" name="email" autoComplete="email" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-12 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="your@email.com" />
                  </div>
<div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="h-14 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                  <div className="h-14 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                </div>
                <div className="h-24 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                <div className="h-28 bg-gray-100 rounded-xl w-full animate-pulse mt-6"></div>
              </div>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_40px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
              <div className="h-8 bg-gray-200 rounded-md w-48 mb-8 animate-pulse"></div>
              <div className="flex flex-col gap-3">
                <div className="h-[76px] bg-gray-100 rounded-2xl w-full animate-pulse"></div>
                <div className="h-[76px] bg-gray-100 rounded-2xl w-full animate-pulse"></div>
                <div className="h-[76px] bg-gray-100 rounded-2xl w-full animate-pulse"></div>
                <div className="h-[76px] bg-gray-100 rounded-2xl w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <div className="bg-gray-50/80 p-6 md:p-8 rounded-3xl border border-gray-100">
              <div className="h-8 bg-gray-200 rounded-md w-40 mb-8 animate-pulse"></div>
              <div className="space-y-4 mb-8">
                <div className="h-20 bg-white rounded-2xl w-full animate-pulse"></div>
                <div className="h-20 bg-white rounded-2xl w-full animate-pulse"></div>
              </div>
              <div className="h-12 bg-white rounded-2xl w-full animate-pulse mb-8"></div>
              <div className="space-y-4 mb-8">
                <div className="h-5 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-md w-full animate-pulse"></div>
              </div>
              <div className="h-14 bg-gray-300 rounded-2xl w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }


  
  if (searchParams.get('status') === 'fail') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Failed</h1>
        <p className="text-gray-500 max-w-md mb-8 text-lg">
          {searchParams.get('reason') || 'Unfortunately, we could not process your payment.'} Please try again with a different method.
        </p>
        <div className="flex gap-4">
          <Link href="/checkout" className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
            Try Again
          </Link>
          <Link href="/contact" className="px-8 py-3.5 bg-white text-gray-900 border border-gray-200 font-semibold rounded-full hover:bg-gray-50 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 min-h-[75vh] flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <svg className="w-10 h-10 animate-[draw_0.6s_ease-out_forwards]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path strokeDasharray="50" strokeDashoffset="50" d="M20 6L9 17l-5-5">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.6s" fill="freeze" />
              </path>
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 tracking-tight">Order Confirmed</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          Thank you for your purchase! Your order <span className="font-semibold text-gray-900 border-b border-gray-300 pb-0.5">{orderId}</span> has been placed successfully.
        </p>
        <Link href="/" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-widest uppercase text-white bg-black rounded-full overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
          <span className="relative z-10 text-sm">Continue Shopping</span>
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h1 className="text-3xl font-serif text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => router.push('/')} className="inline-block bg-black text-white px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-full hover:bg-gray-900 transition-colors">
          Explore Collection
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20 min-h-[80vh]">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-gray-500 mt-2">Complete your order details below.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Main Form */}
        <div className="lg:col-span-7 xl:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_40px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact & Delivery</h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 ml-1">Full Name <span className="text-red-500 ml-1 text-lg font-bold">*</span></label>
                    <input required type="text" id="name" name="name" autoComplete="name" pattern="[a-zA-Z\\s.-]+" title="Name should only contain letters, spaces, dots, or hyphens" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-12 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700 ml-1">Phone Number <span className="text-red-500 ml-1 text-lg font-bold">*</span></label>
                    <input required type="tel" id="phone" name="phone" autoComplete="tel" pattern="01[3-9][0-9]{8}" maxLength={11} minLength={11} title="Must be a valid 11-digit Bangladeshi mobile number e.g., 017XXXXXXXX" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-12 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="01XXXXXXXXX" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="space-y-1.5 relative">
                    <label htmlFor="city" className="text-sm font-medium text-gray-700 ml-1">City / District <span className="text-red-500 ml-1 text-lg font-bold">*</span></label>
                    <select required id="city" name="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} autoComplete="address-level2" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-12 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Select District</option>
                      <option value="Bagerhat">Bagerhat</option>\n                      <option value="Bandarban">Bandarban</option>\n                      <option value="Barguna">Barguna</option>\n                      <option value="Barisal">Barisal</option>\n                      <option value="Bhola">Bhola</option>\n                      <option value="Bogra">Bogra</option>\n                      <option value="Brahmanbaria">Brahmanbaria</option>\n                      <option value="Chandpur">Chandpur</option>\n                      <option value="Chattogram">Chattogram</option>\n                      <option value="Chuadanga">Chuadanga</option>\n                      <option value="Comilla">Comilla</option>\n                      <option value="Cox's Bazar">Cox's Bazar</option>\n                      <option value="Dhaka">Dhaka</option>\n                      <option value="Dinajpur">Dinajpur</option>\n                      <option value="Faridpur">Faridpur</option>\n                      <option value="Feni">Feni</option>\n                      <option value="Gaibandha">Gaibandha</option>\n                      <option value="Gazipur">Gazipur</option>\n                      <option value="Gopalganj">Gopalganj</option>\n                      <option value="Habiganj">Habiganj</option>\n                      <option value="Jamalpur">Jamalpur</option>\n                      <option value="Jessore">Jessore</option>\n                      <option value="Jhalokati">Jhalokati</option>\n                      <option value="Jhenaidah">Jhenaidah</option>\n                      <option value="Joypurhat">Joypurhat</option>\n                      <option value="Khagrachari">Khagrachari</option>\n                      <option value="Khulna">Khulna</option>\n                      <option value="Kishoreganj">Kishoreganj</option>\n                      <option value="Kurigram">Kurigram</option>\n                      <option value="Kushtia">Kushtia</option>\n                      <option value="Lakshmipur">Lakshmipur</option>\n                      <option value="Lalmonirhat">Lalmonirhat</option>\n                      <option value="Madaripur">Madaripur</option>\n                      <option value="Magura">Magura</option>\n                      <option value="Manikganj">Manikganj</option>\n                      <option value="Meherpur">Meherpur</option>\n                      <option value="Moulvibazar">Moulvibazar</option>\n                      <option value="Munshiganj">Munshiganj</option>\n                      <option value="Mymensingh">Mymensingh</option>\n                      <option value="Naogaon">Naogaon</option>\n                      <option value="Narail">Narail</option>\n                      <option value="Narayanganj">Narayanganj</option>\n                      <option value="Narsingdi">Narsingdi</option>\n                      <option value="Natore">Natore</option>\n                      <option value="Nawabganj">Nawabganj</option>\n                      <option value="Netrokona">Netrokona</option>\n                      <option value="Nilphamari">Nilphamari</option>\n                      <option value="Noakhali">Noakhali</option>\n                      <option value="Pabna">Pabna</option>\n                      <option value="Panchagarh">Panchagarh</option>\n                      <option value="Patuakhali">Patuakhali</option>\n                      <option value="Pirojpur">Pirojpur</option>\n                      <option value="Rajbari">Rajbari</option>\n                      <option value="Rajshahi">Rajshahi</option>\n                      <option value="Rangamati">Rangamati</option>\n                      <option value="Rangpur">Rangpur</option>\n                      <option value="Satkhira">Satkhira</option>\n                      <option value="Shariatpur">Shariatpur</option>\n                      <option value="Sherpur">Sherpur</option>\n                      <option value="Sirajgonj">Sirajgonj</option>\n                      <option value="Sunamganj">Sunamganj</option>\n                      <option value="Sylhet">Sylhet</option>\n                      <option value="Tangail">Tangail</option>\n                      <option value="Thakurgaon">Thakurgaon</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none mt-7 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="area" className="text-sm font-medium text-gray-700 ml-1">Area / Thana <span className="text-red-500 ml-1 text-lg font-bold">*</span></label>
                    <select required id="area" name="area" defaultValue="" autoComplete="address-level3" disabled={!selectedCity} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-12 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer disabled:opacity-50">
                      <option value="" disabled>Select Area/Thana</option>
                      {thanasList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none mt-7 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 ml-1">House & Street Address <span className="text-red-500 ml-1 text-lg font-bold">*</span></label>
                  <textarea required id="address" name="address" autoComplete="street-address" rows={2} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-24 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all resize-none" placeholder="House/Flat No, Road No"></textarea>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="note" className="text-sm font-medium text-gray-700 ml-1">Order Note (Optional)</label>
                  <textarea id="note" name="note" rows={2} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 h-16 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all resize-none" placeholder="Any special instructions for delivery..."></textarea>
                </div>

                {shippingSettings && (
                  <div className="pt-2">
                    <label className="text-sm font-medium text-gray-700 ml-1 block mb-3">Delivery Zone</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${shippingZone === 'inside' ? 'border-black bg-gray-900 text-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-300 text-gray-900'}`}>
                        <div className="flex flex-col gap-1">
                          <input type="radio" name="zone_radio" value="inside" checked={shippingZone === 'inside'} onChange={() => setShippingZone('inside')} className="sr-only" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Inside Dhaka</span>
                            {shippingZone === 'inside' && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <span className={`text-xs ${shippingZone === 'inside' ? 'text-gray-300' : 'text-gray-500'}`}>Delivery: 1-2 Days</span>
                        </div>
                      </label>
                      <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${shippingZone === 'outside' ? 'border-black bg-gray-900 text-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-300 text-gray-900'}`}>
                        <div className="flex flex-col gap-1">
                          <input type="radio" name="zone_radio" value="outside" checked={shippingZone === 'outside'} onChange={() => setShippingZone('outside')} className="sr-only" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Outside Dhaka</span>
                            {shippingZone === 'outside' && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <span className={`text-xs ${shippingZone === 'outside' ? 'text-gray-300' : 'text-gray-500'}`}>Delivery: 3-5 Days</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            </form>
        </div>

        {/* Order Summary and Payment */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-10">
          <div className="bg-gray-50/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-gray-100 ">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100/50">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium text-gray-400">IMG</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        <span>Qty: {item.quantity}</span>
                        {(item.color || item.size) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{item.color} {item.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              {appliedCoupon ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{appliedCoupon.code}</p>
                      <p className="text-xs font-medium text-green-700/70">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Discount code" 
                    className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black uppercase transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyingCoupon}
                    className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-800 transition-colors"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{couponError}</p>}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount ({appliedCoupon.code})</span>
                  <span className="text-green-600 font-semibold">- ৳{appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping {isFreeShipping && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full ml-1 font-medium">Free</span>}</span>
                <span className={isFreeShipping ? "text-green-600 font-semibold" : "font-semibold text-gray-900"}>
                  {isFreeShipping ? 'Free' : `৳${shippingCost.toLocaleString()}`}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 mr-2">BDT</span>
                    <span className="font-bold text-2xl text-gray-900">৳{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`} style={{ backgroundColor: '#000', color: '#fff' }}
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <span className="text-[11px] font-medium tracking-wide">SECURE SSL ENCRYPTED PAYMENT</span>
            </div>
          </div>
        
{/* Section 2 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_40px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="flex flex-col gap-3">
                {/* 1. Cash on Delivery */}
                {paymentSettings.hasCod && (
                <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'COD' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'COD' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment_method" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="sr-only" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-gray-900">Cash on Delivery</span>
                    <span className="text-xs text-gray-500 mt-0.5">Pay when you receive</span>
                  </div>
                  <div className="shrink-0 w-[40px] h-[40px] relative flex items-center justify-center bg-white border border-gray-100 rounded-md p-1 overflow-hidden">
                    <img src="/assets/images/cod_logo.png" alt="COD" className="w-full h-full object-contain" />
                  </div>
                </label>
                )}

                {/* 2. bKash */}
                {paymentSettings.hasBkash && (
                <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'bkash' ? 'border-[#e2136e] bg-pink-50 shadow-sm' : 'border-gray-100 bg-white hover:border-pink-100'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'bkash' ? 'border-[#e2136e]' : 'border-gray-300'}`}>
                    {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 bg-[#e2136e] rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment_method" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="sr-only" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-[#e2136e]">bKash Payment</span>
                    <span className="text-xs text-[#e2136e]/70 mt-0.5">Secure mobile payment</span>
                  </div>
                  <div className="shrink-0 w-[40px] h-[40px] relative flex items-center justify-center bg-white border border-gray-100 rounded-md p-1 overflow-hidden">
                    <img src="/assets/images/bkash_logo.png" alt="bKash" className="w-full h-full object-contain scale-110" />
                  </div>
                </label>
                )}

                {/* 3. Nagad */}
                {paymentSettings.hasNagad && (
                <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'Nagad' ? 'border-[#f36b25] bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-orange-100'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'Nagad' ? 'border-[#f36b25]' : 'border-gray-300'}`}>
                    {paymentMethod === 'Nagad' && <div className="w-2.5 h-2.5 bg-[#f36b25] rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment_method" value="Nagad" checked={paymentMethod === 'Nagad'} onChange={() => setPaymentMethod('Nagad')} className="sr-only" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-[#f36b25]">Nagad Payment</span>
                    <span className="text-xs text-[#f36b25]/70 mt-0.5">Fast mobile banking</span>
                  </div>
                  <div className="shrink-0 w-[40px] h-[40px] relative flex items-center justify-center bg-white border border-gray-100 rounded-md p-1 overflow-hidden">
                    <img src="/assets/images/nagad_logo.png" alt="Nagad" className="w-full h-full object-contain" />
                  </div>
                </label>
                )}

{/* 5. SSLCommerz Gateway */}
                {paymentSettings.hasSslcommerz && (
                <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'SSLCommerz' ? 'border-[#007cc3] bg-blue-50 shadow-sm' : 'border-gray-100 bg-white hover:border-blue-100'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'SSLCommerz' ? 'border-[#007cc3]' : 'border-gray-300'}`}>
                    {paymentMethod === 'SSLCommerz' && <div className="w-2.5 h-2.5 bg-[#007cc3] rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment_method" value="SSLCommerz" checked={paymentMethod === 'SSLCommerz'} onChange={() => setPaymentMethod('SSLCommerz')} className="sr-only" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-[#007cc3]">SSLCommerz</span>
                    <span className="text-xs text-[#007cc3]/70 mt-0.5">Secure Card & Mobile Banking</span>
                  </div>
                  <div className="shrink-0 w-[40px] h-[40px] relative flex items-center justify-center bg-white border border-gray-100 rounded-md p-1 overflow-hidden">
                    <img src="/assets/images/ssl_logo.png" alt="SSLCommerz" className="w-full h-full object-contain" />
                  </div>
                </label>
                )}

                {/* 4. EPS Gateway */}
                {paymentSettings.hasEps && (
                <label className={`group relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'EPS' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'EPS' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'EPS' && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment_method" value="EPS" checked={paymentMethod === 'EPS'} onChange={() => setPaymentMethod('EPS')} className="sr-only" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-gray-900">EPS Gateway</span>
                    <span className="text-xs text-gray-500 mt-0.5">Card / Mobile Banking</span>
                  </div>
                  <div className="shrink-0 w-[40px] h-[40px] relative flex items-center justify-center bg-white border border-gray-100 rounded-md p-1 overflow-hidden">
                    <img src="/assets/images/eps_logo.png" alt="EPS" className="w-full h-full object-contain scale-110" />
                  </div>
                </label>
                )}
              </div>
            </div>
            
          

          </div>
      </div>
    </main>
  );
}
