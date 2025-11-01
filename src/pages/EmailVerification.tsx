import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "signup";
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // For password reset flow
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setIsVerifying(true);

    try {
      // Determine the OTP type based on the flow
      let otpType: "signup" | "recovery" | "email_change" = "signup";
      if (type === "reset") {
        otpType = "recovery";
      } else if (type === "email_change") {
        otpType = "email_change";
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: otpType,
      });

      if (error) throw error;

      if (type === "signup") {
        toast.success("Email verified! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (type === "email_change") {
        // Update profiles table with new email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await supabase
            .from("profiles")
            .update({ email: user.email })
            .eq("id", user.id);
        }
        toast.success("Email changed successfully! Redirecting to profile...");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.success("Code verified! Now set your new password.");
        setShowPasswordForm(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      toast.success("New verification code sent! Check your email.");
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (showPasswordForm) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-2"
                  required
                  minLength={6}
                  disabled={isUpdatingPassword}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-2"
                  required
                  minLength={6}
                  disabled={isUpdatingPassword}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {type === "signup"
              ? "Verify Your Email"
              : type === "email_change"
              ? "Verify New Email"
              : "Reset Your Password"}
          </CardTitle>
          <CardDescription>
            {type === "signup"
              ? "We've sent a 6-digit verification code to your email"
              : type === "email_change"
              ? "Enter the 6-digit code sent to your new email address"
              : "Enter the 6-digit code sent to your email to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center space-y-2">
            {!canResend && (
              <p className="text-sm text-muted-foreground">
                Resend code in {countdown}s
              </p>
            )}
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" onClick={() => navigate("/auth")}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
