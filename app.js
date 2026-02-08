/* ═══════════════════════════════════════════════════════════════
   RISE — Discipline Has a Price
   Full Application Logic
   ═══════════════════════════════════════════════════════════════ */

// ─── RANKS ───
const RANKS = [
  { name:'RECRUIT', xp:0 }, { name:'SOLDIER', xp:100 }, { name:'WARRIOR', xp:500 },
  { name:'COMMANDER', xp:1500 }, { name:'IRON', xp:3500 }, { name:'TITAN', xp:7000 }, { name:'APEX', xp:15000 }
];

// ─── ACHIEVEMENTS ───
const ACHIEVEMENTS = [
  { id:'early_bird', name:'Early Bird', icon:'🌅', desc:'Dismissed your first alarm' },
  { id:'streak_7', name:'7 Day Streak', icon:'🔥', desc:'7 consecutive days' },
  { id:'streak_30', name:'30 Day King', icon:'👑', desc:'30 consecutive days' },
  { id:'streak_100', name:'Century', icon:'💯', desc:'100 consecutive days' },
  { id:'ice_veins', name:'Ice Veins', icon:'🥶', desc:'7 cold showers completed' },
  { id:'iron_body', name:'Iron Body', icon:'💪', desc:'7 days of pushups' },
  { id:'mind_over_bed', name:'Mind Over Bed', icon:'🧠', desc:'First $0 penalty week' },
  { id:'saved_100', name:'$100 Saved', icon:'💰', desc:'Avoided $100 in penalties' },
  { id:'war_victor', name:'War Victor', icon:'⚔️', desc:'Won a War Mode challenge' },
  { id:'apex_status', name:'APEX Status', icon:'⚡', desc:'Reached APEX rank' },
  { id:'no_snooze_week', name:'No Snooze Week', icon:'🚫', desc:'7 days without snoozing' },
  { id:'protocol_master', name:'Protocol Master', icon:'📋', desc:'Full protocol 14 days straight' },
];

// ─── MOCK LEADERBOARD ───
const MOCK_LB = [
  { name:'DisciplineKing', avatar:'🦁', streak:312, rank:'APEX', score:98 },
  { name:'IronMindset', avatar:'🐺', streak:198, rank:'TITAN', score:96 },
  { name:'GrindNeverStops', avatar:'🦅', streak:156, rank:'TITAN', score:94 },
  { name:'AlphaProtocol', avatar:'🐻', streak:134, rank:'IRON', score:91 },
  { name:'NoMercyMike', avatar:'🔥', streak:89, rank:'IRON', score:90 },
  { name:'ColdShowerKid', avatar:'💎', streak:78, rank:'COMMANDER', score:88 },
  { name:'SummitChaser', avatar:'🏔️', streak:67, rank:'COMMANDER', score:86 },
  { name:'HardModeOnly', avatar:'🗿', streak:55, rank:'WARRIOR', score:83 },
  { name:'RiseOrDie', avatar:'☠️', streak:44, rank:'WARRIOR', score:81 },
  { name:'ZeroExcuses', avatar:'🎯', streak:32, rank:'SOLDIER', score:78 },
];

const AVATARS = ['⚡','🦁','🐺','🦅','🔥','💎','🏔️','🗿','☠️','🎯','🐻','👑','💪','🧠','🥶'];
const PRESET_PROTOCOLS = [
  { id:'cold_shower', name:'Cold Shower', icon:'🥶', xp:15, timer:120, enabled:true },
  { id:'pushups', name:'20 Pushups', icon:'💪', xp:10, timer:null, enabled:true },
  { id:'meditation', name:'5 Min Meditation', icon:'🧘', xp:10, timer:300, enabled:true },
  { id:'journal', name:'Journal One Page', icon:'📓', xp:15, timer:null, enabled:false },
  { id:'run', name:'Morning Run', icon:'🏃', xp:20, timer:null, enabled:false },
  { id:'stretching', name:'Stretching', icon:'🤸', xp:10, timer:300, enabled:false },
  { id:'read', name:'Read 10 Pages', icon:'📖', xp:10, timer:null, enabled:false },
  { id:'hydrate', name:'Drink Water', icon:'💧', xp:5, timer:null, enabled:false },
];

// ─── DEFAULT STATE ───
function defaultState() {
  return {
    isLoggedIn: false,
    user: null,
    onboardingComplete: false,
    difficulty: null,
    paymentMethod: null,
    alarms: [],
    xp: 0,
    streak: 0,
    longestStreak: 0,
    disciplineScore: 0,
    achievements: [],
    protocolTasks: JSON.parse(JSON.stringify(PRESET_PROTOCOLS)),
    protocolStreak: 0,
    todayProtocolDone: [],
    penalties: [],
    totalPaid: 0,
    totalAvoided: 0,
    friends: [],
    warChallenges: [],
    wakeHistory: [],
    isPremium: false,
    streakFreezeAvailable: false,
    streakFreezeUsedDate: null,
    notifPrefs: { alarmLock:true, streakReminder:true, rankUp:true, warMode:true, protocolReminder:true, weeklySummary:true },
    antiCheat: true,
    alarmSound: 'default',
    penaltyDest: 'rise',
    notifications: [],
    currentScreen: 'welcome',
  };
}

// ─── STATE MANAGEMENT ───
let S = loadState();
function loadState() {
  try { const s = localStorage.getItem('rise_state'); return s ? JSON.parse(s) : defaultState(); }
  catch(e) { return defaultState(); }
}
function save() { localStorage.setItem('rise_state', JSON.stringify(S)); }
function resetState() { S = defaultState(); save(); }

// ─── HELPERS ───
function $(id) { return document.getElementById(id); }
function getRank(xp) { let r = RANKS[0]; for(const rk of RANKS) { if(xp >= rk.xp) r = rk; } return r; }
function getNextRank(xp) { for(const r of RANKS) { if(xp < r.xp) return r; } return null; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
function fmtTime(h,m) { const dp = h%12||12; const per = h>=12?'PM':'AM'; return `${dp}:${m.toString().padStart(2,'0')} ${per}`; }
function fmtTimeShort(h,m) { return `${h%12||12}:${m.toString().padStart(2,'0')}`; }
function fmtPer(h) { return h>=12?'PM':'AM'; }

// ─── TOAST NOTIFICATIONS ───
function toast(msg, icon='bi-info-circle-fill', color='var(--t1)') {
  const tc = $('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="bi ${icon}" style="color:${color}"></i><span>${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function addNotification(title, body, icon='🔔') {
  S.notifications.unshift({ id:uid(), title, body, icon, time: new Date().toISOString(), read:false });
  if(S.notifications.length > 50) S.notifications.pop();
  save();
}

// ─── MODAL ───
function openModal(html) { $('modal-content').innerHTML = `<div class="modal-handle"></div>${html}`; $('modal').classList.add('active'); }
function closeModal() { $('modal').classList.remove('active'); }

// ─── OVERLAY ───
function openOverlay(html) { const o=$('overlay'); o.innerHTML=html; o.classList.add('active'); }
function closeOverlay() { $('overlay').classList.remove('active'); $('overlay').innerHTML=''; }

// ─── NAVIGATION ───
let currentScreen = '';
function nav(screen) {
  currentScreen = screen;
  S.currentScreen = screen;
  save();
  render();
}

function render() {
  const screens = $('screens');
  const tbar = $('tbar');
  const mainScreens = ['dashboard','alarms','leaderboard','profile'];
  const isMain = mainScreens.includes(currentScreen);
  
  tbar.classList.toggle('show', isMain);
  
  // Update tab active states
  tbar.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === currentScreen);
  });

  // Render screen
  const cls = isMain ? 'scr main active' : 'scr auth active';
  let html = '';
  switch(currentScreen) {
    case 'welcome': html = renderWelcome(); break;
    case 'signup': html = renderSignUp(); break;
    case 'signin': html = renderSignIn(); break;
    case 'forgot': html = renderForgot(); break;
    case 'profileSetup': html = renderProfileSetup(); break;
    case 'paymentSetup': html = renderPaymentSetup(); break;
    case 'onboarding': html = renderOnboarding(); break;
    case 'difficulty': html = renderDifficulty(); break;
    case 'dashboard': html = renderDashboard(); break;
    case 'alarms': html = renderAlarms(); break;
    case 'alarmEdit': html = renderAlarmEdit(); break;
    case 'leaderboard': html = renderLeaderboard(); break;
    case 'profile': html = renderProfile(); break;
    case 'settings': html = renderSettings(); break;
    case 'penaltyHistory': html = renderPenaltyHistory(); break;
    case 'paymentManage': html = renderPaymentManage(); break;
    case 'notifPrefs': html = renderNotifPrefs(); break;
    case 'protocolCustomize': html = renderProtocolCustomize(); break;
    case 'premium': html = renderPremium(); break;
    case 'advancedStats': html = renderAdvancedStats(); break;
    case 'notifications': html = renderNotifications(); break;
    case 'warMode': html = renderWarMode(); break;
    case 'friends': html = renderFriends(); break;
    default: html = renderWelcome();
  }
  screens.innerHTML = `<div class="${cls}">${html}</div>`;
  
  // Post-render hooks
  setTimeout(() => {
    if(currentScreen === 'dashboard') animateDashboard();
    if(currentScreen === 'onboarding') initOnboardingSlides();
  }, 50);
}

// ─── TAB BAR CLICKS ───
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => nav(t.dataset.tab));
});

/* ═══════════════════════════════════════════════════════════════
   EPIC 1: ONBOARDING & ACCOUNT
   ═══════════════════════════════════════════════════════════════ */

function renderWelcome() {
  return `<div class="sc" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100dvh - 54px);text-align:center;padding:40px 30px">
    <div style="font-size:72px;font-weight:900;letter-spacing:-4px;background:linear-gradient(135deg,#FFF,rgba(255,255,255,.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent">RISE</div>
    <div style="font-size:16px;color:var(--t2);font-weight:600;letter-spacing:.15em;text-transform:uppercase;margin-bottom:60px">Discipline Has a Price</div>
    <div style="font-size:22px;font-weight:700;margin-bottom:10px;line-height:1.3">Stop snoozing. Start winning.</div>
    <div style="font-size:15px;color:var(--t2);line-height:1.5;margin-bottom:50px;max-width:320px">Every time you hit snooze, you pay. Every time you rise, you level up. No excuses. No mercy.</div>
    <button class="btn-r btn-w" style="max-width:340px" onclick="nav('signup')">Get Started</button>
    <button style="margin-top:16px;font-size:14px;color:var(--t3);font-weight:600;cursor:pointer;background:none;border:none" onclick="nav('signin')">Already have an account? Sign In</button>
  </div>`;
}

function renderSignUp() {
  return `<div class="sc" style="padding-top:30px">
    <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer;margin-bottom:20px" onclick="nav('welcome')"><i class="bi bi-chevron-left"></i> Back</button>
    <div class="greet"><h1>Create Account</h1><p>Start your discipline journey</p></div>
    <div class="inp-group"><label class="inp-label">Email</label><input class="inp" type="email" id="su-email" placeholder="your@email.com"></div>
    <div class="inp-group"><label class="inp-label">Password</label><input class="inp" type="password" id="su-pass" placeholder="Min 8 characters"></div>
    <div class="inp-group"><label class="inp-label">Confirm Password</label><input class="inp" type="password" id="su-pass2" placeholder="Confirm password"></div>
    <button class="btn-r btn-w" onclick="doSignUp()" style="margin-top:8px">Create Account</button>
    <div style="text-align:center;margin-top:20px">
      <div style="color:var(--t3);font-size:13px;margin-bottom:16px">or</div>
      <button class="btn-r btn-out" onclick="doAppleSignIn()" style="display:flex;align-items:center;justify-content:center;gap:8px"><i class="bi bi-apple"></i> Sign in with Apple</button>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:14px;color:var(--t3)">Already have an account? <span style="color:var(--t1);font-weight:600;cursor:pointer" onclick="nav('signin')">Sign In</span></div>
  </div>`;
}

function renderSignIn() {
  return `<div class="sc" style="padding-top:30px">
    <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer;margin-bottom:20px" onclick="nav('welcome')"><i class="bi bi-chevron-left"></i> Back</button>
    <div class="greet"><h1>Welcome Back</h1><p>Pick up where you left off</p></div>
    <div class="inp-group"><label class="inp-label">Email</label><input class="inp" type="email" id="si-email" placeholder="your@email.com"></div>
    <div class="inp-group"><label class="inp-label">Password</label><input class="inp" type="password" id="si-pass" placeholder="Your password"></div>
    <button class="btn-r btn-w" onclick="doSignIn()" style="margin-top:8px">Sign In</button>
    <div style="text-align:center;margin-top:16px"><span style="font-size:14px;color:var(--blue);font-weight:600;cursor:pointer" onclick="nav('forgot')">Forgot Password?</span></div>
    <div style="text-align:center;margin-top:20px">
      <div style="color:var(--t3);font-size:13px;margin-bottom:16px">or</div>
      <button class="btn-r btn-out" onclick="doAppleSignIn()" style="display:flex;align-items:center;justify-content:center;gap:8px"><i class="bi bi-apple"></i> Sign in with Apple</button>
    </div>
  </div>`;
}

function renderForgot() {
  return `<div class="sc" style="padding-top:30px">
    <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer;margin-bottom:20px" onclick="nav('signin')"><i class="bi bi-chevron-left"></i> Back</button>
    <div class="greet"><h1>Reset Password</h1><p>We'll send you a reset link</p></div>
    <div class="inp-group"><label class="inp-label">Email</label><input class="inp" type="email" id="fg-email" placeholder="your@email.com"></div>
    <button class="btn-r btn-w" onclick="doForgotPassword()">Send Reset Link</button>
  </div>`;
}

function renderProfileSetup() {
  const selAvatar = S.user?.avatar || '⚡';
  return `<div class="sc" style="padding-top:30px">
    <div style="text-align:center;margin-bottom:8px;font-size:12px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.1em">Step 1 of 3</div>
    <div class="greet" style="text-align:center"><h1>Set Up Your Profile</h1><p>How will you appear on the leaderboard?</p></div>
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,rgba(255,214,10,.2),rgba(255,159,10,.1));display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto" id="ps-avatar-preview">${selAvatar}</div>
    </div>
    <div class="sh">Choose Avatar</div>
    <div class="av-grid" style="margin-bottom:24px">${AVATARS.map(a => `<div class="av-opt ${a===selAvatar?'sel':''}" onclick="selectAvatar('${a}')">${a}</div>`).join('')}</div>
    <div class="inp-group"><label class="inp-label">Display Name</label><input class="inp" id="ps-name" placeholder="Your name" value="${S.user?.displayName||''}"></div>
    <div class="inp-group"><label class="inp-label">Username</label><input class="inp" id="ps-user" placeholder="@username (unique)" value="${S.user?.username||''}"></div>
    <button class="btn-r btn-w" onclick="doProfileSetup()">Continue</button>
    <button style="display:block;margin:16px auto 0;font-size:14px;color:var(--t3);font-weight:600;cursor:pointer;background:none;border:none" onclick="skipProfileSetup()">Skip for now</button>
  </div>`;
}

function renderPaymentSetup() {
  return `<div class="sc" style="padding-top:30px">
    <div style="text-align:center;margin-bottom:8px;font-size:12px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.1em">Step 2 of 3</div>
    <div class="greet" style="text-align:center"><h1>Connect Payment</h1><p>Required for the penalty system to work</p></div>
    <div class="gc" style="text-align:center;padding:24px">
      <i class="bi bi-shield-lock-fill" style="font-size:32px;color:var(--green);margin-bottom:12px;display:block"></i>
      <div style="font-size:14px;color:var(--t2);line-height:1.5">Your card is only charged when you snooze or fail a challenge. You control the penalty amount. Cancel anytime.</div>
    </div>
    <button class="btn-r btn-out" onclick="doApplePay()" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px"><i class="bi bi-apple"></i> Add Apple Pay</button>
    <div style="text-align:center;color:var(--t3);font-size:13px;margin:12px 0">or add a card</div>
    <div class="inp-group"><label class="inp-label">Card Number</label><input class="inp" id="pm-card" placeholder="4242 4242 4242 4242" maxlength="19" oninput="formatCard(this)"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="inp-group"><label class="inp-label">Expiry</label><input class="inp" id="pm-exp" placeholder="MM/YY" maxlength="5"></div>
      <div class="inp-group"><label class="inp-label">CVC</label><input class="inp" id="pm-cvc" placeholder="123" maxlength="3"></div>
    </div>
    <button class="btn-r btn-w" onclick="doPaymentSetup()">Save Payment Method</button>
    <button style="display:block;margin:16px auto 0;font-size:14px;color:var(--t3);font-weight:600;cursor:pointer;background:none;border:none" onclick="skipPaymentSetup()">Skip — I'll add later</button>
  </div>`;
}

function renderOnboarding() {
  return `<div style="height:calc(100dvh - 54px);display:flex;flex-direction:column">
    <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.1em">Step 3 of 3</div>
    <div class="ob-slides" id="ob-slides">
      <div class="ob-slide">
        <div style="font-size:64px;margin-bottom:24px">⏰</div>
        <h2 style="font-size:24px;font-weight:800;margin-bottom:12px">Penalty Alarm</h2>
        <p style="font-size:15px;color:var(--t2);line-height:1.5;max-width:300px">Set your wake-up time and a dollar amount. If you snooze or fail the challenge, you pay. Real money. Real consequences.</p>
      </div>
      <div class="ob-slide">
        <div style="font-size:64px;margin-bottom:24px">⚡</div>
        <h2 style="font-size:24px;font-weight:800;margin-bottom:12px">XP & Ranks</h2>
        <p style="font-size:15px;color:var(--t2);line-height:1.5;max-width:300px">Earn XP for waking up, completing challenges, and finishing your morning protocol. Level up from RECRUIT to APEX.</p>
      </div>
      <div class="ob-slide">
        <div style="font-size:64px;margin-bottom:24px">📋</div>
        <h2 style="font-size:24px;font-weight:800;margin-bottom:12px">Morning Protocol</h2>
        <p style="font-size:15px;color:var(--t2);line-height:1.5;max-width:300px">Build your morning routine: cold showers, pushups, meditation, journaling. Earn bonus XP for each task.</p>
      </div>
      <div class="ob-slide">
        <div style="font-size:64px;margin-bottom:24px">🏆</div>
        <h2 style="font-size:24px;font-weight:800;margin-bottom:12px">Compete & Win</h2>
        <p style="font-size:15px;color:var(--t2);line-height:1.5;max-width:300px">Climb the leaderboard. Challenge friends to War Mode. The disciplined rise. The soft pay.</p>
      </div>
    </div>
    <div class="ob-dots" id="ob-dots"><div class="ob-dot active"></div><div class="ob-dot"></div><div class="ob-dot"></div><div class="ob-dot"></div></div>
    <div style="padding:0 30px 40px;margin-top:auto">
      <button class="btn-r btn-w" onclick="nav('difficulty')">Continue</button>
      <button style="display:block;margin:12px auto 0;font-size:14px;color:var(--t3);font-weight:600;cursor:pointer;background:none;border:none" onclick="finishOnboarding()">Skip</button>
    </div>
  </div>`;
}

function renderDifficulty() {
  const sel = S.difficulty || '';
  return `<div class="sc" style="padding-top:30px">
    <div class="greet" style="text-align:center"><h1>Choose Your Level</h1><p>How disciplined are you... really?</p></div>
    <div class="diff-card ${sel==='easy'?'sel':''}" onclick="selectDifficulty('easy')">
      <h3>Easy Mode</h3>
      <p>$5 penalty, 1 wake-up challenge. Good for beginners.</p>
      <span class="diff-tag" style="background:rgba(48,209,88,.15);color:var(--green)">Beginner</span>
    </div>
    <div class="diff-card ${sel==='normal'?'sel':''}" onclick="selectDifficulty('normal')">
      <h3>Normal Mode</h3>
      <p>$10 penalty, wake-up challenge + morning protocol. For the committed.</p>
      <span class="diff-tag" style="background:rgba(10,132,255,.15);color:var(--blue)">Recommended</span>
    </div>
    <div class="diff-card ${sel==='hard'?'sel':''}" onclick="selectDifficulty('hard')">
      <h3>Hard Mode</h3>
      <p>$25+ penalty, full challenge + full protocol. No mercy. No excuses.</p>
      <span class="diff-tag" style="background:rgba(255,45,85,.15);color:var(--red)">Savage</span>
    </div>
    <button class="btn-r btn-w" style="margin-top:12px" onclick="finishOnboarding()">Let's Go</button>
  </div>`;
}

// Auth Actions
function doSignUp() {
  const email = document.querySelector('#su-email')?.value;
  const pass = document.querySelector('#su-pass')?.value;
  const pass2 = document.querySelector('#su-pass2')?.value;
  if(!email || !email.includes('@')) return toast('Enter a valid email','bi-exclamation-circle-fill','var(--red)');
  if(!pass || pass.length < 8) return toast('Password must be 8+ characters','bi-exclamation-circle-fill','var(--red)');
  if(pass !== pass2) return toast('Passwords don\'t match','bi-exclamation-circle-fill','var(--red)');
  S.isLoggedIn = true;
  S.user = { id:uid(), email, displayName:'', username:'', avatar:'⚡', createdAt:new Date().toISOString() };
  save();
  toast('Account created!','bi-check-circle-fill','var(--green)');
  nav('profileSetup');
}

function doSignIn() {
  const email = document.querySelector('#si-email')?.value;
  const pass = document.querySelector('#si-pass')?.value;
  if(!email) return toast('Enter your email','bi-exclamation-circle-fill','var(--red)');
  if(!pass) return toast('Enter your password','bi-exclamation-circle-fill','var(--red)');
  S.isLoggedIn = true;
  if(!S.user) S.user = { id:uid(), email, displayName:'', username:'', avatar:'⚡', createdAt:new Date().toISOString() };
  save();
  toast('Welcome back!','bi-check-circle-fill','var(--green)');
  if(S.onboardingComplete) nav('dashboard'); else nav('profileSetup');
}

function doAppleSignIn() {
  S.isLoggedIn = true;
  S.user = S.user || { id:uid(), email:'apple@icloud.com', displayName:'', username:'', avatar:'⚡', createdAt:new Date().toISOString() };
  save();
  toast('Signed in with Apple','bi-check-circle-fill','var(--green)');
  if(S.onboardingComplete) nav('dashboard'); else nav('profileSetup');
}

function doForgotPassword() {
  const email = document.querySelector('#fg-email')?.value;
  if(!email) return toast('Enter your email','bi-exclamation-circle-fill','var(--red)');
  toast('Reset link sent to ' + email,'bi-envelope-fill','var(--blue)');
  setTimeout(() => nav('signin'), 1500);
}

function selectAvatar(a) {
  if(S.user) S.user.avatar = a;
  save();
  render();
}

function doProfileSetup() {
  const name = document.querySelector('#ps-name')?.value;
  const user = document.querySelector('#ps-user')?.value;
  if(!name) return toast('Enter a display name','bi-exclamation-circle-fill','var(--red)');
  S.user.displayName = name;
  S.user.username = user || name.toLowerCase().replace(/\s/g,'_');
  save();
  toast('Profile saved!','bi-check-circle-fill','var(--green)');
  nav('paymentSetup');
}

function skipProfileSetup() {
  if(S.user) { S.user.displayName = S.user.displayName || 'User'; S.user.username = S.user.username || 'user_'+uid().slice(0,5); }
  save();
  nav('paymentSetup');
}

function formatCard(el) {
  let v = el.value.replace(/\D/g,'');
  v = v.match(/.{1,4}/g)?.join(' ') || v;
  el.value = v;
}

function doApplePay() {
  S.paymentMethod = { type:'apple_pay', last4:'', brand:'Apple Pay' };
  save();
  toast('Apple Pay connected!','bi-check-circle-fill','var(--green)');
  nav('onboarding');
}

function doPaymentSetup() {
  const card = document.querySelector('#pm-card')?.value?.replace(/\s/g,'');
  const exp = document.querySelector('#pm-exp')?.value;
  const cvc = document.querySelector('#pm-cvc')?.value;
  if(!card || card.length < 15) return toast('Enter a valid card number','bi-exclamation-circle-fill','var(--red)');
  if(!exp) return toast('Enter expiry date','bi-exclamation-circle-fill','var(--red)');
  if(!cvc || cvc.length < 3) return toast('Enter CVC','bi-exclamation-circle-fill','var(--red)');
  S.paymentMethod = { type:'card', last4:card.slice(-4), brand: card[0]==='4'?'Visa':'Mastercard' };
  save();
  toast('Card saved!','bi-check-circle-fill','var(--green)');
  nav('onboarding');
}

function skipPaymentSetup() { nav('onboarding'); }

function initOnboardingSlides() {
  const slides = document.querySelector('#ob-slides');
  const dots = document.querySelectorAll('.ob-dot');
  if(!slides) return;
  slides.addEventListener('scroll', () => {
    const idx = Math.round(slides.scrollLeft / slides.offsetWidth);
    dots.forEach((d,i) => d.classList.toggle('active', i===idx));
  });
}

function selectDifficulty(d) { S.difficulty = d; save(); render(); }

function finishOnboarding() {
  S.onboardingComplete = true;
  // Set defaults based on difficulty
  if(S.difficulty === 'easy') {
    S.protocolTasks.forEach(t => t.enabled = false);
  } else if(S.difficulty === 'hard') {
    S.protocolTasks.forEach(t => t.enabled = true);
  }
  // Create default alarm if none
  if(!S.alarms.length) {
    const pen = S.difficulty==='easy'?5:S.difficulty==='hard'?25:10;
    S.alarms.push({ id:uid(), hour:6, minute:0, repeatDays:[1,2,3,4,5], penalty:pen, challenge:'steps', challengeDiff:50, enabled:true, locked:false });
  }
  save();
  addNotification('Welcome to RISE','Your journey begins now. Set your first alarm and start earning XP.','⚡');
  toast('Welcome to RISE! Let\'s go.','bi-lightning-fill','var(--gold)');
  nav('dashboard');
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 2: ALARM MANAGEMENT + EPIC 3: ALARM EXPERIENCE
   ═══════════════════════════════════════════════════════════════ */

let editingAlarmId = null;

function renderAlarms() {
  const alarms = S.alarms;
  let alarmCards = '';
  if(!alarms.length) {
    alarmCards = `<div style="text-align:center;padding:60px 20px;color:var(--t3)">
      <i class="bi bi-alarm" style="font-size:48px;display:block;margin-bottom:16px"></i>
      <div style="font-size:16px;font-weight:600;margin-bottom:8px">No alarms set</div>
      <div style="font-size:14px">Tap + to create your first alarm</div>
    </div>`;
  } else {
    alarmCards = alarms.map(a => {
      const lockInfo = isAlarmLocked(a) ? `<span class="tag tag-red"><i class="bi bi-lock-fill"></i> Locked</span>` : '';
      const days = a.repeatDays.length === 7 ? 'Every day' : a.repeatDays.length === 5 && !a.repeatDays.includes(0) && !a.repeatDays.includes(6) ? 'Weekdays' : a.repeatDays.map(d => ['S','M','T','W','T','F','S'][d]).join(', ') || 'Once';
      return `<div class="ac" onclick="editAlarm('${a.id}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="at">${fmtTimeShort(a.hour,a.minute)}</div>
            <div style="font-size:14px;color:var(--t2);font-weight:600;margin-top:2px">${days} — ${fmtPer(a.hour)}</div>
          </div>
          <div class="tog ${a.enabled?'on':''}" onclick="event.stopPropagation();toggleAlarm('${a.id}')"></div>
        </div>
        <div class="am">
          <span class="tag tag-red"><i class="bi bi-exclamation-circle-fill"></i> $${a.penalty}</span>
          <span class="tag tag-blue"><i class="bi bi-geo-alt-fill"></i> ${challengeName(a.challenge)}</span>
          ${lockInfo}
        </div>
      </div>`;
    }).join('');
  }

  return `<div class="sc">
    <div class="greet"><h1>Your Alarms</h1><p>${alarms.length} alarm${alarms.length!==1?'s':''} set</p></div>
    ${alarmCards}
    <button class="btn-r btn-w" style="margin-top:12px" onclick="createNewAlarm()"><i class="bi bi-plus-circle-fill"></i> New Alarm</button>
    <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--t3);font-weight:600">${S.isPremium?'Unlimited alarms (Premium)':'Free: '+alarms.length+'/5 alarms'}</div>
  </div>`;
}

function renderAlarmEdit() {
  const a = editingAlarmId ? S.alarms.find(x => x.id === editingAlarmId) : { id:null, hour:6, minute:0, repeatDays:[1,2,3,4,5], penalty:10, challenge:'steps', challengeDiff:50, enabled:true };
  const isNew = !editingAlarmId;
  const locked = !isNew && isAlarmLocked(a);
  const dayLabels = ['S','M','T','W','T','F','S'];

  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('alarms')"><i class="bi bi-chevron-left"></i> Back</button>
      ${!isNew && !locked ? `<button style="background:none;border:none;color:var(--red);font-size:14px;font-weight:700;cursor:pointer" onclick="deleteAlarm('${a.id}')">Delete</button>` : ''}
    </div>
    ${locked?'<div class="gc" style="background:rgba(255,45,85,.08);border-color:rgba(255,45,85,.2);text-align:center"><i class="bi bi-lock-fill" style="color:var(--red);font-size:24px"></i><div style="font-size:14px;font-weight:700;color:var(--red);margin-top:8px">Alarm Locked — Cannot edit within 1 hour of alarm time</div></div>':''}
    <div class="greet"><h1>${isNew?'New Alarm':'Edit Alarm'}</h1></div>
    <div class="td">
      <span class="bt" id="ae-time">${fmtTimeShort(a.hour,a.minute)}</span>
      <span class="per" id="ae-per">${fmtPer(a.hour)}</span>
      <div class="wl">Wake Up Time</div>
    </div>
    <div class="ta">
      <button class="tbtn" onclick="aeAdjust(-30)" ${locked?'disabled':''}><i class="bi bi-dash"></i></button>
      <button class="tbtn sm" onclick="aeAdjust(-5)" ${locked?'disabled':''}><i class="bi bi-dash"></i></button>
      <span style="font-size:13px;color:var(--t3);font-weight:600;padding:0 8px">ADJUST</span>
      <button class="tbtn sm" onclick="aeAdjust(5)" ${locked?'disabled':''}><i class="bi bi-plus"></i></button>
      <button class="tbtn" onclick="aeAdjust(30)" ${locked?'disabled':''}><i class="bi bi-plus"></i></button>
    </div>
    <div class="sh">Repeat</div>
    <div class="dp" style="margin-bottom:20px" id="ae-days">
      ${dayLabels.map((d,i) => `<div class="dpl ${a.repeatDays.includes(i)?'sel':''}" onclick="${locked?'':'aeToggleDay('+i+')'}">${d}</div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <button class="btn-r btn-sm btn-out" style="flex:1" onclick="${locked?'':'aeSetDays([1,2,3,4,5])'}" ${locked?'disabled':''}>Weekdays</button>
      <button class="btn-r btn-sm btn-out" style="flex:1" onclick="${locked?'':'aeSetDays([0,1,2,3,4,5,6])'}" ${locked?'disabled':''}>Every Day</button>
    </div>
    <div class="sh">Snooze Penalty</div>
    <div class="po" style="margin-bottom:8px" id="ae-penalty">
      ${[1,5,10,25,50].map(p => `<div class="pop ${a.penalty===p?'sel':''}" onclick="${locked?'':'aeSetPenalty('+p+')'}""><div class="pa">$${p}</div><div class="pp">${p>=25?'hard mode':'per snooze'}</div></div>`).join('')}
    </div>
    ${!S.paymentMethod && a.penalty > 0 ? `<div style="font-size:12px;color:var(--orange);font-weight:600;margin-bottom:16px"><i class="bi bi-exclamation-triangle-fill"></i> Add a payment method to enable penalties</div>` : ''}
    <div class="sh" style="margin-top:12px">Wake-Up Challenge</div>
    <div class="co" style="margin-bottom:20px" id="ae-challenge">
      ${[
        {id:'steps',icon:'🚶',bg:'rgba(10,132,255,.12)',name:'Walk 50 Steps',desc:'Get out of bed. No exceptions.'},
        {id:'barcode',icon:'📸',bg:'rgba(255,159,10,.12)',name:'Scan Barcode',desc:'Walk to your bathroom. Scan your toothpaste.'},
        {id:'math',icon:'🧮',bg:'rgba(48,209,88,.12)',name:'Math Problems',desc:'Solve 5 equations. Wake your brain up.'},
        {id:'pushups',icon:'💪',bg:'rgba(255,45,85,.12)',name:'20 Pushups',desc:'Start the day with action.'},
      ].map(c => `<div class="cop ${a.challenge===c.id?'sel':''}" onclick="${locked?'':'aeSetChallenge(\\''+c.id+'\\')'}"">
        <div class="ci" style="background:${c.bg}">${c.icon}</div>
        <div class="cn"><h4>${c.name}</h4><p>${c.desc}</p></div>
      </div>`).join('')}
    </div>
    <div class="sh">Morning Protocol</div>
    <div class="gc" style="padding:6px 20px;margin-bottom:24px">
      ${S.protocolTasks.map(t => `<div class="ptr">
        <div><h4>${t.icon} ${t.name}</h4><p>${t.timer?Math.floor(t.timer/60)+' min — ':''} +${t.xp} XP</p></div>
        <div class="tog ${t.enabled?'on':''}" onclick="${locked?'':'aeToggleProtocol(\\''+t.id+'\\')'}""></div>
      </div>`).join('')}
    </div>
    <button class="btn-r btn-w" onclick="saveAlarm()" ${locked?'disabled':''}>${isNew?'Create Alarm':'Save Changes'}</button>
    <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--t3);font-weight:600">Once locked, you can't edit within 1 hour of alarm time</div>
  </div>`;
}

// Alarm Edit State
let aeState = { hour:6, minute:0, repeatDays:[1,2,3,4,5], penalty:10, challenge:'steps', challengeDiff:50 };

function createNewAlarm() {
  if(!S.isPremium && S.alarms.length >= 5) return toast('Upgrade to Premium for unlimited alarms','bi-crown-fill','var(--gold)');
  editingAlarmId = null;
  aeState = { hour:6, minute:0, repeatDays:[1,2,3,4,5], penalty:10, challenge:'steps', challengeDiff:50 };
  nav('alarmEdit');
}

function editAlarm(id) {
  const a = S.alarms.find(x => x.id === id);
  if(!a) return;
  editingAlarmId = id;
  aeState = { hour:a.hour, minute:a.minute, repeatDays:[...a.repeatDays], penalty:a.penalty, challenge:a.challenge, challengeDiff:a.challengeDiff };
  nav('alarmEdit');
}

function aeAdjust(mins) {
  let total = aeState.hour*60+aeState.minute+mins;
  if(total<0) total+=1440; if(total>=1440) total-=1440;
  aeState.hour = Math.floor(total/60); aeState.minute = total%60;
  const el = document.querySelector('#ae-time');
  const per = document.querySelector('#ae-per');
  if(el) el.textContent = fmtTimeShort(aeState.hour, aeState.minute);
  if(per) per.textContent = fmtPer(aeState.hour);
}

function aeToggleDay(d) {
  const idx = aeState.repeatDays.indexOf(d);
  if(idx>=0) aeState.repeatDays.splice(idx,1); else aeState.repeatDays.push(d);
  render();
}

function aeSetDays(days) { aeState.repeatDays = days; render(); }
function aeSetPenalty(p) { aeState.penalty = p; render(); }
function aeSetChallenge(c) { aeState.challenge = c; render(); }
function aeToggleProtocol(id) {
  const t = S.protocolTasks.find(x=>x.id===id);
  if(t) { t.enabled=!t.enabled; save(); render(); }
}

function saveAlarm() {
  if(editingAlarmId) {
    const a = S.alarms.find(x=>x.id===editingAlarmId);
    if(a) { Object.assign(a, { hour:aeState.hour, minute:aeState.minute, repeatDays:aeState.repeatDays, penalty:aeState.penalty, challenge:aeState.challenge, challengeDiff:aeState.challengeDiff }); }
  } else {
    S.alarms.push({ id:uid(), ...aeState, enabled:true, locked:false });
  }
  save();
  toast(editingAlarmId?'Alarm updated!':'Alarm created!','bi-check-circle-fill','var(--green)');
  addNotification('Alarm Set', `${fmtTime(aeState.hour,aeState.minute)} — $${aeState.penalty} penalty`, '⏰');
  nav('alarms');
}

function deleteAlarm(id) {
  openModal(`<div style="text-align:center;padding:10px 0">
    <i class="bi bi-exclamation-triangle-fill" style="font-size:40px;color:var(--red);display:block;margin-bottom:16px"></i>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Delete Alarm?</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:24px">Your streak depends on waking up. Are you sure?</p>
    <button class="btn-r btn-red" style="margin-bottom:10px" onclick="confirmDeleteAlarm('${id}')">Delete Alarm</button>
    <button class="btn-r btn-out" onclick="closeModal()">Cancel</button>
  </div>`);
}

function confirmDeleteAlarm(id) {
  S.alarms = S.alarms.filter(a=>a.id!==id);
  save(); closeModal();
  toast('Alarm deleted','bi-trash-fill','var(--red)');
  nav('alarms');
}

function toggleAlarm(id) {
  const a = S.alarms.find(x=>x.id===id);
  if(a) { a.enabled = !a.enabled; save(); render(); }
}

function isAlarmLocked(a) {
  if(!a || !a.enabled) return false;
  const now = new Date();
  const alarmToday = new Date(); alarmToday.setHours(a.hour, a.minute, 0, 0);
  const diff = alarmToday - now;
  return diff > 0 && diff < 3600000; // within 1 hour
}

function challengeName(c) {
  return {steps:'50 Steps',barcode:'Barcode',math:'Math',pushups:'Pushups'}[c]||c;
}

// ─── ACTIVE ALARM / ALARM EXPERIENCE (EPIC 3) ───
let alarmInterval = null;
let penaltySec = 119;
let simSteps = 0;
let currentAlarmData = null;

function triggerAlarm(alarm) {
  currentAlarmData = alarm;
  penaltySec = 119;
  simSteps = 0;
  
  openOverlay(`<div style="width:100%;max-width:380px">
    <div class="alm-p" style="margin:0 auto 30px"><i class="bi bi-alarm-fill"></i></div>
    <div style="font-size:64px;font-weight:900;letter-spacing:-3px">${fmtTime(alarm.hour,alarm.minute)}</div>
    <div style="font-size:14px;color:var(--t2);font-weight:600;margin-top:8px">WAKE UP — YOUR ALARM IS GOING OFF</div>
    <div style="font-size:18px;font-weight:700;color:var(--red);margin:20px 0" id="alm-countdown">Penalty in <span style="font-size:36px;font-weight:900" id="alm-timer">1:59</span></div>
    <div style="font-size:13px;color:var(--t3);margin-bottom:16px;font-weight:600">Complete your challenge to dismiss</div>
    <div class="gc" style="text-align:center;margin-bottom:20px">
      <div style="font-size:12px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Challenge</div>
      <div style="font-size:32px;font-weight:900" id="alm-challenge">${challengeEmoji(alarm.challenge)} ${challengeFullName(alarm.challenge)}</div>
      <div style="margin-top:10px;font-size:14px;font-weight:700;color:var(--blue)" id="alm-progress">0 / 50</div>
      <div class="xpb" style="margin-top:10px"><div id="alm-bar" class="xpb-f" style="width:0%;background:var(--blue)"></div></div>
    </div>
    <button class="btn-r btn-grn" style="margin-bottom:12px" onclick="dismissAlarmChallenge()"><i class="bi bi-check-circle-fill"></i> I'M UP — DISMISS</button>
    <button class="btn-r" style="background:rgba(255,45,85,.1);border:2px solid rgba(255,45,85,.4);color:var(--red);font-weight:700" onclick="snoozeAlarmPay()">Snooze — Pay $${alarm.penalty} Penalty</button>
  </div>`);

  // Start penalty countdown
  if(alarmInterval) clearInterval(alarmInterval);
  alarmInterval = setInterval(() => {
    penaltySec--;
    const m = Math.floor(penaltySec/60);
    const s = penaltySec%60;
    const timer = document.querySelector('#alm-timer');
    const cd = document.querySelector('#alm-countdown');
    if(timer) timer.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    if(penaltySec <= 0) {
      clearInterval(alarmInterval);
      if(cd) cd.innerHTML = '<span style="color:var(--red);font-size:24px;font-weight:900">$'+alarm.penalty+' PENALTY CHARGED</span>';
      chargePenalty(alarm, 'failed');
    }
    // Simulate steps
    if(alarm.challenge === 'steps') {
      simSteps += Math.floor(Math.random()*3)+1;
      if(simSteps > 50) simSteps = 50;
      const prog = document.querySelector('#alm-progress');
      const bar = document.querySelector('#alm-bar');
      if(prog) prog.textContent = `${simSteps} / 50 steps`;
      if(bar) bar.style.width = (simSteps/50*100)+'%';
    }
  }, 1000);
}

function challengeEmoji(c) { return {steps:'🚶',barcode:'📸',math:'🧮',pushups:'💪'}[c]||'⏰'; }
function challengeFullName(c) { return {steps:'Walk 50 Steps',barcode:'Scan Barcode',math:'Solve 5 Problems',pushups:'20 Pushups'}[c]||c; }

function dismissAlarmChallenge() {
  if(alarmInterval) clearInterval(alarmInterval);
  const alarm = currentAlarmData;
  // Award XP
  const baseXP = 25;
  const streakBonus = Math.min(S.streak * 5, 100);
  const challengeXP = 10;
  const totalXP = baseXP + streakBonus + challengeXP;
  earnXP(totalXP);
  S.streak++;
  if(S.streak > S.longestStreak) S.longestStreak = S.streak;
  S.totalAvoided += alarm.penalty;
  S.wakeHistory.push({ date:new Date().toISOString(), alarmId:alarm.id, wokeOnTime:true, challengeCompleted:true, protocolCompleted:false, xpEarned:totalXP });
  checkAchievements();
  save();

  // Show success overlay
  openOverlay(`<div style="width:100%;max-width:380px;text-align:center">
    <div style="font-size:80px;margin-bottom:20px">🏆</div>
    <div style="font-size:32px;font-weight:900;margin-bottom:8px">YOU'RE UP!</div>
    <div style="font-size:16px;color:var(--t2);margin-bottom:24px">Challenge completed. Penalty avoided.</div>
    <div class="gc">
      <div style="font-size:14px;font-weight:700;margin-bottom:12px">XP EARNED</div>
      <div style="font-size:14px;color:var(--t2);display:flex;justify-content:space-between;padding:4px 0"><span>Wake on time</span><span style="color:var(--gold)">+${baseXP} XP</span></div>
      <div style="font-size:14px;color:var(--t2);display:flex;justify-content:space-between;padding:4px 0"><span>Challenge complete</span><span style="color:var(--gold)">+${challengeXP} XP</span></div>
      <div style="font-size:14px;color:var(--t2);display:flex;justify-content:space-between;padding:4px 0"><span>Streak bonus (${S.streak} days)</span><span style="color:var(--gold)">+${streakBonus} XP</span></div>
      <div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:800"><span>Total</span><span style="color:var(--gold)">+${totalXP} XP</span></div>
    </div>
    <div style="margin:16px 0"><span class="tag tag-grn" style="font-size:14px;padding:8px 16px">🔥 ${S.streak} Day Streak</span> <span class="tag tag-gold" style="font-size:14px;padding:8px 16px">💰 $${alarm.penalty} Saved</span></div>
    ${S.protocolTasks.some(t=>t.enabled) ? `<button class="btn-r btn-w" style="margin-bottom:12px" onclick="startMorningProtocol()">Start Morning Protocol</button>` : ''}
    <button class="btn-r btn-out" onclick="closeOverlay();nav('dashboard')">Go to Dashboard</button>
  </div>`);
}

function snoozeAlarmPay() {
  openModal(`<div style="text-align:center;padding:10px 0">
    <i class="bi bi-exclamation-triangle-fill" style="font-size:40px;color:var(--red);display:block;margin-bottom:16px"></i>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Confirm Snooze</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:4px">You're about to be charged</p>
    <p style="font-size:36px;font-weight:900;color:var(--red);margin-bottom:16px">$${currentAlarmData.penalty}</p>
    <p style="font-size:13px;color:var(--t3);margin-bottom:24px">Alarm will ring again in 5 minutes with another penalty.</p>
    <button class="btn-r btn-red" style="margin-bottom:10px" onclick="confirmSnooze()">Pay $${currentAlarmData.penalty} & Snooze</button>
    <button class="btn-r btn-out" onclick="closeModal()">Cancel — I'll Get Up</button>
  </div>`);
}

function confirmSnooze() {
  closeModal();
  if(alarmInterval) clearInterval(alarmInterval);
  chargePenalty(currentAlarmData, 'snoozed');
  S.streak = 0;
  S.wakeHistory.push({ date:new Date().toISOString(), alarmId:currentAlarmData.id, wokeOnTime:false, challengeCompleted:false, protocolCompleted:false, xpEarned:0 });
  save();
  toast('💸 $'+currentAlarmData.penalty+' charged — snoozing 5 min','bi-cash-stack','var(--red)');
  addNotification('Penalty Charged','$'+currentAlarmData.penalty+' for snoozing. Your streak has been reset.','💸');
  closeOverlay();
  nav('dashboard');
}

function chargePenalty(alarm, reason) {
  S.penalties.push({ id:uid(), date:new Date().toISOString(), amount:alarm.penalty, reason, alarmId:alarm.id });
  S.totalPaid += alarm.penalty;
  if(!S.paymentMethod) {
    addNotification('Payment Failed','Update your payment method to continue using penalties.','⚠️');
  }
  save();
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 4: MORNING PROTOCOL
   ═══════════════════════════════════════════════════════════════ */

function startMorningProtocol() {
  S.todayProtocolDone = [];
  save();
  const tasks = S.protocolTasks.filter(t=>t.enabled);
  renderProtocolOverlay(tasks);
}

function renderProtocolOverlay(tasks) {
  const done = S.todayProtocolDone || [];
  const totalXP = tasks.reduce((s,t) => s + (done.includes(t.id)?t.xp:0), 0);
  const allDone = tasks.every(t => done.includes(t.id));

  openOverlay(`<div style="width:100%;max-width:380px;padding-top:60px">
    <div style="font-size:13px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;text-align:center">Morning Protocol</div>
    <div style="font-size:28px;font-weight:900;text-align:center;margin-bottom:24px">${done.length}/${tasks.length} Complete</div>
    <div class="gc" style="padding:6px 20px">
      ${tasks.map(t => `<div class="pi ${done.includes(t.id)?'done':''}" onclick="toggleProtocolTask('${t.id}')">
        <div class="pc"><i class="bi bi-check2"></i></div>
        <span class="pt">${t.icon} ${t.name}${t.timer?' — '+Math.floor(t.timer/60)+' min':''}</span>
        <span class="px">+${t.xp} XP</span>
      </div>`).join('')}
    </div>
    <div style="text-align:center;margin:16px 0;font-size:16px;font-weight:700;color:var(--gold)">${totalXP} XP earned</div>
    ${allDone ? `<div style="text-align:center;margin-bottom:16px"><span class="tag tag-grn" style="font-size:14px;padding:8px 16px">✅ Full Protocol Complete!</span></div>` : ''}
    <button class="btn-r btn-w" onclick="finishProtocol()">${allDone?'Claim All XP':'Done for Now'}</button>
    ${!allDone ? `<button class="btn-r btn-out" style="margin-top:10px" onclick="completeAllProtocol()">Complete All</button>` : ''}
  </div>`);
}

function toggleProtocolTask(id) {
  if(!S.todayProtocolDone) S.todayProtocolDone = [];
  const idx = S.todayProtocolDone.indexOf(id);
  if(idx >= 0) S.todayProtocolDone.splice(idx,1);
  else S.todayProtocolDone.push(id);
  save();
  renderProtocolOverlay(S.protocolTasks.filter(t=>t.enabled));
  if(navigator.vibrate) navigator.vibrate(15);
}

function completeAllProtocol() {
  S.todayProtocolDone = S.protocolTasks.filter(t=>t.enabled).map(t=>t.id);
  save();
  renderProtocolOverlay(S.protocolTasks.filter(t=>t.enabled));
}

function finishProtocol() {
  const tasks = S.protocolTasks.filter(t=>t.enabled);
  const done = S.todayProtocolDone || [];
  let xp = 0;
  tasks.forEach(t => { if(done.includes(t.id)) xp += t.xp; });
  const allDone = tasks.every(t => done.includes(t.id));
  if(allDone) { xp += 25; S.protocolStreak++; } // Bonus for full completion
  earnXP(xp);
  // Update today's wake history
  if(S.wakeHistory.length) S.wakeHistory[S.wakeHistory.length-1].protocolCompleted = allDone;
  checkAchievements();
  save();
  if(allDone) toast('Full protocol complete! +' + xp + ' XP','bi-check-circle-fill','var(--green)');
  else toast('+' + xp + ' XP earned from protocol','bi-check-circle-fill','var(--gold)');
  closeOverlay();
  nav('dashboard');
}

function renderProtocolCustomize() {
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('dashboard')"><i class="bi bi-chevron-left"></i> Back</button>
      <button style="background:none;border:none;color:var(--blue);font-size:14px;font-weight:700;cursor:pointer" onclick="addCustomProtocol()">+ Add Task</button>
    </div>
    <div class="greet"><h1>Morning Protocol</h1><p>Customize your morning routine</p></div>
    <div class="gc" style="padding:6px 20px">
      ${S.protocolTasks.map(t => `<div class="ptr">
        <div style="flex:1"><h4>${t.icon} ${t.name}</h4><p>${t.timer?Math.floor(t.timer/60)+' min — ':''}+${t.xp} XP</p></div>
        <div class="tog ${t.enabled?'on':''}" onclick="toggleProtocolPref('${t.id}')"></div>
      </div>`).join('')}
    </div>
    <div class="gc" style="text-align:center;padding:16px">
      <div style="font-size:13px;color:var(--t2);font-weight:600">Total possible XP per day</div>
      <div style="font-size:28px;font-weight:900;color:var(--gold);margin-top:4px">+${S.protocolTasks.filter(t=>t.enabled).reduce((s,t)=>s+t.xp,0)+25} XP</div>
      <div style="font-size:11px;color:var(--t3);margin-top:4px">Includes +25 bonus for full completion</div>
    </div>
  </div>`;
}

function toggleProtocolPref(id) {
  const t = S.protocolTasks.find(x=>x.id===id);
  if(t) { t.enabled=!t.enabled; save(); render(); }
}

function addCustomProtocol() {
  openModal(`<div>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:16px">Add Custom Task</h3>
    <div class="inp-group"><label class="inp-label">Task Name</label><input class="inp" id="cp-name" placeholder="e.g. Cold plunge"></div>
    <div class="inp-group"><label class="inp-label">XP Reward</label><input class="inp" id="cp-xp" type="number" placeholder="10" value="10"></div>
    <div class="inp-group"><label class="inp-label">Timer (minutes, optional)</label><input class="inp" id="cp-timer" type="number" placeholder="Leave empty for no timer"></div>
    <button class="btn-r btn-w" onclick="saveCustomProtocol()">Add Task</button>
  </div>`);
}

function saveCustomProtocol() {
  const name = document.querySelector('#cp-name')?.value;
  const xp = parseInt(document.querySelector('#cp-xp')?.value) || 10;
  const timer = parseInt(document.querySelector('#cp-timer')?.value) || null;
  if(!name) return toast('Enter a task name','bi-exclamation-circle-fill','var(--red)');
  S.protocolTasks.push({ id:uid(), name, icon:'✅', xp, timer:timer?timer*60:null, enabled:true });
  save(); closeModal(); render();
  toast('Task added!','bi-check-circle-fill','var(--green)');
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 5: GAMIFICATION
   ═══════════════════════════════════════════════════════════════ */

function earnXP(amount) {
  const oldRank = getRank(S.xp);
  S.xp += amount;
  const newRank = getRank(S.xp);
  save();
  if(newRank.name !== oldRank.name) {
    addNotification('Rank Up!', `You've reached ${newRank.name}!`, '🏆');
    setTimeout(() => showRankUpModal(newRank), 500);
  }
}

function showRankUpModal(rank) {
  openModal(`<div style="text-align:center;padding:20px 0">
    <div style="font-size:64px;margin-bottom:16px">🏆</div>
    <div style="font-size:13px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Rank Up!</div>
    <div style="font-size:36px;font-weight:900;margin-bottom:8px">${rank.name}</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:24px">You've unlocked a new rank. Keep grinding.</div>
    <div class="rb" style="font-size:16px;padding:10px 20px;margin:0 auto;display:inline-flex"><i class="bi bi-shield-fill-check"></i> ${rank.name}</div>
    <button class="btn-r btn-w" style="margin-top:24px" onclick="closeModal()">Let's Go</button>
  </div>`);
}

function calcDisciplineScore() {
  // Based on recent 7-day performance
  const recent = S.wakeHistory.slice(-7);
  if(!recent.length) return 0;
  let score = 0;
  recent.forEach(w => {
    if(w.wokeOnTime) score += 10;
    if(w.challengeCompleted) score += 3;
    if(w.protocolCompleted) score += 2;
  });
  return Math.min(Math.round(score / recent.length * (100/15)), 100);
}

function checkAchievements() {
  const unlock = (id) => {
    if(!S.achievements.includes(id)) {
      S.achievements.push(id);
      const ach = ACHIEVEMENTS.find(a=>a.id===id);
      if(ach) {
        toast(`Achievement: ${ach.name} ${ach.icon}`,'bi-trophy-fill','var(--gold)');
        addNotification('Achievement Unlocked', `${ach.icon} ${ach.name} — ${ach.desc}`, '🏅');
      }
    }
  };
  if(S.wakeHistory.length >= 1) unlock('early_bird');
  if(S.streak >= 7) unlock('streak_7');
  if(S.streak >= 30) unlock('streak_30');
  if(S.streak >= 100) unlock('streak_100');
  if(S.totalAvoided >= 100) unlock('saved_100');
  if(getRank(S.xp).name === 'APEX') unlock('apex_status');
  // Count cold showers
  const colds = S.wakeHistory.filter(w => w.protocolCompleted).length;
  if(colds >= 7) { unlock('ice_veins'); unlock('iron_body'); }
  if(S.protocolStreak >= 14) unlock('protocol_master');
  // No snooze week
  const last7 = S.wakeHistory.slice(-7);
  if(last7.length >= 7 && last7.every(w => w.wokeOnTime)) unlock('no_snooze_week');
  if(last7.length >= 7 && last7.every(w => w.wokeOnTime) && S.totalPaid === 0) unlock('mind_over_bed');
  save();
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 6: SOCIAL & COMPETITIVE
   ═══════════════════════════════════════════════════════════════ */

function renderLeaderboard() {
  const myScore = calcDisciplineScore();
  S.disciplineScore = myScore;
  save();
  
  // Inject user into leaderboard
  const lb = [...MOCK_LB];
  const userEntry = { name: S.user?.displayName||'You', avatar: S.user?.avatar||'⚡', streak: S.streak, rank: getRank(S.xp).name, score: myScore, isYou:true };
  lb.push(userEntry);
  lb.sort((a,b) => b.score - a.score);
  const myPos = lb.findIndex(e => e.isYou) + 1;

  return `<div class="sc">
    <div class="greet"><h1>Leaderboard</h1><p>Outgrind everyone. No days off.</p></div>
    <div class="lb-tabs">
      <button class="lb-t active">Global</button>
      <button class="lb-t" onclick="nav('friends')">Friends</button>
      <button class="lb-t">This Week</button>
    </div>
    ${lb.slice(0,8).map((e,i) => {
      const rkClass = i===0?'color:var(--gold)':i===1?'color:#C0C0C0':i===2?'color:#CD7F32':'';
      return `<div class="lb-e ${e.isYou?'you':''}">
        <div class="lb-rk" style="${rkClass}">${i+1}</div>
        <div class="lb-av">${e.avatar}</div>
        <div class="lb-i"><div class="nm">${e.isYou?'You':e.name}</div><div class="st">🔥 ${e.streak} day streak · ${e.rank}</div></div>
        <div class="lb-sc"><div class="sv" ${e.isYou?'style="color:var(--gold)"':''}>${e.score}</div><div class="su">DISC.</div></div>
      </div>`;
    }).join('')}
    ${myPos > 8 ? `<div style="text-align:center;padding:8px;font-size:11px;color:var(--t3);font-weight:600;letter-spacing:.1em">· · · · ·</div>
    <div class="lb-e you">
      <div class="lb-rk" style="color:var(--gold)">${myPos}</div>
      <div class="lb-av" style="background:linear-gradient(135deg,rgba(255,214,10,.2),rgba(255,159,10,.1))">${S.user?.avatar||'⚡'}</div>
      <div class="lb-i"><div class="nm">You</div><div class="st">🔥 ${S.streak} day streak · ${getRank(S.xp).name}</div></div>
      <div class="lb-sc"><div class="sv" style="color:var(--gold)">${myScore}</div><div class="su">DISC.</div></div>
    </div>` : ''}
  </div>`;
}

function renderFriends() {
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('leaderboard')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Friends</h1><p>${S.friends.length} friends</p></div>
    <div class="inp-group"><div style="position:relative"><input class="inp" placeholder="Search by username..." id="friend-search"><i class="bi bi-search" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);color:var(--t3)"></i></div></div>
    ${S.friends.length ? S.friends.map(f => `<div class="lb-e">
      <div class="lb-av">${f.avatar}</div>
      <div class="lb-i"><div class="nm">${f.name}</div><div class="st">🔥 ${f.streak} day streak</div></div>
      <button class="btn-r btn-sm btn-out" onclick="startWarChallenge('${f.name}')">⚔️</button>
    </div>`).join('') : `<div style="text-align:center;padding:40px 20px">
      <i class="bi bi-people" style="font-size:48px;color:var(--t3);display:block;margin-bottom:16px"></i>
      <div style="font-size:16px;font-weight:600;color:var(--t2);margin-bottom:8px">No friends yet</div>
      <div style="font-size:14px;color:var(--t3);margin-bottom:20px">Add friends to compete on the leaderboard and challenge them to War Mode</div>
    </div>`}
    <button class="btn-r btn-w" onclick="addFriend()">Add Friend</button>
    <button class="btn-r btn-out" style="margin-top:10px" onclick="shareInvite()"><i class="bi bi-share-fill"></i> Share Invite Link</button>
  </div>`;
}

function addFriend() {
  openModal(`<div>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:16px">Add Friend</h3>
    <div class="inp-group"><label class="inp-label">Username</label><input class="inp" id="af-user" placeholder="@username"></div>
    <button class="btn-r btn-w" onclick="doAddFriend()">Send Request</button>
  </div>`);
}

function doAddFriend() {
  const name = document.querySelector('#af-user')?.value;
  if(!name) return toast('Enter a username','bi-exclamation-circle-fill','var(--red)');
  const mockFriend = { name: name.replace('@',''), avatar: AVATARS[Math.floor(Math.random()*AVATARS.length)], streak: Math.floor(Math.random()*50)+5 };
  S.friends.push(mockFriend);
  save(); closeModal();
  toast('Friend request sent!','bi-person-plus-fill','var(--green)');
  render();
}

function shareInvite() {
  const link = `https://rise-app.com/invite/${S.user?.username||'user'}`;
  if(navigator.share) {
    navigator.share({ title:'Join me on RISE', text:'Stop snoozing. Start winning. Join RISE — the alarm clock that charges you for being soft.', url:link });
  } else {
    navigator.clipboard?.writeText(link);
    toast('Invite link copied!','bi-clipboard-check-fill','var(--green)');
  }
}

function renderWarMode() {
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('dashboard')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>⚔️ War Mode</h1><p>Challenge a friend. Loser pays the winner.</p></div>
    <div class="gc">
      <div style="font-size:14px;color:var(--t2);line-height:1.6">
        <div style="font-weight:700;color:var(--t1);margin-bottom:8px">How it works:</div>
        <div style="margin-bottom:4px">1. Pick a friend and set a wager ($5-$50)</div>
        <div style="margin-bottom:4px">2. Both must wake up on time each day</div>
        <div style="margin-bottom:4px">3. First to snooze loses and pays the wager</div>
        <div>4. If both succeed, it's a draw — no charge</div>
      </div>
    </div>
    ${S.warChallenges.length ? `<div class="sh">Active Challenges</div>${S.warChallenges.map(w => `<div class="gc">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:700">vs. ${w.opponent}</div><div style="font-size:12px;color:var(--t2)">${w.duration} — $${w.wager} wager</div></div>
        <span class="tag ${w.status==='won'?'tag-grn':w.status==='lost'?'tag-red':'tag-gold'}">${w.status.toUpperCase()}</span>
      </div>
    </div>`).join('')}` : ''}
    <div class="sh">Start a Challenge</div>
    ${S.friends.length ? S.friends.map(f => `<div class="lb-e" style="cursor:pointer" onclick="startWarChallenge('${f.name}')">
      <div class="lb-av">${f.avatar}</div>
      <div class="lb-i"><div class="nm">${f.name}</div><div class="st">🔥 ${f.streak} day streak</div></div>
      <span style="color:var(--orange);font-weight:700">⚔️</span>
    </div>`).join('') : `<div style="text-align:center;padding:20px;color:var(--t3);font-size:14px">Add friends first to start a War Mode challenge</div>`}
    <button class="btn-r btn-out" style="margin-top:12px" onclick="nav('friends')"><i class="bi bi-person-plus-fill"></i> Add Friends</button>
  </div>`;
}

function startWarChallenge(name) {
  openModal(`<div>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:4px">⚔️ Challenge ${name}</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:20px">Set the stakes for this war</p>
    <div class="sh">Wager Amount</div>
    <div class="po" style="margin-bottom:16px">
      ${[5,10,25,50].map(w => `<div class="pop ${w===10?'sel':''}" onclick="selectWarWager(this,${w})"><div class="pa">$${w}</div></div>`).join('')}
    </div>
    <div class="sh">Duration</div>
    <div style="display:flex;gap:10px;margin-bottom:24px">
      <button class="btn-r btn-sm btn-out" style="flex:1" onclick="selectWarDuration(this,'1 Day')">1 Day</button>
      <button class="btn-r btn-sm btn-w" style="flex:1" onclick="selectWarDuration(this,'1 Week')">1 Week</button>
    </div>
    <button class="btn-r btn-red" onclick="sendWarChallenge('${name}')">Send Challenge</button>
  </div>`);
}

let warWager = 10, warDuration = '1 Week';
function selectWarWager(el,w) { warWager=w; el.parentElement.querySelectorAll('.pop').forEach(p=>p.classList.remove('sel')); el.classList.add('sel'); }
function selectWarDuration(el,d) { warDuration=d; }

function sendWarChallenge(name) {
  S.warChallenges.push({ id:uid(), opponent:name, wager:warWager, duration:warDuration, status:'active', startDate:new Date().toISOString() });
  save(); closeModal();
  toast('Challenge sent to '+name+'!','bi-lightning-fill','var(--orange)');
  addNotification('War Mode', `Challenge sent to ${name} — $${warWager} wager`, '⚔️');
}

function shareProgress() {
  const rank = getRank(S.xp);
  openModal(`<div style="text-align:center">
    <div class="share-card">
      <div style="font-size:28px;font-weight:900;letter-spacing:-2px;margin-bottom:4px">RISE</div>
      <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.15em;margin-bottom:20px">Discipline Has a Price</div>
      <div style="font-size:48px;margin-bottom:8px">${S.user?.avatar||'⚡'}</div>
      <div style="font-size:18px;font-weight:800">${S.user?.displayName||'User'}</div>
      <div style="font-size:13px;color:var(--gold);font-weight:700;margin:8px 0">${rank.name} — ${S.xp} XP</div>
      <div style="display:flex;justify-content:center;gap:24px;margin-top:16px">
        <div><div style="font-size:24px;font-weight:900;color:var(--orange)">🔥 ${S.streak}</div><div style="font-size:10px;color:var(--t3)">STREAK</div></div>
        <div><div style="font-size:24px;font-weight:900;color:var(--green)">$${S.totalAvoided}</div><div style="font-size:10px;color:var(--t3)">SAVED</div></div>
        <div><div style="font-size:24px;font-weight:900">${S.disciplineScore}</div><div style="font-size:10px;color:var(--t3)">SCORE</div></div>
      </div>
    </div>
    <div style="margin-top:20px;display:flex;gap:10px">
      <button class="btn-r btn-w" style="flex:1" onclick="doShare()"><i class="bi bi-share-fill"></i> Share</button>
      <button class="btn-r btn-out" style="flex:1" onclick="closeModal()">Close</button>
    </div>
  </div>`);
}

function doShare() {
  if(navigator.share) {
    navigator.share({ title:'RISE Stats', text:`🔥 ${S.streak} day streak | ${getRank(S.xp).name} rank | $${S.totalAvoided} saved\nJoin RISE — the alarm that charges you for being soft.` });
  } else { toast('Share card saved!','bi-check-circle-fill','var(--green)'); }
  closeModal();
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 7: PENALTY & PAYMENT
   ═══════════════════════════════════════════════════════════════ */

function renderPenaltyHistory() {
  const penalties = [...S.penalties].reverse();
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('profile')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Penalty History</h1></div>
    <div class="stat-r">
      <div class="stat"><div class="si">💸</div><div class="sn" style="color:var(--red)">$${S.totalPaid}</div><div class="sl">Total Paid</div></div>
      <div class="stat"><div class="si">💰</div><div class="sn" style="color:var(--green)">$${S.totalAvoided}</div><div class="sl">Total Avoided</div></div>
    </div>
    ${penalties.length ? `<div class="gc" style="padding:6px 20px">${penalties.map(p => {
      const d = new Date(p.date);
      return `<div class="phi">
        <div><div style="font-weight:700;color:var(--red)">-$${p.amount}</div><div style="font-size:12px;color:var(--t3)">${p.reason === 'snoozed'?'Snoozed alarm':'Failed challenge'}</div></div>
        <div style="font-size:12px;color:var(--t3)">${d.toLocaleDateString()}</div>
      </div>`;
    }).join('')}</div>` : `<div style="text-align:center;padding:40px;color:var(--t3)">
      <i class="bi bi-emoji-smile" style="font-size:48px;display:block;margin-bottom:16px"></i>
      <div style="font-size:16px;font-weight:600">No penalties yet!</div>
      <div style="font-size:14px;margin-top:4px">Keep it that way.</div>
    </div>`}
  </div>`;
}

function renderPaymentManage() {
  const pm = S.paymentMethod;
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('settings')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Payment Method</h1></div>
    ${pm ? `<div class="gc">
      <div style="display:flex;align-items:center;gap:14px">
        <i class="bi ${pm.type==='apple_pay'?'bi-apple':'bi-credit-card-fill'}" style="font-size:28px"></i>
        <div>
          <div style="font-weight:700">${pm.brand}${pm.last4?' •••• '+pm.last4:''}</div>
          <div style="font-size:12px;color:var(--t2)">Active payment method</div>
        </div>
      </div>
    </div>` : `<div class="gc" style="text-align:center;padding:24px">
      <i class="bi bi-credit-card" style="font-size:32px;color:var(--t3);display:block;margin-bottom:12px"></i>
      <div style="color:var(--t2)">No payment method connected</div>
    </div>`}
    <div class="sh">Penalty Destination</div>
    <div style="margin-bottom:20px">
      ${['rise','charity','friend'].map(d => `<div class="sr" style="margin-bottom:8px" onclick="setPenaltyDest('${d}')">
        <div class="sl"><i class="bi ${d==='rise'?'bi-building':d==='charity'?'bi-heart-fill':'bi-person-fill'}"></i><span>${d==='rise'?'RISE keeps it':d==='charity'?'Donate to charity':'Send to a friend'}</span></div>
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${S.penaltyDest===d?'var(--green)':'var(--border)'};display:flex;align-items:center;justify-content:center">${S.penaltyDest===d?'<div style="width:10px;height:10px;border-radius:50%;background:var(--green)"></div>':''}</div>
      </div>`).join('')}
    </div>
    <button class="btn-r btn-w" onclick="nav('paymentSetup')">Update Payment Method</button>
    ${pm ? `<button class="btn-r btn-out" style="margin-top:10px;color:var(--red)" onclick="removePayment()">Remove Payment Method</button>` : ''}
  </div>`;
}

function setPenaltyDest(d) { S.penaltyDest = d; save(); render(); }

function removePayment() {
  const hasActivePenalties = S.alarms.some(a => a.enabled && a.penalty > 0);
  if(hasActivePenalties) return toast('Disable alarm penalties first','bi-exclamation-circle-fill','var(--red)');
  S.paymentMethod = null; save(); render();
  toast('Payment method removed','bi-check-circle-fill','var(--green)');
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 8: NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

function renderNotifications() {
  const notifs = S.notifications || [];
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('dashboard')"><i class="bi bi-chevron-left"></i> Back</button>
      ${notifs.length?`<button style="background:none;border:none;color:var(--blue);font-size:14px;font-weight:700;cursor:pointer" onclick="clearNotifs()">Clear All</button>`:''}
    </div>
    <div class="greet"><h1>Notifications</h1></div>
    ${notifs.length ? `<div class="gc" style="padding:6px 20px">${notifs.map(n => {
      const d = new Date(n.time);
      const ago = getTimeAgo(d);
      return `<div class="ni">
        <div class="ni-icon" style="background:var(--card)">${n.icon}</div>
        <div class="ni-body"><h4>${n.title}</h4><p>${n.body}</p></div>
        <div class="ni-time">${ago}</div>
      </div>`;
    }).join('')}</div>` : `<div style="text-align:center;padding:60px 20px;color:var(--t3)">
      <i class="bi bi-bell" style="font-size:48px;display:block;margin-bottom:16px"></i>
      <div style="font-size:16px;font-weight:600">No notifications</div>
    </div>`}
  </div>`;
}

function clearNotifs() { S.notifications = []; save(); render(); }

function getTimeAgo(date) {
  const s = Math.floor((new Date()-date)/1000);
  if(s<60) return 'now';
  if(s<3600) return Math.floor(s/60)+'m';
  if(s<86400) return Math.floor(s/3600)+'h';
  return Math.floor(s/86400)+'d';
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 9: SETTINGS & ACCOUNT MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */

function renderSettings() {
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('profile')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Settings</h1></div>
    <div class="sh">Account</div>
    <div class="sr" onclick="editProfile()"><div class="sl"><i class="bi bi-person-fill"></i><span>Edit Profile</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
    <div class="sr" onclick="nav('paymentManage')"><div class="sl"><i class="bi bi-creditcard-fill"></i><span>Payment Method</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
    <div class="sr" onclick="nav('notifPrefs')"><div class="sl"><i class="bi bi-bell-fill"></i><span>Notifications</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
    <div class="sh" style="margin-top:16px">Alarm</div>
    <div class="sr" onclick="selectAlarmSound()"><div class="sl"><i class="bi bi-music-note-beamed"></i><span>Alarm Sound</span></div><span style="font-size:13px;color:var(--t2);font-weight:600">${S.alarmSound==='default'?'Default':S.alarmSound}</span></div>
    <div class="sr"><div class="sl"><i class="bi bi-shield-lock-fill"></i><span>Anti-Cheat Protection</span></div><div class="tog ${S.antiCheat?'on':''}" onclick="event.stopPropagation();S.antiCheat=!S.antiCheat;save();render()"></div></div>
    <div class="sh" style="margin-top:16px">Premium</div>
    <div class="sr" onclick="nav('premium')"><div class="sl"><i class="bi bi-crown-fill" style="color:var(--gold)"></i><span>RISE Premium</span></div><span style="font-size:12px;font-weight:700;color:var(--gold)">${S.isPremium?'ACTIVE':'UPGRADE'}</span></div>
    ${S.isPremium ? `<div class="sr" onclick="useStreakFreeze()"><div class="sl"><i class="bi bi-snow2" style="color:var(--blue)"></i><span>Streak Freeze</span></div><span style="font-size:12px;font-weight:600;color:var(--t2)">${S.streakFreezeAvailable?'Available':'Used'}</span></div>` : ''}
    <div class="sh" style="margin-top:16px">About</div>
    <div class="sr"><div class="sl"><i class="bi bi-info-circle-fill"></i><span>Version</span></div><span style="font-size:13px;color:var(--t2)">1.0.0</span></div>
    <div class="sr" onclick="nav('penaltyHistory')"><div class="sl"><i class="bi bi-receipt"></i><span>Penalty History</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
    <button class="btn-r btn-out" style="margin-top:20px" onclick="doLogout()">Log Out</button>
    <button style="display:block;margin:16px auto;font-size:14px;color:var(--red);font-weight:600;cursor:pointer;background:none;border:none" onclick="deleteAccount()">Delete Account</button>
  </div>`;
}

function renderNotifPrefs() {
  const prefs = [
    { key:'alarmLock', label:'Alarm Lock', desc:'1 hour before alarm', critical:true },
    { key:'streakReminder', label:'Streak Reminder', desc:'When no alarm set by 10 PM' },
    { key:'rankUp', label:'Rank Up', desc:'When you reach a new rank' },
    { key:'warMode', label:'War Mode', desc:'Challenge updates' },
    { key:'protocolReminder', label:'Protocol Reminder', desc:'If protocol not completed' },
    { key:'weeklySummary', label:'Weekly Summary', desc:'Sunday stats recap' },
  ];
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('settings')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Notifications</h1><p>Control what you receive</p></div>
    <div class="gc" style="padding:6px 20px">
      ${prefs.map(p => `<div class="ptr">
        <div><h4>${p.label}</h4><p>${p.desc}${p.critical?' · Cannot be disabled':''}</p></div>
        <div class="tog ${S.notifPrefs[p.key]?'on':''}" onclick="${p.critical?'':`S.notifPrefs['${p.key}']=!S.notifPrefs['${p.key}'];save();render()`}"></div>
      </div>`).join('')}
    </div>
  </div>`;
}

function editProfile() {
  openModal(`<div>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:16px">Edit Profile</h3>
    <div class="inp-group"><label class="inp-label">Display Name</label><input class="inp" id="ep-name" value="${S.user?.displayName||''}"></div>
    <div class="inp-group"><label class="inp-label">Username</label><input class="inp" id="ep-user" value="${S.user?.username||''}"></div>
    <div class="sh">Avatar</div>
    <div class="av-grid" style="margin-bottom:20px">${AVATARS.map(a => `<div class="av-opt ${a===S.user?.avatar?'sel':''}" onclick="this.parentElement.querySelectorAll('.av-opt').forEach(x=>x.classList.remove('sel'));this.classList.add('sel');this.dataset.av='${a}'" data-av="${a}">${a}</div>`).join('')}</div>
    <button class="btn-r btn-w" onclick="saveProfileEdit()">Save</button>
  </div>`);
}

function saveProfileEdit() {
  const name = document.querySelector('#ep-name')?.value;
  const user = document.querySelector('#ep-user')?.value;
  const avEl = document.querySelector('.av-opt.sel');
  if(name) S.user.displayName = name;
  if(user) S.user.username = user;
  if(avEl) S.user.avatar = avEl.dataset.av;
  save(); closeModal();
  toast('Profile updated!','bi-check-circle-fill','var(--green)');
  render();
}

function selectAlarmSound() {
  const sounds = ['Default','Air Horn','Military Bugle','Heavy Metal','Drill Sergeant'];
  openModal(`<div>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:16px">Alarm Sound</h3>
    ${sounds.map(s => `<div class="sr" style="margin-bottom:8px" onclick="S.alarmSound='${s.toLowerCase()}';save();closeModal();render()">
      <div class="sl"><i class="bi bi-music-note-beamed"></i><span>${s}</span></div>
      ${S.alarmSound===s.toLowerCase()?'<i class="bi bi-check-circle-fill" style="color:var(--green)"></i>':''}
    </div>`).join('')}
  </div>`);
}

function doLogout() {
  openModal(`<div style="text-align:center;padding:10px 0">
    <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Log Out?</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:24px">Your data will be saved. You can log back in anytime.</p>
    <button class="btn-r btn-red" style="margin-bottom:10px" onclick="confirmLogout()">Log Out</button>
    <button class="btn-r btn-out" onclick="closeModal()">Cancel</button>
  </div>`);
}

function confirmLogout() {
  S.isLoggedIn = false;
  S.currentScreen = 'welcome';
  save(); closeModal();
  nav('welcome');
}

function deleteAccount() {
  openModal(`<div style="text-align:center;padding:10px 0">
    <i class="bi bi-exclamation-triangle-fill" style="font-size:40px;color:var(--red);display:block;margin-bottom:16px"></i>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Delete Account?</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:8px">This permanently deletes all your data, including:</p>
    <p style="font-size:13px;color:var(--t3);margin-bottom:24px">XP, ranks, streaks, achievements, penalty history</p>
    <div class="inp-group"><label class="inp-label">Type DELETE to confirm</label><input class="inp" id="da-confirm" placeholder="DELETE"></div>
    <button class="btn-r btn-red" style="margin-bottom:10px" onclick="confirmDeleteAccount()">Delete Forever</button>
    <button class="btn-r btn-out" onclick="closeModal()">Cancel</button>
  </div>`);
}

function confirmDeleteAccount() {
  const confirm = document.querySelector('#da-confirm')?.value;
  if(confirm !== 'DELETE') return toast('Type DELETE to confirm','bi-exclamation-circle-fill','var(--red)');
  resetState(); closeModal();
  toast('Account deleted','bi-trash-fill','var(--red)');
  nav('welcome');
}

/* ═══════════════════════════════════════════════════════════════
   EPIC 10: PREMIUM
   ═══════════════════════════════════════════════════════════════ */

function renderPremium() {
  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('settings')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px;margin-bottom:8px">👑</div>
      <div style="font-size:28px;font-weight:900">RISE Premium</div>
      <div style="font-size:14px;color:var(--t2);margin-top:4px">Unlock the full arsenal</div>
    </div>
    <div class="gc">
      ${[
        { icon:'bi-infinity', label:'Unlimited Alarms', desc:'Set as many as you need' },
        { icon:'bi-snow2', label:'Streak Freeze', desc:'Protect your streak once per month' },
        { icon:'bi-music-note-beamed', label:'Custom Alarm Sounds', desc:'Upload your own wake-up sound' },
        { icon:'bi-graph-up', label:'Advanced Analytics', desc:'Deep dive into your discipline data' },
        { icon:'bi-x-circle', label:'No Ads', desc:'Clean, distraction-free experience' },
        { icon:'bi-award-fill', label:'Exclusive Badges', desc:'Premium-only achievements' },
      ].map(f => `<div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <i class="bi ${f.icon}" style="font-size:22px;color:var(--gold);flex-shrink:0;margin-top:2px"></i>
        <div><div style="font-weight:700;font-size:15px">${f.label}</div><div style="font-size:12px;color:var(--t2);margin-top:2px">${f.desc}</div></div>
      </div>`).join('')}
    </div>
    ${S.isPremium ? `<div class="gc" style="text-align:center;border-color:rgba(255,214,10,.3);background:rgba(255,214,10,.04)">
      <div style="font-size:16px;font-weight:800;color:var(--gold)">Premium Active</div>
      <div style="font-size:13px;color:var(--t2);margin-top:4px">You have full access to all features</div>
    </div>` : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
      <div class="gc" style="text-align:center;cursor:pointer;border-color:var(--border)" onclick="subscribePremium('monthly')">
        <div style="font-size:24px;font-weight:900">$4.99</div>
        <div style="font-size:12px;color:var(--t2)">per month</div>
      </div>
      <div class="gc" style="text-align:center;cursor:pointer;border-color:rgba(255,214,10,.3);background:rgba(255,214,10,.04)" onclick="subscribePremium('yearly')">
        <div style="font-size:24px;font-weight:900;color:var(--gold)">$29.99</div>
        <div style="font-size:12px;color:var(--t2)">per year</div>
        <span class="tag tag-gold" style="margin-top:8px;font-size:10px">SAVE 50%</span>
      </div>
    </div>
    <button class="btn-r btn-w" onclick="subscribePremium('yearly')">Start Premium — $29.99/year</button>`}
  </div>`;
}

function subscribePremium(plan) {
  if(!S.paymentMethod) return toast('Add a payment method first','bi-exclamation-circle-fill','var(--red)');
  S.isPremium = true;
  S.streakFreezeAvailable = true;
  save();
  toast('Welcome to RISE Premium! 👑','bi-crown-fill','var(--gold)');
  addNotification('Premium Active','You now have access to all premium features.','👑');
  render();
}

function useStreakFreeze() {
  if(!S.streakFreezeAvailable) return toast('Streak freeze already used this month','bi-exclamation-circle-fill','var(--red)');
  openModal(`<div style="text-align:center;padding:10px 0">
    <i class="bi bi-snow2" style="font-size:40px;color:var(--blue);display:block;margin-bottom:16px"></i>
    <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Streak Freeze</h3>
    <p style="font-size:14px;color:var(--t2);margin-bottom:24px">Protect your streak for one day. You won't earn XP, but your streak stays intact. 1 use per month.</p>
    <button class="btn-r btn-w" style="margin-bottom:10px" onclick="activateStreakFreeze()">Activate Freeze</button>
    <button class="btn-r btn-out" onclick="closeModal()">Cancel</button>
  </div>`);
}

function activateStreakFreeze() {
  S.streakFreezeAvailable = false;
  S.streakFreezeUsedDate = new Date().toISOString();
  save(); closeModal();
  toast('Streak freeze activated!','bi-snow2','var(--blue)');
  addNotification('Streak Freeze','Your streak is protected for today. No XP earned.','❄️');
}

function renderAdvancedStats() {
  const history = S.wakeHistory.slice(-30);
  const avgScore = history.length ? Math.round(history.reduce((s,w)=> s+(w.wokeOnTime?1:0),0)/history.length*100) : 0;
  const totalXP = history.reduce((s,w)=>s+w.xpEarned,0);

  return `<div class="sc" style="padding-top:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button style="background:none;border:none;color:var(--t2);font-size:16px;cursor:pointer" onclick="nav('profile')"><i class="bi bi-chevron-left"></i> Back</button>
    </div>
    <div class="greet"><h1>Advanced Stats</h1><p>Last 30 days</p></div>
    ${!S.isPremium ? `<div class="gc" style="text-align:center;border-color:rgba(255,214,10,.3)">
      <i class="bi bi-lock-fill" style="font-size:28px;color:var(--gold);display:block;margin-bottom:8px"></i>
      <div style="font-weight:700">Premium Feature</div>
      <div style="font-size:13px;color:var(--t2);margin:4px 0 12px">Unlock detailed analytics with RISE Premium</div>
      <button class="btn-r btn-sm btn-w" onclick="nav('premium')">Upgrade</button>
    </div>` : `
    <div class="stat-r">
      <div class="stat"><div class="si">📊</div><div class="sn">${avgScore}%</div><div class="sl">Success Rate</div></div>
      <div class="stat"><div class="si">⚡</div><div class="sn">${totalXP}</div><div class="sl">XP Earned</div></div>
    </div>
    <div class="stat-r">
      <div class="stat"><div class="si">🔥</div><div class="sn">${S.longestStreak}</div><div class="sl">Best Streak</div></div>
      <div class="stat"><div class="si">💰</div><div class="sn">$${S.totalAvoided}</div><div class="sl">Total Saved</div></div>
    </div>
    <div class="sh">Wake History (Last 7 Days)</div>
    <div class="gc" style="padding:6px 20px">
      ${S.wakeHistory.slice(-7).reverse().map(w => {
        const d = new Date(w.date);
        return `<div class="phi">
          <div>
            <div style="font-weight:700">${d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
            <div style="font-size:12px;color:var(--t3)">${w.wokeOnTime?'Woke on time':'Snoozed'} · +${w.xpEarned} XP</div>
          </div>
          <span class="tag ${w.wokeOnTime?'tag-grn':'tag-red'}">${w.wokeOnTime?'✓':'✗'}</span>
        </div>`;
      }).join('')}
      ${!S.wakeHistory.length ? '<div style="text-align:center;padding:20px;color:var(--t3)">No history yet</div>' : ''}
    </div>`}
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD (Main Hub)
   ═══════════════════════════════════════════════════════════════ */

function renderDashboard() {
  const rank = getRank(S.xp);
  const nextRank = getNextRank(S.xp);
  const score = calcDisciplineScore();
  S.disciplineScore = score;
  const nextAlarm = S.alarms.find(a => a.enabled);
  const unreadNotifs = (S.notifications||[]).filter(n=>!n.read).length;

  const greeting = getGreeting();

  return `<div class="sc">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div class="greet" style="margin-bottom:0"><h1>${greeting}</h1><p>Day ${S.streak||1} of your grind${S.streak>7?' — keep pushing':''}</p></div>
      <button style="background:none;border:none;position:relative;cursor:pointer" onclick="nav('notifications')">
        <i class="bi bi-bell-fill" style="font-size:22px;color:var(--t2)"></i>
        ${unreadNotifs?`<div style="position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:var(--red);font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center">${unreadNotifs}</div>`:''}
      </button>
    </div>
    <div class="gc anim d1">
      <div class="ring-c">
        <div class="ring"><svg viewBox="0 0 180 180"><circle class="trk" cx="90" cy="90" r="80"/><circle class="prg" id="scoreP" cx="90" cy="90" r="80"/></svg><div class="val"><div class="num" id="scoreN">0</div><div class="lbl">Discipline</div></div></div>
        <div style="margin-top:14px"><div class="rb"><i class="bi bi-shield-fill-check"></i> ${rank.name}</div></div>
        ${nextRank ? `<div class="xpb-c" style="width:100%;margin-top:14px">
          <div class="xpb-l"><span>${S.xp.toLocaleString()} XP</span><span>${nextRank.xp.toLocaleString()} XP to ${nextRank.name}</span></div>
          <div class="xpb"><div class="xpb-f" id="xpF"></div></div>
        </div>` : `<div style="margin-top:12px;font-size:13px;color:var(--gold);font-weight:700">MAX RANK ACHIEVED</div>`}
      </div>
    </div>
    <div class="stat-r anim d2">
      <div class="stat"><div class="si">🔥</div><div class="sn" style="color:var(--orange)">${S.streak}</div><div class="sl">Day Streak</div></div>
      <div class="stat"><div class="si">💰</div><div class="sn" style="color:var(--green)">$${S.totalAvoided}</div><div class="sl">Penalty Avoided</div></div>
    </div>
    ${nextAlarm ? `<div class="sh anim d3">Next Alarm</div>
    <div class="ac anim d3" onclick="triggerAlarm(S.alarms.find(a=>a.enabled))">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="at">${fmtTimeShort(nextAlarm.hour,nextAlarm.minute)}</div>
          <div style="font-size:14px;color:var(--t2);font-weight:600;margin-top:2px">${getAlarmDayLabel(nextAlarm)} — ${fmtPer(nextAlarm.hour)}</div>
        </div>
        <div class="tog on" onclick="event.stopPropagation();toggleAlarm('${nextAlarm.id}')"></div>
      </div>
      <div class="am">
        <span class="tag tag-red"><i class="bi bi-exclamation-circle-fill"></i> $${nextAlarm.penalty}</span>
        <span class="tag tag-blue"><i class="bi bi-geo-alt-fill"></i> ${challengeName(nextAlarm.challenge)}</span>
        ${isAlarmLocked(nextAlarm)?'<span class="tag tag-red"><i class="bi bi-lock-fill"></i> Locked</span>':''}
      </div>
    </div>` : `<div class="gc anim d3" style="text-align:center" onclick="nav('alarms')">
      <i class="bi bi-alarm" style="font-size:32px;color:var(--t3);display:block;margin-bottom:8px"></i>
      <div style="font-weight:700">No alarm set</div>
      <div style="font-size:13px;color:var(--t2);margin-top:4px">Tap to create one</div>
    </div>`}
    <div class="sh anim d4">Morning Protocol</div>
    <div class="gc anim d4" style="padding:6px 20px">
      ${S.protocolTasks.filter(t=>t.enabled).map(t => {
        const done = (S.todayProtocolDone||[]).includes(t.id);
        return `<div class="pi ${done?'done':''}" onclick="quickToggleProtocol('${t.id}')">
          <div class="pc"><i class="bi bi-check2"></i></div>
          <span class="pt">${t.icon} ${t.name}</span>
          <span class="px">+${t.xp} XP</span>
        </div>`;
      }).join('')}
      ${!S.protocolTasks.some(t=>t.enabled)?'<div style="text-align:center;padding:16px;color:var(--t3);font-size:14px">No protocol tasks enabled</div>':''}
    </div>
    <button style="background:none;border:none;color:var(--blue);font-size:14px;font-weight:600;cursor:pointer;display:block;margin:-4px auto 16px" onclick="nav('protocolCustomize')">Customize Protocol</button>
    <div class="wb anim d5" onclick="nav('warMode')">
      <h3>⚔️ War Mode</h3>
      <p>Challenge a friend. Loser pays the winner. No mercy.</p>
    </div>
    <button class="btn-r btn-out anim d6" onclick="shareProgress()" style="margin-bottom:16px"><i class="bi bi-share-fill"></i> Share Your Progress</button>
  </div>`;
}

function quickToggleProtocol(id) {
  if(!S.todayProtocolDone) S.todayProtocolDone = [];
  const idx = S.todayProtocolDone.indexOf(id);
  if(idx>=0) S.todayProtocolDone.splice(idx,1);
  else {
    S.todayProtocolDone.push(id);
    const t = S.protocolTasks.find(x=>x.id===id);
    if(t) { earnXP(t.xp); toast(`+${t.xp} XP — ${t.name}`,'bi-check-circle-fill','var(--gold)'); }
  }
  save(); render();
  if(navigator.vibrate) navigator.vibrate(15);
}

function getGreeting() {
  const h = new Date().getHours();
  if(h < 5) return 'Still up? Sleep.';
  if(h < 12) return 'Rise and conquer.';
  if(h < 17) return 'Stay locked in.';
  if(h < 21) return 'Prepare for tomorrow.';
  return 'Set your alarm.';
}

function getAlarmDayLabel(a) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date().getDay();
  if(a.repeatDays.includes(today)) return 'Today';
  for(let i=1;i<=7;i++) { if(a.repeatDays.includes((today+i)%7)) return days[(today+i)%7]; }
  return 'Not scheduled';
}

function animateDashboard() {
  const score = S.disciplineScore || 0;
  const circ = 2*Math.PI*80;
  const offset = circ - (score/100)*circ;
  const prog = document.querySelector('#scoreP');
  if(prog) prog.style.strokeDashoffset = offset;

  let cur = 0;
  const numEl = document.querySelector('#scoreN');
  const interval = setInterval(() => {
    cur += 2;
    if(cur >= score) { cur = score; clearInterval(interval); }
    if(numEl) numEl.textContent = cur;
  }, 20);

  const nextRank = getNextRank(S.xp);
  if(nextRank) {
    const prevRank = RANKS[RANKS.indexOf(nextRank)-1] || RANKS[0];
    const pct = ((S.xp - prevRank.xp) / (nextRank.xp - prevRank.xp)) * 100;
    setTimeout(() => { const f = document.querySelector('#xpF'); if(f) f.style.width = pct+'%'; }, 300);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE
   ═══════════════════════════════════════════════════════════════ */

function renderProfile() {
  const rank = getRank(S.xp);
  const nextRank = getNextRank(S.xp);
  const score = calcDisciplineScore();

  return `<div class="sc">
    <div class="ph">
      <div class="pav" style="background:linear-gradient(135deg,rgba(255,214,10,.2),rgba(255,159,10,.1))">${S.user?.avatar||'⚡'}</div>
      <div class="pnm">${S.user?.displayName||'User'}</div>
      <div class="phn">@${S.user?.username||'user'}</div>
      <div style="margin-top:12px"><div class="rb"><i class="bi bi-shield-fill-check"></i> ${rank.name} — ${S.xp.toLocaleString()} XP</div></div>
    </div>
    <div class="pst">
      <div class="ps"><div class="pv" style="color:var(--orange)">${S.streak}</div><div class="pl">Streak</div></div>
      <div class="ps"><div class="pv" style="color:var(--green)">$${S.totalAvoided}</div><div class="pl">Saved</div></div>
      <div class="ps"><div class="pv">${score}</div><div class="pl">Score</div></div>
    </div>
    <div class="sh">Rank Progression</div>
    <div class="gc">
      ${nextRank ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:14px;font-weight:700">${rank.name}</span>
        <span style="font-size:13px;color:var(--t2);font-weight:600">→ ${nextRank.name}</span>
      </div>
      <div class="xpb" style="height:8px"><div class="xpb-f" style="width:${((S.xp-rank.xp)/(nextRank.xp-rank.xp))*100}%;border-radius:4px"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--t3);font-weight:600">
        <span>${S.xp.toLocaleString()} / ${nextRank.xp.toLocaleString()} XP</span><span>${(nextRank.xp-S.xp).toLocaleString()} XP to go</span>
      </div>` : `<div style="text-align:center;font-size:16px;font-weight:800;color:var(--gold)">MAX RANK — APEX</div>`}
      <div style="margin-top:16px;font-size:12px;color:var(--t2);line-height:1.6">
        ${RANKS.map(r => `<div style="display:flex;justify-content:space-between;padding:4px 0;${r.name===rank.name?'color:var(--gold);font-weight:700':''}"><span>${r.name}</span><span style="${r.name!==rank.name?'color:var(--t3)':''}">${r.xp.toLocaleString()} XP</span></div>`).join('')}
      </div>
    </div>
    <div class="sh">Achievements</div>
    <div class="ag" style="margin-bottom:20px">
      ${ACHIEVEMENTS.map(a => {
        const unlocked = S.achievements.includes(a.id);
        return `<div class="ach ${unlocked?'':'locked'}" onclick="${unlocked?`toast('${a.name}: ${a.desc}','bi-trophy-fill','var(--gold)')`:''}"">
          <div class="ai">${a.icon}</div>
          <div class="an">${a.name}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="sh">Quick Links</div>
    <div class="sr" onclick="nav('penaltyHistory')"><div class="sl"><i class="bi bi-receipt"></i><span>Penalty History</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
    <div class="sr" onclick="nav('advancedStats')"><div class="sl"><i class="bi bi-graph-up"></i><span>Advanced Stats</span></div>${S.isPremium?'':'<span style="font-size:11px;font-weight:700;color:var(--gold)">PREMIUM</span>'}</div>
    <div class="sr" onclick="nav('settings')"><div class="sl"><i class="bi bi-gear-fill"></i><span>Settings</span></div><i class="bi bi-chevron-right" style="color:var(--t3)"></i></div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */

function updateStatusTime() {
  const now = new Date();
  const h = now.getHours()%12||12;
  const m = now.getMinutes().toString().padStart(2,'0');
  const el = document.querySelector('#stime');
  if(el) el.textContent = `${h}:${m}`;
}

// Service Worker
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});

// Init
updateStatusTime();
setInterval(updateStatusTime, 30000);

// Route to correct screen
if(S.isLoggedIn && S.onboardingComplete) {
  currentScreen = S.currentScreen && ['dashboard','alarms','leaderboard','profile'].includes(S.currentScreen) ? S.currentScreen : 'dashboard';
} else if(S.isLoggedIn) {
  currentScreen = 'profileSetup';
} else {
  currentScreen = 'welcome';
}
render();

// Check for streak reminder at 10 PM
setInterval(() => {
  const now = new Date();
  if(now.getHours() === 22 && now.getMinutes() === 0 && S.isLoggedIn) {
    const hasAlarmTomorrow = S.alarms.some(a => a.enabled && a.repeatDays.includes((now.getDay()+1)%7));
    if(!hasAlarmTomorrow && S.notifPrefs.streakReminder) {
      toast('You don\'t have an alarm set for tomorrow. Your streak is at risk!','bi-exclamation-triangle-fill','var(--orange)');
      addNotification('Streak at Risk','You don\'t have an alarm set for tomorrow. Your '+S.streak+'-day streak could break.','⚠️');
    }
  }
}, 60000);
