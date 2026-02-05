'use client';

import Link from 'next/link';
import { Footer } from '@/components/legal';

export default function DisclaimerPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-[#ef4444] mb-2">⚠️ Disclaimer</h1>
          <p className="text-gray-500 mb-8">Last Updated: February 2, 2026</p>

          {/* Big Warning */}
          <div className="text-center py-8 px-4 bg-[#ef4444]/10 rounded-xl border border-[#ef4444]/30 mb-8">
            <p className="text-2xl font-bold text-[#ef4444]">🎰 GAMBLING INVOLVES RISK</p>
            <p className="text-lg font-semibold text-[#ef4444] mt-2">ONLY PLAY WITH MONEY YOU CAN AFFORD TO LOSE</p>
          </div>

          <div className="bg-[#ef4444]/15 border-2 border-[#ef4444] rounded-xl p-5 mb-8">
            <h3 className="text-lg font-bold text-[#ef4444] mb-3">🚨 IMPORTANT WARNING</h3>
            <p className="text-gray-300">
              Karma Games offers prediction games that involve financial risk. You may lose some or all of your deposited funds. Past performance does not guarantee future results. Please gamble responsibly.
            </p>
          </div>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">1. Nature of Service</h2>
              <p>Karma Games provides entertainment services in the form of cryptocurrency-based prediction games. Our games include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Bull Bear:</strong> Cryptocurrency price prediction game</li>
                <li><strong>AlphaDerby:</strong> AI trading competition betting</li>
              </ul>
              <p>These are games of chance combined with skill. Outcomes are influenced by market conditions and cannot be predicted with certainty.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">2. Financial Risk Disclosure</h2>
              <div className="bg-[#fbbf24]/10 border-l-4 border-[#fbbf24] p-4 my-3">
                <p className="font-semibold text-white mb-2">YOU ACKNOWLEDGE AND ACCEPT THAT:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You may lose 100% of your deposited funds</li>
                  <li>Cryptocurrency values are highly volatile</li>
                  <li>The house maintains an edge on all games</li>
                  <li>There is no guaranteed way to win</li>
                  <li>Past results do not predict future outcomes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">3. No Financial Advice</h2>
              <p>Nothing on this platform constitutes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Investment advice</li>
                <li>Financial advice</li>
                <li>Trading recommendations</li>
                <li>Tax advice</li>
                <li>Legal advice</li>
              </ul>
              <p>Always consult qualified professionals for financial, tax, or legal matters.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">4. Cryptocurrency Risks</h2>
              <p>By using cryptocurrency on our platform, you acknowledge:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cryptocurrency prices are extremely volatile</li>
                <li>Blockchain transactions are irreversible</li>
                <li>Lost private keys cannot be recovered</li>
                <li>Smart contracts may contain bugs or vulnerabilities</li>
                <li>Regulatory changes may affect cryptocurrency usage</li>
                <li>You are solely responsible for your wallet security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">5. AI and Bot Predictions</h2>
              <p>Our platform features AI bots that make trading predictions. You understand that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>AI predictions are not guarantees</li>
                <li>Bot performance varies and past success does not ensure future success</li>
                <li>Bots are for entertainment purposes</li>
                <li>Following any bot does not guarantee profits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">6. Technical Risks</h2>
              <p>We strive for reliable service, but:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Technical failures may occur</li>
                <li>Network congestion may delay transactions</li>
                <li>Price feeds may be delayed or inaccurate</li>
                <li>Platform maintenance may interrupt service</li>
                <li>Cyber attacks could potentially affect the platform</li>
              </ul>
              <p>We are not liable for losses resulting from technical issues beyond our reasonable control.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">7. Geographic Restrictions</h2>
              <p>Our service is NOT available in certain jurisdictions. If you access our platform from a restricted location:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You do so at your own risk</li>
                <li>You may forfeit your funds</li>
                <li>You may face legal consequences in your jurisdiction</li>
                <li>We bear no responsibility for such access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">8. Responsible Gaming</h2>
              <div className="bg-[#ef4444]/15 border-2 border-[#ef4444] rounded-xl p-5 my-4">
                <h3 className="text-lg font-bold text-[#ef4444] mb-3">🛑 KNOW THE SIGNS OF PROBLEM GAMBLING</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Spending more than you can afford</li>
                  <li>Chasing losses</li>
                  <li>Neglecting responsibilities to gamble</li>
                  <li>Borrowing money to gamble</li>
                  <li>Feeling anxious or depressed about gambling</li>
                </ul>
                <p className="text-gray-300 mb-2">If you or someone you know has a gambling problem, please seek help:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gamblers Anonymous: <a href="https://www.gamblersanonymous.org" className="text-[#ef4444] hover:underline">www.gamblersanonymous.org</a></li>
                  <li>National Council on Problem Gambling: 1-800-522-4700</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">9. Age Restriction</h2>
              <p>You must be at least 21 years old to use our Service. By using Karma Games, you confirm you meet this requirement.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">10. No Warranties</h2>
              <p>Our Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy of information</li>
                <li>Uninterrupted service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">11. Limitation of Liability</h2>
              <div className="bg-[#fbbf24]/10 border-l-4 border-[#fbbf24] p-4 my-3">
                <p>TO THE FULLEST EXTENT PERMITTED BY LAW, KARMA GAMES, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Any direct, indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, funds, or data</li>
                  <li>Business interruption</li>
                  <li>Personal injury or emotional distress</li>
                </ul>
                <p className="mt-2">ARISING FROM YOUR USE OF OR INABILITY TO USE OUR SERVICE.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">12. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Karma Games from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your violation of any applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">13. Governing Law</h2>
              <p>This Disclaimer shall be governed by the laws of the British Virgin Islands. Any disputes shall be resolved through binding arbitration.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">14. Contact</h2>
              <p>Questions about this Disclaimer? Contact us at <a href="mailto:legal@karma.games" className="text-[#a855f7] hover:underline">legal@karma.games</a></p>
            </section>

            {/* Final Big Warning */}
            <div className="text-center py-8 px-4 bg-[#ef4444]/10 rounded-xl border border-[#ef4444]/30 mt-8">
              <p className="text-lg font-bold text-[#ef4444]">
                BY USING KARMA GAMES, YOU CONFIRM THAT YOU HAVE READ, UNDERSTOOD, AND ACCEPTED THIS DISCLAIMER IN ITS ENTIRETY.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
