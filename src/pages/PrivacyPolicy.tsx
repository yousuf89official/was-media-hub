import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Account information (email, name)</li>
                <li>Campaign data and metrics you input</li>
                <li>Usage data and activity logs</li>
                <li>Calculation results and reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your requests and transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraud and abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Data is encrypted in transit using SSL/TLS</li>
                <li>Encrypted storage at rest</li>
                <li>Row-level security policies</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Your Rights (GDPR Compliance)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Under GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, visit your <a href="/profile/data-export" className="text-primary hover:underline">Data & Privacy</a> page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We use cookies and local storage to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve application performance</li>
              </ul>
              <p className="mt-3">
                You can control cookie settings through your browser preferences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We retain your personal data for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="mt-3">
                When you delete your account, we will delete or anonymize your data within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Lovable Cloud:</strong> Hosting infrastructure</li>
              </ul>
              <p className="mt-3">
                These services have their own privacy policies and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us
                through your account settings or email us at privacy@wasmediahub.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
