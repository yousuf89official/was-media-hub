import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to let the page load
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Cookie Consent</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecline}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            We use cookies and local storage to enhance your experience on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                This application uses browser storage (cookies and localStorage) to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Keep you logged in securely</li>
                <li>Remember your preferences and settings</li>
                <li>Improve application performance</li>
                <li>Track onboarding completion status</li>
              </ul>
              <p className="mt-3">
                By continuing to use this application, you consent to our use of cookies and data storage.
                You can manage your preferences in your profile settings.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleAccept}>
                Accept All
              </Button>
              <Button variant="outline" onClick={handleDecline}>
                Decline Optional
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/privacy-policy", "_blank")}
              >
                Privacy Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
