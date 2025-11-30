import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Eye, TrendingUp, Upload, Trash2, Loader2 } from 'lucide-react';
import { Creative, PlatformType, PLATFORM_CONFIG, mapDBCreativeToUI } from './types';
import { InstagramFeedMockup } from './mockups/InstagramFeedMockup';
import { InstagramStoryMockup } from './mockups/InstagramStoryMockup';
import { TikTokMockup } from './mockups/TikTokMockup';
import { YouTubeMockup } from './mockups/YouTubeMockup';
import { GoogleSearchMockup } from './mockups/GoogleSearchMockup';
import { CreativeUploadDialog } from './CreativeUploadDialog';
import { useCreatives, useDeleteCreative } from '@/hooks/useCreatives';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CreativeGalleryProps {
  brandName?: string;
  campaignId?: string;
}

export function CreativeGallery({ brandName = 'Brand', campaignId }: CreativeGalleryProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creativeToDelete, setCreativeToDelete] = useState<{ id: string; storagePath?: string | null } | null>(null);

  const { data: creativesData, isLoading } = useCreatives(campaignId);
  const deleteCreative = useDeleteCreative();

  // Map database creatives to UI format
  const creatives = creativesData?.map(mapDBCreativeToUI) || [];

  const filteredCreatives = creatives.filter(creative => {
    if (selectedPlatform !== 'all' && creative.platform !== selectedPlatform) return false;
    if (selectedSource !== 'all' && creative.source !== selectedSource) return false;
    return true;
  });

  const handleDeleteClick = (id: string, storagePath?: string | null) => {
    setCreativeToDelete({ id, storagePath });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (creativeToDelete) {
      await deleteCreative.mutateAsync(creativeToDelete);
      setDeleteDialogOpen(false);
      setCreativeToDelete(null);
    }
  };

  const renderMockup = (creative: Creative, scale: 'small' | 'large' = 'small') => {
    const scaleClass = scale === 'small' ? 'scale-[0.45]' : 'scale-75';
    const wrapperClass = scale === 'small' ? 'h-[180px] w-[100px]' : '';
    
    const mockup = (() => {
      switch (creative.platform) {
        case 'instagram-feed':
          return <InstagramFeedMockup creative={creative} brandName={brandName} />;
        case 'instagram-story':
          return <InstagramStoryMockup creative={creative} brandName={brandName} />;
        case 'tiktok':
          return <TikTokMockup creative={creative} brandName={brandName} />;
        case 'youtube':
          return <YouTubeMockup creative={creative} brandName={brandName} />;
        case 'google-search':
          return <GoogleSearchMockup creative={creative} brandName={brandName} />;
        default:
          return null;
      }
    })();

    if (scale === 'small') {
      return (
        <div className={`${wrapperClass} overflow-hidden flex items-start justify-center`}>
          <div className={`transform ${scaleClass} origin-top`}>{mockup}</div>
        </div>
      );
    }
    return mockup;
  };

  const getSourceBadge = (source: Creative['source']) => {
    const styles = {
      organic: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      paid: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      kol: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    };
    return <Badge variant="outline" className={`text-[9px] px-1 ${styles[source]}`}>{source.toUpperCase()}</Badge>;
  };

  const formatMetric = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Creative Gallery</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Creative Gallery</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{filteredCreatives.length}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="h-7 w-[110px] text-xs">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="h-7 w-[90px] text-xs">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="kol">KOL</SelectItem>
                </SelectContent>
              </Select>

              {campaignId && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs gap-1"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {filteredCreatives.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
              {filteredCreatives.map(creative => {
                const dbCreative = creativesData?.find(c => c.id === creative.id);
                return (
                  <Dialog key={creative.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="flex flex-col cursor-pointer group rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all overflow-hidden"
                        onClick={() => setSelectedCreative(creative)}
                      >
                        {/* Mockup Preview */}
                        <div className="bg-muted/30 flex items-center justify-center p-1">
                          {renderMockup(creative, 'small')}
                        </div>
                        
                        {/* Info */}
                        <div className="p-1.5 space-y-1 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground truncate">
                              {PLATFORM_CONFIG[creative.platform]?.label}
                            </span>
                            {getSourceBadge(creative.source)}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-2.5 w-2.5" />
                              {formatMetric(creative.metrics?.impressions || 0)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {formatMetric(creative.metrics?.engagements || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-sm flex items-center justify-between">
                          <span>
                            {PLATFORM_CONFIG[creative.platform]?.icon} {PLATFORM_CONFIG[creative.platform]?.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(creative.id, dbCreative?.storage_path)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col lg:flex-row gap-4 mt-2">
                        <div className="flex justify-center">
                          {renderMockup(creative, 'large')}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-xs font-medium mb-2">Performance</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {(creative.metrics?.impressions || 0) > 0 && (
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-[10px] text-muted-foreground">Impressions</p>
                                  <p className="text-sm font-semibold">{(creative.metrics?.impressions || 0).toLocaleString()}</p>
                                </div>
                              )}
                              {(creative.metrics?.reach || 0) > 0 && (
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-[10px] text-muted-foreground">Reach</p>
                                  <p className="text-sm font-semibold">{(creative.metrics?.reach || 0).toLocaleString()}</p>
                                </div>
                              )}
                              {(creative.metrics?.engagements || 0) > 0 && (
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-[10px] text-muted-foreground">Engagements</p>
                                  <p className="text-sm font-semibold">{(creative.metrics?.engagements || 0).toLocaleString()}</p>
                                </div>
                              )}
                              {(creative.metrics?.views || 0) > 0 && (
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-[10px] text-muted-foreground">Views</p>
                                  <p className="text-sm font-semibold">{(creative.metrics?.views || 0).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-medium mb-2">Details</h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source</span>
                                {getSourceBadge(creative.source)}
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Collaboration</span>
                                <span>{creative.isCollaboration ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Boosted</span>
                                <span>{creative.isBoosted ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(creative.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No creatives found</p>
              {campaignId && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload Creative
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {campaignId && (
        <CreativeUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          campaignId={campaignId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Creative</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this creative? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCreative.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
