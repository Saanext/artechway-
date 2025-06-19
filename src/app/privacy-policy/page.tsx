import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">Introduction</h2>
            <p>Welcome to Artechway. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.</p>
            <p>The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. The personal information we collect may include the following: email address, password, name.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">How We Use Your Information</h2>
            <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>To facilitate account creation and logon process.</li>
              <li>To manage user accounts. We may use your information for the purposes of managing our account and keeping it in working order.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
              <li>To respond to legal requests and prevent harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">Will Your Information Be Shared With Anyone?</h2>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          </section>

           <section>
            <h2 className="text-2xl font-headline font-semibold mb-2">Contact Us</h2>
            <p>If you have questions or comments about this notice, you may email us at contact@artechway.com</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
