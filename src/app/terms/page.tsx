import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'StartExus terms of service - rules and guidelines for using our online business marketplace.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using StartExus ("the Platform"), you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              StartExus is an online marketplace that facilitates the buying and selling of online businesses,
              digital assets, and related services. We provide a platform where sellers can list their businesses
              and buyers can discover investment opportunities.
            </p>

            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of our service, you must create an account. You agree to provide accurate,
              current, and complete information during the registration process and to update such information
              to keep it accurate, current, and complete.
            </p>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding the password and for all activities that occur under your account.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2>4. User Conduct</h2>
            <h3>4.1 Prohibited Activities</h3>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul>
              <li>Copying, distributing, or disclosing any part of the service in any medium</li>
              <li>Using any automated system to access the service</li>
              <li>Transmitting spam, chain letters, or other unsolicited email</li>
              <li>Attempting to interfere with or compromise the system integrity or security</li>
              <li>Collecting or harvesting any personally identifiable information from the service</li>
              <li>Using the service for any illegal or unauthorized purpose</li>
            </ul>

            <h3>4.2 Content Standards</h3>
            <p>
              All content posted on the platform must be accurate, lawful, and not misleading. Users are
              responsible for ensuring their listings comply with all applicable laws and regulations.
            </p>

            <h2>5. Listing and Transaction Terms</h2>
            <h3>5.1 Seller Responsibilities</h3>
            <p>Sellers agree to:</p>
            <ul>
              <li>Provide accurate and complete information about their business</li>
              <li>Respond promptly to buyer inquiries</li>
              <li>Complete transactions in good faith</li>
              <li>Provide necessary documentation for due diligence</li>
              <li>Transfer all agreed-upon assets upon completion of sale</li>
            </ul>

            <h3>5.2 Buyer Responsibilities</h3>
            <p>Buyers agree to:</p>
            <ul>
              <li>Conduct proper due diligence before making offers</li>
              <li>Honor accepted offers and complete transactions</li>
              <li>Use escrow services as directed</li>
              <li>Respect confidentiality agreements</li>
            </ul>

            <h3>5.3 Transaction Fees</h3>
            <p>
              StartExus charges a commission fee on successful transactions. Fee structures are clearly
              displayed during the listing process and are agreed upon before any transaction is completed.
            </p>

            <h2>6. Intellectual Property Rights</h2>
            <p>
              The service and its original content, features, and functionality are and will remain the
              exclusive property of StartExus and its licensors. The service is protected by copyright,
              trademark, and other laws.
            </p>

            <h2>7. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your
              use of the service, to understand our practices.
            </p>

            <h2>8. Disclaimers</h2>
            <h3>8.1 No Warranty</h3>
            <p>
              The service is provided on an "as is" and "as available" basis. StartExus makes no representations
              or warranties of any kind, express or implied, as to the operation of the service or the information,
              content, materials, or products included on the service.
            </p>

            <h3>8.2 Investment Risk</h3>
            <p>
              Buying and selling businesses involves significant risk. Users acknowledge that all investment
              decisions are made at their own risk and StartExus is not responsible for any losses incurred.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              StartExus will not be liable for any damages of any kind arising from the use of this service,
              including but not limited to direct, indirect, incidental, punitive, and consequential damages.
              Our total liability shall not exceed the fees paid by you in the twelve months preceding the claim.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless StartExus and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs,
              expenses, or fees arising out of or relating to your use of the service.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior
              notice or liability, under our sole discretion, for any reason whatsoever, including but not limited
              to a breach of the Terms.
            </p>

            <h2>12. Dispute Resolution</h2>
            <h3>12.1 Binding Arbitration</h3>
            <p>
              Any dispute arising out of or relating to these Terms or the service shall be resolved through
              binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h3>12.2 Class Action Waiver</h3>
            <p>
              You agree that any arbitration or proceeding shall be limited to the dispute between us and you
              individually. You waive your right to participate in a class action lawsuit or class-wide arbitration.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the State of Delaware, without regard
              to its conflict of law provisions.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we
              will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2>15. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be
              changed and interpreted to accomplish the objectives of such provision to the greatest extent
              possible under applicable law and the remaining provisions will continue in full force and effect.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: info@startexus.com</li>
            </ul>

            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> January 1, 2025<br />
                <strong>Effective Date:</strong> January 1, 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}