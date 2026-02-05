/**
 * Bull & Bear 다국어 번역 파일
 * 한국어(ko) / 영어(en) 지원
 */

export type Language = 'ko' | 'en';

export const translations = {
  // ============================================================
  // Common
  // ============================================================
  common: {
    balance: { ko: '잔액', en: 'BALANCE' },
    round: { ko: '라운드', en: 'ROUND' },
    cancel: { ko: '취소', en: 'CANCEL' },
    confirm: { ko: '확인', en: 'CONFIRM' },
    close: { ko: '닫기', en: 'CLOSE' },
    connect: { ko: '연결', en: 'CONNECT' },
    disconnect: { ko: '연결 해제', en: 'DISCONNECT' },
    settings: { ko: '설정', en: 'SETTINGS' },
    history: { ko: '기록', en: 'HISTORY' },
    stats: { ko: '통계', en: 'STATS' },
    howToPlay: { ko: '게임 방법', en: 'HOW TO PLAY' },
    leaderboard: { ko: '리더보드', en: 'LEADERBOARD' },
  },

  // ============================================================
  // Header
  // ============================================================
  header: {
    betting: { ko: '베팅 중', en: 'BETTING' },
    locking: { ko: '마감 중', en: 'LOCKING' },
    live: { ko: '라이브', en: 'LIVE' },
    result: { ko: '결과', en: 'RESULT' },
    connected: { ko: '연결됨', en: 'Connected' },
    disconnected: { ko: '연결 끊김', en: 'Disconnected' },
  },

  // ============================================================
  // Betting Panel
  // ============================================================
  betting: {
    yourBet: { ko: '내 베팅', en: 'YOUR BET' },
    noPosition: { ko: '베팅 없음', en: 'NO POSITION' },
    potentialWin: { ko: '예상 수익', en: 'POTENTIAL WIN' },
    placeBet: { ko: '베팅하기', en: 'PLACE YOUR BET' },
    betAmount: { ko: '베팅 금액', en: 'BET AMOUNT' },
    minBet: { ko: '최소: $1', en: 'Min: $1' },
    maxBet: { ko: '최대: $10,000', en: 'Max: $10,000' },
    priceUp: { ko: '가격 상승', en: 'Price Goes UP' },
    priceDown: { ko: '가격 하락', en: 'Price Goes DOWN' },
    potential: { ko: '예상', en: 'Potential' },
    bull: { ko: '상승', en: 'BULL' },
    bear: { ko: '하락', en: 'BEAR' },
    repeat: { ko: '반복', en: 'REPEAT' },
    double: { ko: '2배', en: 'x2' },
    clear: { ko: '클리어', en: 'CLR' },
    max: { ko: '최대', en: 'MAX' },
  },

  // ============================================================
  // Session Stats
  // ============================================================
  stats: {
    sessionStats: { ko: '세션 통계', en: 'SESSION STATS' },
    bullWins: { ko: 'BULL 승리', en: 'BULL WINS' },
    bearWins: { ko: 'BEAR 승리', en: 'BEAR WINS' },
    todayPnl: { ko: '오늘 손익', en: 'TODAY P&L' },
    totalRounds: { ko: '총 라운드', en: 'ROUNDS' },
    winRate: { ko: '승률', en: 'WIN RATE' },
    totalBets: { ko: '총 베팅', en: 'TOTAL BETS' },
    wins: { ko: '승리', en: 'WINS' },
    losses: { ko: '패배', en: 'LOSSES' },
    ties: { ko: '무승부', en: 'TIES' },
    profit: { ko: '수익', en: 'PROFIT' },
    loss: { ko: '손실', en: 'LOSS' },
  },

  // ============================================================
  // Game Result
  // ============================================================
  result: {
    youWin: { ko: '승리!', en: 'YOU WIN!' },
    youLose: { ko: '패배', en: 'YOU LOSE' },
    tie: { ko: '무승부', en: 'TIE' },
    bullWin: { ko: 'BULL 승리!', en: 'BULL WIN!' },
    bearWin: { ko: 'BEAR 승리!', en: 'BEAR WIN!' },
    tieResult: { ko: '무승부!', en: 'TIE!' },
    betRefunded: { ko: '베팅금액 환불', en: 'Bet Refunded' },
    profit: { ko: '수익', en: 'PROFIT' },
    roundResult: { ko: '라운드 결과', en: 'ROUND RESULT' },
    closePrice: { ko: '종가', en: 'CLOSE PRICE' },
  },

  // ============================================================
  // Wallet
  // ============================================================
  wallet: {
    connectWallet: { ko: '지갑 연결', en: 'CONNECT WALLET' },
    walletConnected: { ko: '지갑 연결됨', en: 'WALLET CONNECTED' },
    demoMode: { ko: '데모 모드', en: 'DEMO MODE' },
    demoBalance: { ko: '데모 잔액', en: 'DEMO BALANCE' },
    realBalance: { ko: '실제 잔액', en: 'REAL BALANCE' },
    deposit: { ko: '입금', en: 'DEPOSIT' },
    withdraw: { ko: '출금', en: 'WITHDRAW' },
  },

  // ============================================================
  // Alerts & Notifications
  // ============================================================
  alerts: {
    betNow: { ko: '지금 베팅하세요!', en: 'BET NOW!' },
    timeRunningOut: { ko: '시간이 얼마 남지 않았어요!', en: 'Time is running out!' },
    secondsLeft: { ko: '초 남음', en: 'seconds left' },
    newRound: { ko: '새 라운드 시작', en: 'New Round Started' },
    insufficientBalance: { ko: '잔액이 부족합니다', en: 'Insufficient balance' },
    betPlaced: { ko: '베팅이 완료되었습니다', en: 'Bet placed' },
    betCancelled: { ko: '베팅이 취소되었습니다', en: 'Bet cancelled' },
    joinedMidRound: { ko: '라운드 중간에 참여했습니다. 다음 라운드부터 베팅 가능합니다.', en: 'Joined mid-round. You can bet from the next round.' },
  },

  // ============================================================
  // Tutorial
  // ============================================================
  tutorial: {
    systemTutorialMode: { ko: '시스템.튜토리얼_모드', en: 'SYSTEM.TUTORIAL_MODE' },
    bullAndBearTutorial: { ko: 'BULL & BEAR 튜토리얼', en: 'BULL & BEAR TUTORIAL' },
    
    // Step 1
    step1Title: { ko: '방향을 선택하세요', en: 'Choose Your Side' },
    step1Desc: { ko: 'BTC가 오를까요, 내릴까요?\n상승에 BULL, 하락에 BEAR를 선택하세요.', en: 'Will BTC go UP or DOWN?\nPick BULL for up, BEAR for down.' },
    
    // Step 2
    step2Title: { ko: '1분을 기다리세요', en: 'Wait for 1 Minute' },
    step2Desc: { ko: '베팅하면 밝은 진입선이 나타납니다.\n60초 타이머가 카운트다운되는 것을 지켜보세요.', en: 'Once you bet, a bright Entry Line appears.\nWatch the chart as the 60 second timer counts down.' },
    entryLine: { ko: '진입선', en: 'ENTRY LINE' },
    countdown: { ko: '카운트다운', en: 'Countdown' },
    liveFeed: { ko: '실시간_피드::BTC-USD', en: 'LIVE_FEED::BTC-USD' },
    
    // Step 3
    step3Title: { ko: '결과를 확인하세요', en: 'Check Your Result' },
    step3Desc: { ko: '60초 후, 승리 또는 패배를 확인하세요.\n수익은 즉시 지갑에 입금됩니다.', en: 'After 60 seconds, see if you WIN or LOSE.\nProfits are credited instantly to your wallet.' },
    win: { ko: '승리', en: 'WIN' },
    lose: { ko: '패배', en: 'LOSE' },
    priceWentYourWay: { ko: '예측이 맞았습니다', en: 'Price went your way' },
    priceWentAgainstYou: { ko: '예측이 틀렸습니다', en: 'Price went against you' },
    profitPercent: { ko: '+95% 수익', en: '+95% Profit' },
    betLost: { ko: '베팅 손실', en: 'Bet Lost' },
    
    // Buttons
    nextStep: { ko: '다음 단계', en: 'NEXT STEP' },
    startGame: { ko: '게임 시작', en: 'START GAME' },
    skipTutorial: { ko: '튜토리얼 건너뛰기', en: 'Skip Tutorial' },
  },

  // ============================================================
  // How to Play Modal
  // ============================================================
  howToPlayModal: {
    title: { ko: '플레이 방법', en: 'How to Play' },
    
    // Steps
    step1Title: { ko: '지갑 연결하기', en: 'Connect Wallet' },
    step1Desc: {
      ko: '상단의 CONNECT 버튼을 눌러 MetaMask, Phantom 등 지갑을 연결하세요.',
      en: 'Click the CONNECT button to connect your MetaMask, Phantom, or other wallet.'
    },
    
    step2Title: { ko: '방향 예측하기', en: 'Predict Direction' },
    step2Desc: {
      ko: '1분 후 BTC 가격이 오를지 내릴지 예측하세요. 🐂 BULL = 상승, 🐻 BEAR = 하락',
      en: 'Predict if BTC price will go up or down in 1 minute. 🐂 BULL = Up, 🐻 BEAR = Down'
    },
    
    step3Title: { ko: '베팅하기', en: 'Place Your Bet' },
    step3Desc: {
      ko: '베팅 금액을 입력하고 BULL 또는 BEAR 버튼을 클릭하세요. 베팅은 25초 내에만 가능합니다.',
      en: 'Enter your bet amount and click BULL or BEAR. Betting is only available for 25 seconds.'
    },
    
    step4Title: { ko: '결과 확인', en: 'See Results' },
    step4Desc: {
      ko: '30초의 게임 시간이 끝나면 결과가 발표됩니다. 맞추면 1.95배 보상!',
      en: 'After 30 seconds of game time, results are announced. Win and get 1.95x payout!'
    },
    
    step5Title: { ko: '보상 수령', en: 'Claim Rewards' },
    step5Desc: {
      ko: '승리하면 자동으로 보상이 지급됩니다!',
      en: 'If you win, rewards are automatically paid out!'
    },
    
    // Timeline
    timelineTitle: { ko: '⏱️ 라운드 구조 (1분)', en: '⏱️ Round Structure (1 min)' },
    betting: { ko: '베팅', en: 'BETTING' },
    noBet: { ko: '마감', en: 'NO BET' },
    game: { ko: '게임', en: 'GAME' },
    
    // Payout
    payoutTitle: { ko: '💰 보상 구조', en: '💰 Payout Structure' },
    payoutWin: { ko: '승리 시', en: 'Win' },
    payoutWinVal: { ko: '베팅 × 1.95', en: 'Bet × 1.95' },
    payoutLose: { ko: '패배 시', en: 'Lose' },
    payoutLoseVal: { ko: '베팅 금액 손실', en: 'Lose bet amount' },
    payoutTie: { ko: '무승부 (동일 가격)', en: 'Tie (Same price)' },
    payoutTieVal: { ko: '베팅 금액 환불', en: 'Bet refunded' },
    
    // Warning
    warningTitle: { ko: '⚠️ 주의사항', en: '⚠️ Important Notes' },
    warning1: { ko: '베팅이 가능한 25초 동안에만 베팅의 수정 및 취소가 가능합니다.', en: 'Bets can only be modified or cancelled during the 25-second betting window.' },
    warning2: { ko: '25초 이후에는 해당 라운드에 베팅할 수 없습니다.', en: 'You cannot bet after 25 seconds.' },
    warning3: { ko: '소수점 2자리까지 가격이 동일하면 무승부로 처리됩니다.', en: "If price is same to 2 decimal places, it's a tie." },
    warning4: { ko: '네트워크 상태에 따라 지연이 발생할 수 있습니다.', en: 'Delays may occur depending on network conditions.' },
    
    // Badge
    binanceBadge: {
      ko: 'Binance 공식 API 사용 · 실시간 BTC/USDT Spot 가격과 100% 동일',
      en: 'Powered by Binance Official API · 100% Real-time BTC/USDT Spot Price'
    },
  },

  // ============================================================
  // Settings Modal
  // ============================================================
  settingsModal: {
    title: { ko: '설정', en: 'SETTINGS' },
    sound: { ko: '사운드', en: 'SOUND' },
    volume: { ko: '볼륨', en: 'VOLUME' },
    theme: { ko: '테마', en: 'THEME' },
    dark: { ko: '다크', en: 'DARK' },
    light: { ko: '라이트', en: 'LIGHT' },
    language: { ko: '언어', en: 'LANGUAGE' },
    korean: { ko: '한국어', en: 'Korean' },
    english: { ko: 'English', en: 'English' },
    betAlert: { ko: '베팅 알림', en: 'BET ALERT' },
    effects: { ko: '이펙트', en: 'EFFECTS' },
    confetti: { ko: '색종이 효과', en: 'Confetti' },
    shockwave: { ko: '충격파', en: 'Shockwave' },
    heartbeat: { ko: '하트비트', en: 'Heartbeat' },
    glow: { ko: '글로우', en: 'Glow' },
  },

  // ============================================================
  // History Modal
  // ============================================================
  historyModal: {
    title: { ko: '베팅 기록', en: 'BET HISTORY' },
    noHistory: { ko: '기록이 없습니다', en: 'No history' },
    won: { ko: '승리', en: 'WON' },
    lost: { ko: '패배', en: 'LOST' },
    refunded: { ko: '환불', en: 'REFUNDED' },
    roundNumber: { ko: '라운드', en: 'Round' },
    viewDetails: { ko: '상세 보기', en: 'View Details' },
  },

  // ============================================================
  // Leaderboard Modal
  // ============================================================
  leaderboardModal: {
    title: { ko: '리더보드', en: 'LEADERBOARD' },
    rank: { ko: '순위', en: 'RANK' },
    player: { ko: '플레이어', en: 'PLAYER' },
    totalWins: { ko: '총 승리', en: 'TOTAL WINS' },
    totalProfit: { ko: '총 수익', en: 'TOTAL PROFIT' },
    noData: { ko: '데이터가 없습니다', en: 'No data available' },
  },

  // ============================================================
  // Round Detail Modal
  // ============================================================
  roundDetailModal: {
    title: { ko: '라운드 상세', en: 'ROUND DETAILS' },
    startPrice: { ko: '시작가', en: 'START PRICE' },
    endPrice: { ko: '종가', en: 'END PRICE' },
    priceChange: { ko: '가격 변동', en: 'PRICE CHANGE' },
    yourBet: { ko: '내 베팅', en: 'YOUR BET' },
    betAmount: { ko: '베팅 금액', en: 'BET AMOUNT' },
    payout: { ko: '지급액', en: 'PAYOUT' },
    timestamp: { ko: '시간', en: 'TIME' },
  },

  // ============================================================
  // Base Price Reveal
  // ============================================================
  baseReveal: {
    gameStart: { ko: '게임 시작!', en: 'GAME START!' },
    basePrice: { ko: '기준 가격', en: 'BASE PRICE' },
    yourPrediction: { ko: '나의 예측', en: 'YOUR PREDICTION' },
    goesUp: { ko: '상승', en: 'Goes UP' },
    goesDown: { ko: '하락', en: 'Goes DOWN' },
  },

  // ============================================================
  // Victory Overlay
  // ============================================================
  victory: {
    youWon: { ko: '승리!', en: 'YOU WON!' },
    profit: { ko: '수익', en: 'PROFIT' },
    round: { ko: '라운드', en: 'Round' },
    closePrice: { ko: '종가', en: 'Close' },
    tapToClose: { ko: '탭하여 닫기', en: 'Tap to close' },
  },

  // ============================================================
  // Chart / Game UI
  // ============================================================
  chart: {
    start: { ko: '시작', en: 'START' },
    currentPrice: { ko: '현재가', en: 'CURRENT' },
    basePrice: { ko: '기준가', en: 'BASE' },
  },

  // ============================================================
  // Menu
  // ============================================================
  menu: {
    myBets: { ko: '내 베팅', en: 'MY BETS' },
    roadmap: { ko: '로드맵', en: 'ROADMAP' },
    chat: { ko: '채팅', en: 'CHAT' },
  },

  // ============================================================
  // Game Mode Toggle
  // ============================================================
  gameMode: {
    directBetting: { ko: '🎯 직접 베팅', en: '🎯 Direct Bet' },
    aiBattle: { ko: '🤖 AI 배틀', en: '🤖 AI Battle' },
    selectMode: { ko: '게임 모드', en: 'Game Mode' },
  },

  // ============================================================
  // AI Battle Mode
  // ============================================================
  aiBattle: {
    title: { ko: 'AI 배틀', en: 'AI BATTLE' },
    subtitle: { ko: '봇에 베팅하세요!', en: 'Bet on bots!' },
    selectBot: { ko: '봇 선택', en: 'Select Bot' },
    betOnBot: { ko: '이 봇에 베팅', en: 'Bet on this bot' },
    winRate: { ko: '승률', en: 'Win Rate' },
    odds: { ko: '배당', en: 'Odds' },
    expectedOdds: { ko: '예상 배당률', en: 'Expected Odds' },
    potentialWin: { ko: '예상 수익', en: 'Potential Win' },
    placeBet: { ko: '베팅하기', en: 'PLACE BET' },
    yourBet: { ko: '내 베팅', en: 'YOUR BET' },
    prediction: { ko: '예측', en: 'Prediction' },
    bullPrediction: { ko: '🐂 BULL 예측', en: '🐂 BULL Prediction' },
    bearPrediction: { ko: '🐻 BEAR 예측', en: '🐻 BEAR Prediction' },
    record: { ko: '전적', en: 'Record' },
    wins: { ko: '승', en: 'W' },
    losses: { ko: '패', en: 'L' },
    winStreak: { ko: '연승', en: 'Win Streak' },
    loseStreak: { ko: '연패', en: 'Lose Streak' },
    totalPool: { ko: '총 베팅 풀', en: 'Total Pool' },
    fee: { ko: '수수료', en: 'Fee' },
    // Premium/Challenge tier labels
    premiumHigh: { ko: '프리미엄', en: 'Premium' },
    premiumMid: { ko: '프리미엄', en: 'Premium' },
    challenge: { ko: '도전', en: 'Challenge' },
    // Tooltips for tier icons
    tooltipPremiumHigh: { ko: '프리미엄 봇 - 수수료 10%', en: 'Premium Bot - 10% fee' },
    tooltipPremiumMid: { ko: '프리미엄 봇 - 수수료 5%', en: 'Premium Bot - 5% fee' },
    tooltipChallenge: { ko: '도전 봇 - 수수료 1.5%', en: 'Challenge Bot - 1.5% fee' },
    // Bot descriptions
    botStyles: {
      'based-ape': { ko: '모멘텀 추종 · 상승 편향', en: 'Momentum · Bull Bias' },
      'liquidator': { ko: '과열 감지 · 하락 편향', en: 'Overheat Detect · Bear Bias' },
      'full-degen': { ko: '완전 랜덤 · 운에 올인', en: 'Pure Random · All In Luck' },
    },
  },
} as const;

// Helper type for translation keys
export type TranslationKey = keyof typeof translations;
export type TranslationSection<K extends TranslationKey> = keyof typeof translations[K];

// Helper function to get translation
export function t<K extends TranslationKey, S extends TranslationSection<K>>(
  lang: Language,
  section: K,
  key: S
): string {
  const value = translations[section]?.[key];
  if (value && typeof value === 'object' && lang in value) {
    return (value as unknown as Record<Language, string>)[lang];
  }
  return String(key);
}
