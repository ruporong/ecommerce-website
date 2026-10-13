import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Setting from '@/models/Setting'
import connectToDatabase from '@/lib/mongodb'

export const dynamic = 'force-dynamic';

export default function NotFound() {

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 px-4 py-20">
        <div className="max-w-xl w-full text-center">
          <div className="relative mb-8 inline-block">
            <h1 className="text-[120px] md:text-[180px] font-black text-gray-200 leading-none tracking-tighter select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl shadow-sm border border-gray-100 text-xl font-bold tracking-widest text-gray-900 uppercase">
                Missing
              </span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Oops! We lost that page.</h2>
          <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">
            The page or product you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Go Homepage
            </Link>
            <Link 
              href="/shop"
              className="px-8 py-3.5 bg-white text-gray-900 border border-gray-200 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Keep Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
