import { Play, ThumbsUp, ThumbsDown, Share2, MoreVertical, Clock } from 'lucide-react';
import { Creative } from '../types';

interface YouTubeMockupProps {
  creative: Creative;
  brandName?: string;
}

export function YouTubeMockup({ creative, brandName = 'Brand' }: YouTubeMockupProps) {
  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Video Thumbnail */}
      <div className="aspect-video bg-gray-900 relative group">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Creative" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
            <span className="text-6xl">▶️</span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          3:24
        </div>

        {/* Sponsored Badge */}
        {creative.isBoosted && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] font-semibold px-2 py-0.5 rounded">
            Ad
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-3">
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="w-9 h-9 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
            {brandName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {creative.headline || `${brandName} - Amazing Product Launch Video 2024`}
            </h3>

            {/* Channel & Stats */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{brandName}</span>
              <span className="text-blue-600">✓</span>
            </div>
            <div className="text-xs text-gray-500">
              {formatViews(creative.metrics?.views || 125000)} views • 2 days ago
            </div>
          </div>

          <MoreVertical className="w-5 h-5 text-gray-600 flex-shrink-0" />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-gray-700">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs">{formatViews(creative.metrics?.likes || 8500)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <ThumbsDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700 ml-auto">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatViews(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
