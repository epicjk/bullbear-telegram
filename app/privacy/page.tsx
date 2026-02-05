'use client';

import Link from 'next/link';
import { Footer } from '@/components/legal';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Game
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-[#a855f7] mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: February 2, 2026</p>

          <div className="bg-[#a855f7]/10 border-l-4 border-[#a855f7] p-4 mb-8">
            <p className="text-gray-300">
              Karma Games ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
          </div>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-200 mt-4">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Wallet Address:</strong> Your public cryptocurrency wallet address when you connect to our platform</li>
                <li><strong>Telegram Data:</strong> Basic profile information (user ID, username) when accessing via Telegram</li>
                <li><strong>Communications:</strong> Information you provide when contacting support</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-200 mt-4">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>IP Address:</strong> Used for geographic restriction compliance and security</li>
                <li><strong>Transaction Data:</strong> Betting history, deposits, withdrawals (linked to wallet address)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-200 mt-4">1.3 Information We Do NOT Collect</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Real names or identity documents</li>
                <li>Email addresses (unless you contact support)</li>
                <li>Phone numbers</li>
                <li>Physical addresses</li>
                <li>Private keys or seed phrases</li>
                <li>Bank account or credit card information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">2. How We Use Your Information</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse my-4">
                  <thead>
                    <tr className="bg-[#1a1a2e]">
                      <th className="border border-white/10 p-3 text-left text-white">Purpose</th>
                      <th className="border border-white/10 p-3 text-left text-white">Data Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-3">Provide gaming services</td>
                      <td className="border border-white/10 p-3">Wallet address, transaction data</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Process transactions</td>
                      <td className="border border-white/10 p-3">Wallet address</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Prevent fraud and abuse</td>
                      <td className="border border-white/10 p-3">IP address, device info, usage patterns</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Enforce geographic restrictions</td>
                      <td className="border border-white/10 p-3">IP address</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Improve our services</td>
                      <td className="border border-white/10 p-3">Usage data, anonymized analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Customer support</td>
                      <td className="border border-white/10 p-3">Communications, transaction history</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-3">Referral program</td>
                      <td className="border border-white/10 p-3">Wallet address, referral relationships</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">3. Blockchain Data</h2>
              <p>Please note that blockchain transactions are publicly visible. When you interact with our smart contracts:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your wallet address and transaction history are recorded on the public blockchain</li>
                <li>This data cannot be deleted or modified</li>
                <li>Anyone can view blockchain transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">4. Data Sharing</h2>
              <p>We do NOT sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service Providers:</strong> Hosting, analytics, and security services (under strict confidentiality)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">5. Data Security</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits</li>
                <li>Access controls and monitoring</li>
                <li>Secure infrastructure providers</li>
              </ul>
              <p>However, no system is 100% secure. You are responsible for protecting your wallet and private keys.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">6. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Transaction Data:</strong> Retained indefinitely for audit and compliance purposes</li>
                <li><strong>Usage Data:</strong> Retained for 2 years</li>
                <li><strong>Support Communications:</strong> Retained for 1 year after resolution</li>
                <li><strong>IP Logs:</strong> Retained for 90 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">7. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Session management</li>
                <li>Remembering your preferences (language, etc.)</li>
                <li>Analytics (anonymized)</li>
                <li>Security and fraud prevention</li>
              </ul>
              <p>You can control cookies through your browser settings, but some features may not work properly without them.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to processing</li>
                <li>Data portability</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="mailto:privacy@karma.games" className="text-[#a855f7] hover:underline">privacy@karma.games</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">9. Children's Privacy</h2>
              <p>Our Service is not intended for anyone under 21 years of age. We do not knowingly collect information from individuals under 21. If we discover such data, we will delete it immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">10. International Data Transfers</h2>
              <p>Your data may be processed in countries other than your own. By using our Service, you consent to such transfers. We ensure appropriate safeguards are in place.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">11. Third-Party Links</h2>
              <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies separately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">12. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the Service constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">13. Contact Us</h2>
              <p>For privacy-related questions or requests:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: <a href="mailto:privacy@karma.games" className="text-[#a855f7] hover:underline">privacy@karma.games</a></li>
                <li>Telegram: @KarmaGamesSupport</li>
              </ul>
            </section>

            <div className="bg-[#a855f7]/10 border-l-4 border-[#a855f7] p-4 mt-8">
              <p className="font-semibold text-white">By using Karma Games, you acknowledge that you have read and understood this Privacy Policy.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
