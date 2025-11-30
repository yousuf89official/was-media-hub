import { ExternalLink, ChevronDown } from 'lucide-react';
import { Creative } from '../types';

interface GoogleSearchMockupProps {
  creative: Creative;
  brandName?: string;
}

export function GoogleSearchMockup({ creative, brandName = 'Brand' }: GoogleSearchMockupProps) {
  const displayUrl = creative.displayUrl || `www.${brandName.toLowerCase().replace(/\s/g, '')}.com`;
  
  return (
    <div className="w-full max-w-[600px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 p-4">
      {/* Google Search Header Simulation */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className="flex items-center gap-1">
          <span className="text-blue-500 text-xl font-bold">G</span>
          <span className="text-red-500 text-xl font-bold">o</span>
          <span className="text-yellow-500 text-xl font-bold">o</span>
          <span className="text-blue-500 text-xl font-bold">g</span>
          <span className="text-green-500 text-xl font-bold">l</span>
          <span className="text-red-500 text-xl font-bold">e</span>
        </div>
        <div className="flex-1 ml-4 h-10 border rounded-full px-4 flex items-center text-gray-400 text-sm">
          {brandName.toLowerCase()} products
        </div>
      </div>

      {/* Ad Result */}
      <div className="space-y-1">
        {/* Sponsored Label */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
            Sponsored
          </span>
        </div>

        {/* URL Line */}
        <div className="flex items-center gap-1 text-sm">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {brandName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-800 text-xs">{displayUrl}</span>
            <div className="flex items-center gap-1">
              <span className="text-green-700 text-xs">https://{displayUrl}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl text-blue-800 hover:underline cursor-pointer leading-tight">
          {creative.headline || `${brandName} - Official Site | Shop Now & Save`}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {creative.description || `Discover amazing products from ${brandName}. Free shipping on orders over $50. Limited time offer - Get 20% off your first order. Shop now!`}
        </p>

        {/* Sitelinks */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 pt-2">
          <a href="#" className="text-blue-800 text-sm hover:underline">Shop All Products</a>
          <a href="#" className="text-blue-800 text-sm hover:underline">New Arrivals</a>
          <a href="#" className="text-blue-800 text-sm hover:underline">Best Sellers</a>
          <a href="#" className="text-blue-800 text-sm hover:underline">About Us</a>
        </div>

        {/* Call Extensions */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t text-sm">
          <span className="text-gray-600">📞 Call: (123) 456-7890</span>
          <span className="text-gray-600">📍 Store locations</span>
        </div>
      </div>

      {/* Metrics Footer */}
      {creative.metrics && (
        <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-gray-500">
          <span>{(creative.metrics.impressions || 0).toLocaleString()} impressions</span>
          <span>{(creative.metrics.clicks || 0).toLocaleString()} clicks</span>
          <span>{((creative.metrics.ctr || 0) * 100).toFixed(2)}% CTR</span>
        </div>
      )}
    </div>
  );
}
