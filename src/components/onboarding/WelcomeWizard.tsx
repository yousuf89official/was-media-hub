import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Package, BarChart3, TrendingUp, Rocket } from "lucide-react";

interface WelcomeWizardProps {
  onComplete: () => void;
}

const WelcomeWizard = ({ onComplete }: WelcomeWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to WAS Media Hub",
      description: "Your comprehensive platform for media intelligence and campaign tracking",
      icon: Rocket,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            WAS Media Hub helps you manage campaigns, track metrics, and calculate advertising value equivalency (AVE) all in one place.
          </p>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Campaign management and tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">Real-time metrics and analytics</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">AVE calculation and reporting</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 1: Create Your Brands",
      description: "Start by adding the brands you'll be tracking",
      icon: Package,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Brands represent the companies or products you're managing campaigns for. You can add multiple brands and organize your campaigns accordingly.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">💡 Quick Tip</p>
            <p className="text-sm text-muted-foreground">
              You can always add more brands later. Start with one to get familiar with the platform.
            </p>
          </div>
          <Button
            onClick={() => {
              navigate("/brands");
              onComplete();
            }}
            className="w-full"
          >
            Go to Brands
          </Button>
        </div>
      ),
    },
    {
      title: "Step 2: Create Campaigns",
      description: "Set up your first campaign to start tracking",
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Campaigns are the heart of WAS Media Hub. Each campaign tracks metrics across channels and time periods.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Choose your brand and channel</p>
                <p className="text-xs text-muted-foreground">Select from existing brands and channels</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Set campaign dates</p>
                <p className="text-xs text-muted-foreground">Define start and end dates for tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Add metrics data</p>
                <p className="text-xs text-muted-foreground">Input impressions, reach, engagement data</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: Calculate AVE",
      description: "Measure the value of your media coverage",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Advertising Value Equivalency (AVE) helps you understand the monetary value of your earned media coverage.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">🎯 What is AVE?</p>
            <p className="text-sm text-muted-foreground">
              AVE calculates how much you would have paid for the same exposure through paid advertising, giving you a tangible ROI metric.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">You can calculate AVE for:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Individual campaigns</li>
              <li>• Multiple channels</li>
              <li>• Custom date ranges</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>{currentStepData.content}</CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) {
                onComplete();
              } else {
                setCurrentStep((prev) => prev - 1);
              }
            }}
          >
            {currentStep === 0 ? "Skip" : "Back"}
          </Button>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center">
              {currentStep + 1} of {steps.length}
            </span>
            <Button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  onComplete();
                } else {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomeWizard;
