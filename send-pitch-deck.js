const nodemailer = require('nodemailer');
const fs = require('fs');

async function main() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'jeremy.kim214@gmail.com',
      pass: 'egpklidrlzmqafna'
    }
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a1a; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%); color: #fff; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
    
    <div style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div style="font-size: 48px; margin-bottom: 15px;">🐂⚔️🐻</div>
      <h1 style="margin: 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #22c55e 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bull Bear</h1>
      <p style="margin: 10px 0 0 0; color: #888; font-size: 16px;">Investment Memo — Final Version</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="color: #ccc; line-height: 1.8; font-size: 15px;">
        투자설명서 최종 버전을 첨부합니다.
      </p>
      
      <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 3px solid #22c55e;">
        <h3 style="color: #22c55e; margin: 0 0 10px 0; font-size: 16px;">📋 Key Highlights</h3>
        <ul style="color: #ccc; margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
          <li>BTC 가격 예측 바이노미얼 게임</li>
          <li>Telegram Mini App으로 제작</li>
          <li>8개 AI 봇 + 자동 팔로우 시스템</li>
          <li>승률 기반 동적 수수료 구조</li>
          <li>평균 하우스 엣지 ~3.4%</li>
          <li>TON Connect 지갑 연동 완료</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://bullbear-telegram.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 16px;">🚀 라이브 앱 확인</a>
      </div>
      
      <p style="color: #888; font-size: 13px; text-align: center; margin: 0;">📎 상세 투자설명서는 첨부 파일 참고</p>
    </div>
    
    <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center;">
      <p style="margin: 0; color: #555; font-size: 12px;">Bull Bear © 2026</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: '"Bull Bear" <jeremy.kim214@gmail.com>',
      to: 'noopy777@gmail.com',
      subject: 'Bull Bear - Investment Memo (Final Version)',
      html: htmlContent,
      attachments: [
        {
          filename: 'BullBear_Investment_Memo.html',
          path: '/home/noopy777/clawd/bullbear-telegram/pitch-deck.html'
        }
      ]
    });
    console.log('✅ 이메일 전송 성공!');
    console.log('📧 수신자: noopy777@gmail.com');
    console.log('📎 Message ID:', info.messageId);
  } catch (err) {
    console.log('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
