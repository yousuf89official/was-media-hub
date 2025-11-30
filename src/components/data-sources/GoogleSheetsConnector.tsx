import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Link2, HelpCircle } from 'lucide-react';
import { useCreateDataSource } from '@/hooks/useDataSources';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GoogleSheetsConnectorProps {
  brandId: string;
  onSuccess?: () => void;
}

export function GoogleSheetsConnector({ brandId, onSuccess }: GoogleSheetsConnectorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [syncFrequency, setSyncFrequency] = useState('manual');

  const createDataSource = useCreateDataSource();

  const extractSheetId = (url: string): string | null => {
    // Extract sheet ID from various Google Sheets URL formats
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /key=([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !sheetUrl.trim()) return;

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return;
    }

    await createDataSource.mutateAsync({
      brand_id: brandId,
      campaign_id: null,
      name: name.trim(),
      source_type: 'google_sheets',
      sheet_id: sheetId,
      sheet_url: sheetUrl.trim(),
      sheet_name: sheetName.trim() || null,
      is_active: true,
      last_synced_at: null,
      sync_frequency: syncFrequency,
      created_by: null,
    });

    setOpen(false);
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setName('');
    setSheetUrl('');
    setSheetName('');
    setSyncFrequency('manual');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Connect Google Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connect Google Sheet
          </DialogTitle>
          <DialogDescription>
            Connect a Google Sheet to import metrics data automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Data Source Name</Label>
            <Input
              id="name"
              placeholder="e.g., Campaign Metrics Q4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="sheet-url">Google Sheet URL or ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Paste the full URL or just the sheet ID. The sheet must be published to web or shared publicly for data import to work.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheet-name">Sheet Tab Name (optional)</Label>
            <Input
              id="sheet-name"
              placeholder="e.g., Sheet1 or Metrics"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <Select value={syncFrequency} onValueChange={setSyncFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h4 className="font-medium mb-2">Important: Sheet Setup Required</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open your Google Sheet</li>
              <li>Go to File → Share → Publish to web</li>
              <li>Select the sheet tab and choose CSV format</li>
              <li>Click "Publish" and copy the URL</li>
            </ol>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              disabled={!name.trim() || !sheetUrl.trim() || createDataSource.isPending}
            >
              {createDataSource.isPending ? 'Connecting...' : 'Connect Sheet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
