import { Heart, MessageCircle, Share2, Music, Bookmark } from 'lucide-react';
import { Creative } from '../types';

interface TikTokMockupProps {
  creative: Creative;
  brandName?: string;
}

export function TikTokMockup({ creative, brandName = 'Brand' }: TikTokMockupProps) {
  return (
    <div className="w-[180px] h-[320px] bg-black rounded-2xl shadow-lg overflow-hidden relative">
      {/* Video Background */}
      <div className="absolute inset-0">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Creative" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-400">
            <span className="text-6xl">🎵</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      {/* Sponsored Badge */}
      {creative.isBoosted && (
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
          Sponsored
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white">
            <span className="text-white text-xs font-bold">{brandName.charAt(0)}</span>
          </div>
          <div className="w-4 h-4 rounded-full bg-red-500 -mt-2 flex items-center justify-center">
            <span className="text-white text-[8px]">+</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Heart className="w-7 h-7 text-white" fill="white" />
          <span className="text-white text-[10px] mt-1">{formatNumber(creative.metrics?.likes || 45600)}</span>
        </div>

        <div className="flex flex-col items-center">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-[10px] mt-1">{formatNumber(creative.metrics?.comments || 1234)}</span>
        </div>

        <div className="flex flex-col items-center">
          <Bookmark className="w-7 h-7 text-white" />
          <span className="text-white text-[10px] mt-1">{formatNumber(creative.metrics?.saves || 890)}</span>
        </div>

        <div className="flex flex-col items-center">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-[10px] mt-1">{formatNumber(creative.metrics?.shares || 567)}</span>
        </div>

        <div className="w-8 h-8 rounded-lg bg-white/30 animate-spin-slow overflow-hidden border border-white/50">
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-3 left-3 right-16">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white text-xs font-bold">@{brandName.toLowerCase().replace(/\s/g, '')}</span>
          {creative.isCollaboration && (
            <span className="bg-white/20 text-white text-[8px] px-1.5 py-0.5 rounded">Collab</span>
          )}
        </div>
        <p className="text-white text-[10px] line-clamp-2">
          {creative.description || 'Check out this amazing content! #viral #fyp'}
        </p>
        <div className="flex items-center gap-1 mt-2">
          <Music className="w-3 h-3 text-white" />
          <p className="text-white text-[10px] truncate">Original sound - {brandName}</p>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
