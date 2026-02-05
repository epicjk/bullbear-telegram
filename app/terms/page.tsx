'use client';

import Link from 'next/link';
import { Footer } from '@/components/legal';

export default function TermsPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-[#a855f7] mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: February 2, 2026</p>

          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 mb-8">
            <p className="text-gray-300">
              <span className="font-semibold text-[#ef4444]">⚠️ IMPORTANT:</span> By using Karma Games, you acknowledge that online gaming involves financial risk. Only participate with funds you can afford to lose.
            </p>
          </div>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using Karma Games ("Service", "Platform", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">2. Eligibility</h2>
              <p>To use our Service, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be at least 21 years of age</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be located in a restricted jurisdiction (see Section 3)</li>
                <li>Not be prohibited from participating in online gaming under applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">3. Restricted Jurisdictions</h2>
              <p>Our Service is NOT available to residents or citizens of the following jurisdictions:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>United States of America and its territories</li>
                <li>United Kingdom</li>
                <li>France</li>
                <li>Australia</li>
                <li>Singapore</li>
                <li>Hong Kong</li>
                <li>South Korea</li>
                <li>China (including Macau)</li>
                <li>Japan</li>
                <li>Germany</li>
                <li>Netherlands</li>
                <li>Belgium</li>
                <li>Any other jurisdiction where online gaming is prohibited</li>
              </ul>
              <p>Users are responsible for ensuring compliance with their local laws. We reserve the right to restrict access from any jurisdiction at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">4. Account and Wallet</h2>
              <p>To use certain features, you must connect a compatible cryptocurrency wallet. You are solely responsible for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining the security of your wallet and private keys</li>
                <li>All activities that occur through your connected wallet</li>
                <li>Ensuring you have sufficient funds for transactions</li>
              </ul>
              <p>We do not have access to your private keys and cannot recover lost funds.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">5. Cryptocurrency Transactions</h2>
              <p>All transactions on our Platform are conducted exclusively in cryptocurrency. By using our Service, you acknowledge:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All deposits and withdrawals are processed on-chain</li>
                <li>Transactions are irreversible once confirmed on the blockchain</li>
                <li>You are responsible for transaction fees (gas fees)</li>
                <li>Cryptocurrency values are volatile and may fluctuate</li>
                <li>We do not accept fiat currency, credit cards, or traditional payment methods</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">6. Games and Betting</h2>
              <p>Our Platform offers prediction games including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Bull Bear - Cryptocurrency price prediction</li>
                <li>AlphaDerby - AI trading competition betting</li>
              </ul>
              <p>All games involve an element of chance and financial risk. Past performance does not guarantee future results.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">7. House Edge and Fees</h2>
              <p>Our games operate with a house edge, which varies by game type. Fee structures are displayed before placing any bet. By participating, you accept these fees.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">8. Prohibited Activities</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Service if you are in a restricted jurisdiction</li>
                <li>Use VPN or other tools to circumvent geographic restrictions</li>
                <li>Create multiple accounts or use bots</li>
                <li>Engage in money laundering or fraudulent activities</li>
                <li>Manipulate or exploit any bugs or vulnerabilities</li>
                <li>Collude with other users</li>
                <li>Use the Service for any illegal purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">9. Anti-Money Laundering (AML) Policy</h2>
              <p>Karma Games is committed to preventing money laundering and terrorist financing. By using our Service, you agree to the following:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You will not use our platform to launder money or finance illegal activities</li>
                <li>All funds deposited are from legitimate sources</li>
                <li>You are the rightful owner of the wallet and funds you use</li>
                <li>You will not use our Service to convert illegally obtained funds</li>
              </ul>
              <p className="mt-3">We reserve the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Monitor transactions for suspicious activity</li>
                <li>Request additional verification if suspicious patterns are detected</li>
                <li>Freeze accounts pending investigation</li>
                <li>Report suspicious activities to relevant authorities</li>
                <li>Refuse or reverse transactions that appear to violate this policy</li>
              </ul>
              <p>Violation of this AML policy will result in immediate account termination and forfeiture of funds.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">10. Refund Policy</h2>
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3 my-3">
                <p><strong className="text-[#ef4444]">NO REFUNDS:</strong> All deposits and bets are final. Once a transaction is confirmed on the blockchain or a bet is placed, it cannot be reversed or refunded. By using our Service, you acknowledge and accept this no-refund policy.</p>
              </div>
              <p>Exceptions may be made solely at our discretion in cases of:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verified technical errors on our part</li>
                <li>Duplicate transactions caused by system malfunction</li>
              </ul>
              <p>To request an exception review, contact <a href="mailto:support@karma.games" className="text-[#a855f7] hover:underline">support@karma.games</a> with transaction details.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">11. Intellectual Property</h2>
              <p>All content, trademarks, and intellectual property on the Platform belong to Karma Games or its licensors. You may not copy, modify, or distribute our content without permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">12. Limitation of Liability</h2>
              <div className="bg-[#a855f7]/10 border-l-4 border-[#a855f7] p-4 my-3">
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, KARMA GAMES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR FUNDS.</p>
              </div>
              <p>Our total liability shall not exceed the amount you deposited in the last 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">13. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Karma Games, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">14. Modifications</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Continued use of the Service constitutes acceptance of modified Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">15. Termination</h2>
              <p>We may suspend or terminate your access to the Service at any time, for any reason, without notice. Upon termination, you may withdraw any remaining balance subject to our withdrawal policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">16. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the British Virgin Islands, without regard to conflict of law principles.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">17. Dispute Resolution</h2>
              <p>Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the International Chamber of Commerce (ICC). The seat of arbitration shall be the British Virgin Islands.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">18. Severability</h2>
              <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">19. Contact</h2>
              <p>For questions about these Terms, please contact us at: <a href="mailto:legal@karma.games" className="text-[#a855f7] hover:underline">legal@karma.games</a></p>
            </section>

            <div className="bg-[#a855f7]/10 border-l-4 border-[#a855f7] p-4 mt-8">
              <p className="font-semibold text-white">By using Karma Games, you confirm that you have read, understood, and agree to these Terms of Service.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
