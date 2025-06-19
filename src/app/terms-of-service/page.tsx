import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">1. Agreement to Terms</h2>
            <p>By using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Artechway ("we", "us", or "our") provides a blog platform focusing on AI, web development, and social media marketing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">2. Use of Our Services</h2>
            <p>You must use our services in compliance with all applicable laws. You may not use our services for any illegal or unauthorized purpose. You agree not to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
              <li>Use any data mining, robots, or similar data gathering or extraction methods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">3. Accounts</h2>
            <p>When you create an account with us (for admin purposes), you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">4. Intellectual Property</h2>
            <p>The Service and its original content (excluding content provided by users), features and functionality are and will remain the exclusive property of Artechway and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Artechway.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">6. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">7. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at contact@artechway.com.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
