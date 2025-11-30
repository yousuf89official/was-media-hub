import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Creative } from '../types';

interface InstagramFeedMockupProps {
  creative: Creative;
  brandName?: string;
}

export function InstagramFeedMockup({ creative, brandName = 'Brand' }: InstagramFeedMockupProps) {
  return (
    <div className="w-full max-w-[320px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
              {brandName.charAt(0)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">{brandName.toLowerCase().replace(/\s/g, '')}</p>
            {creative.isCollaboration && (
              <p className="text-[10px] text-gray-500">Paid partnership</p>
            )}
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-100 relative">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Creative" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-4xl">📷</span>
          </div>
        )}
        {creative.isBoosted && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">
            Sponsored
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-gray-800 hover:text-red-500 cursor-pointer" />
            <MessageCircle className="w-6 h-6 text-gray-800 cursor-pointer" />
            <Send className="w-6 h-6 text-gray-800 cursor-pointer" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-800 cursor-pointer" />
        </div>

        {/* Likes */}
        <p className="text-xs font-semibold text-gray-900 mb-1">
          {(creative.metrics?.likes || 1234).toLocaleString()} likes
        </p>

        {/* Caption */}
        <p className="text-xs text-gray-900">
          <span className="font-semibold">{brandName.toLowerCase().replace(/\s/g, '')}</span>{' '}
          {creative.description || 'Check out our latest product! 🔥'}
        </p>

        {/* Comments */}
        <p className="text-xs text-gray-500 mt-1">
          View all {creative.metrics?.comments || 42} comments
        </p>

        {/* Time */}
        <p className="text-[10px] text-gray-400 mt-1 uppercase">2 hours ago</p>
      </div>
    </div>
  );
}
