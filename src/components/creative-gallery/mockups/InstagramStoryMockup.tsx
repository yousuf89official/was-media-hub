import { Heart, Send, ChevronUp } from 'lucide-react';
import { Creative } from '../types';

interface InstagramStoryMockupProps {
  creative: Creative;
  brandName?: string;
}

export function InstagramStoryMockup({ creative, brandName = 'Brand' }: InstagramStoryMockupProps) {
  return (
    <div className="w-[180px] h-[320px] bg-black rounded-2xl shadow-lg overflow-hidden relative">
      {/* Story Background */}
      <div className="absolute inset-0">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Creative" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400">
            <span className="text-6xl">📱</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-2 left-2 right-2 flex gap-1">
        <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-white rounded-full" />
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
              {brandName.charAt(0)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-semibold">{brandName.toLowerCase().replace(/\s/g, '')}</span>
            {creative.isBoosted && (
              <span className="text-white/70 text-[10px]">• Sponsored</span>
            )}
          </div>
        </div>
        <span className="text-white text-lg">×</span>
      </div>

      {/* CTA Swipe Up */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
        {creative.cta && (
          <>
            <ChevronUp className="w-6 h-6 text-white animate-bounce" />
            <div className="bg-white rounded-full px-4 py-1.5 text-xs font-semibold text-gray-900">
              {creative.cta}
            </div>
          </>
        )}
        
        {/* Reply Bar */}
        <div className="mt-3 mx-3 w-[calc(100%-24px)] flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full px-3 py-1.5 text-white/70 text-xs">
            Send message
          </div>
          <Heart className="w-6 h-6 text-white" />
          <Send className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Collab Badge */}
      {creative.isCollaboration && (
        <div className="absolute top-14 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
          Paid partnership with {brandName}
        </div>
      )}
    </div>
  );
}
