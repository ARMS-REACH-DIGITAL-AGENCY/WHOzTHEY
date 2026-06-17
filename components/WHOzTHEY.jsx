'use client'

import { useState, useEffect, useRef, useMemo } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

// ── BRAND ─────────────────────────────────────────────────────────────────────
function Wordmark({ size=32 }) {
  // Official logo — fingerprint magnifying glass speech bubble
  const h = size * 2.8;
  return (
    <img
      src="/logo.png"
      alt="WHOzTHEY?"
      style={{ height:`${h}px`, width:"auto", display:"block", maxWidth:"280px" }}
    />
  );
}
function BrandLabel({ light=false, size="inherit" }) {
  return (
    <span style={{ fontSize:size, fontFamily:"'Georgia',serif", fontWeight:"700", letterSpacing:"0", whiteSpace:"nowrap", display:"inline-flex", alignItems:"baseline" }}>
      <span style={{ color:light?"#f8fafc":"#0f172a" }}>WHO</span>
      <span style={{ color:light?"#1a1a1a":"#dc2626", position:"relative", top:"-0.28em" }}>Z</span>
      <span style={{ color:light?"#f8fafc":"#0f172a" }}>THEY?</span>
    </span>
  );
}

// ── PERSONAS ──────────────────────────────────────────────────────────────────
const PERSONAS = {
  oracle:     { emoji:"🏆", title:"The Oracle",     color:"#7c3aed", bg:"#faf5ff", border:"#d8b4fe", desc:"You're usually right before anyone finishes the sentence." },
  debunker:   { emoji:"🔥", title:"The Debunker",   color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", desc:"You live to call BS. And you're usually correct." },
  believer:   { emoji:"❤️",  title:"The Believer",   color:"#16a34a", bg:"#f0fdf4", border:"#86efac", desc:"You trust what you were told. Family wisdom runs deep." },
  instigator: { emoji:"😈", title:"The Instigator", color:"#d97706", bg:"#fffbeb", border:"#fde68a", desc:"You drop the claim and walk away. You love the chaos." },
  peacemaker: { emoji:"⚖️",  title:"The Peacemaker", color:"#0284c7", bg:"#f0f9ff", border:"#7dd3fc", desc:"You just want the truth. Someone has to be the adult." },
};

const QUIZ_QUESTIONS = [
  { q:"Someone at dinner says 'They say you lose most body heat through your head.' You:", options:[
    { label:"Immediately say that's been debunked", persona:"debunker" },
    { label:"Nod — your mom said that your whole life", persona:"believer" },
    { label:"Quietly Google it under the table", persona:"oracle" },
    { label:"Say it louder to start a debate", persona:"instigator" },
    { label:"Change the subject before a fight starts", persona:"peacemaker" },
  ]},
  { q:"Your family is arguing about an old saying. Your role is:", options:[
    { label:"Present the evidence and end it", persona:"oracle" },
    { label:"Defend whoever your grandma agrees with", persona:"believer" },
    { label:"Prove everyone wrong with sources", persona:"debunker" },
    { label:"Add three more controversial claims", persona:"instigator" },
    { label:"Suggest everyone agree to disagree", persona:"peacemaker" },
  ]},
  { q:"WHOzTHEY? says a claim is FALSE. But your grandfather swore by it. You:", options:[
    { label:"Trust the research. Sorry grandpa.", persona:"debunker" },
    { label:"Grandpa knew things science doesn't", persona:"believer" },
    { label:"Dig deeper — maybe the origin is disputed", persona:"oracle" },
    { label:"Tell everyone at Christmas dinner", persona:"instigator" },
    { label:"Keep both possibilities open", persona:"peacemaker" },
  ]},
];

const ALL_BADGES = [
  { id:"first_search",  emoji:"🔍", label:"First Look",    desc:"Made your first WHOzTHEY? search" },
  { id:"first_callbs",  emoji:"🔥", label:"CALL BS",       desc:"Called BS for the first time" },
  { id:"first_believe", emoji:"❤️",  label:"True Believer", desc:"Stood your ground and believed it" },
  { id:"debate_all3",   emoji:"⚡",  label:"Full Debate",   desc:"Voted on all 3 debate layers" },
  { id:"settle_it",     emoji:"🕊️",  label:"Settled It",    desc:"Used Settle the Argument" },
  { id:"five_searches", emoji:"🧠",  label:"Deep Diver",    desc:"Searched 5 different claims" },
  { id:"fun_fact_fan",  emoji:"★",   label:"Fun Fact Fan",  desc:"Revealed a Fun Facts answer" },
  { id:"streak_3",      emoji:"🔢",  label:"On a Roll",     desc:"Searched 3 claims in one session" },
  { id:"clarified",     emoji:"🎯",  label:"Precise",       desc:"Used THEY Said WHAT? to clarify" },
];

const SEED_FACTS = [
  "You lose most of your body heat through your head","Reading in dim light ruins your eyesight",
  "Lightning never strikes the same place twice","Cracking your knuckles causes arthritis",
  "You only use 10% of your brain","Swimming right after eating causes cramps",
  "Carrots improve your eyesight","A dog's mouth is cleaner than a human's",
  "You swallow 8 spiders a year in your sleep","Feed a cold, starve a fever",
  "Hair and nails keep growing after death","An apple a day keeps the doctor away",
  "Sitting too close to the TV damages your eyes","Cold weather gives you a cold",
  "Goldfish have a 3-second memory","Shaving makes hair grow back thicker",
  "Sugar makes kids hyperactive","Bulls are enraged by the color red",
  "Humans and dinosaurs never coexisted","Your tongue has specific zones for different tastes",
];

// ── SPONSOR ADS — mixed into Fun Facts carousel ───────────────────────────────
const SPONSOR_ADS = [
  {
    id:"s1",
    isSponsor: true,
    sponsor: "Travel Protection Club",
    badge: "SPONSORED",
    badgeColor: "#0284c7",
    teaser: "They say golf travel is risky...",
    body: "WHOzTHEY? says CALL BS. The Travel Protection Club + ShipSticks gives you real protection for just $75 your first year.",
    cta: "Get Protected →",
    ctaUrl: "https://whozthey.com",
    accent: "#0284c7",
  },
  {
    id:"s2",
    isSponsor: true,
    sponsor: "YatStats",
    badge: "SPONSORED",
    badgeColor: "#16a34a",
    teaser: "They say high school athletes get forgotten after graduation...",
    body: "WHOzTHEY? says CALL BS. YatStats tracks every alumni who played at the next level. See where they YAT?",
    cta: "Explore YatStats →",
    ctaUrl: "https://yatstats.com",
    accent: "#16a34a",
  },
  {
    id:"s3",
    isSponsor: true,
    sponsor: "H2Yo!",
    badge: "SPONSORED",
    badgeColor: "#7c3aed",
    teaser: "They say hydration doesn't really matter that much...",
    body: "CALL BS. H2Yo! premium hydration is Good for Yo Body. Yo Mind. And Yo Business. Branded water that works as hard as you do.",
    cta: "Get H2Yo! →",
    ctaUrl: "https://whozthey.com",
    accent: "#7c3aed",
  },
  {
    id:"s4",
    isSponsor: true,
    sponsor: "ARMS Reach Digital Agency",
    badge: "SPONSORED",
    badgeColor: "#dc2626",
    teaser: "They say you can't automate real relationships...",
    body: "WHOzTHEY? says watch us. ARMS Reach builds AI-powered sales funnels and CRM systems that keep you connected at scale.",
    cta: "Meet ARMS Reach →",
    ctaUrl: "https://whozthey.com",
    accent: "#dc2626",
  },
  {
    id:"s5",
    isSponsor: true,
    sponsor: "ASB · peteismyagent.com",
    badge: "SPONSORED",
    badgeColor: "#d97706",
    teaser: "They say promotional products don't drive real sales...",
    body: "CALL BS. Over 1,000,000 branded products at your fingertips. ASB turns every giveaway into a sales conversation.",
    cta: "Shop Promo Products →",
    ctaUrl: "https://peteismyagent.com",
    accent: "#d97706",
  },
];

// Interleave sponsor ads every 4 cards. Real trending searches (when available)
// lead the rotation; seed facts fill the rest.
function buildCarousel(trending = []) {
  const trendingItems = trending.map((row, i) => ({
    isSponsor: false,
    isTrending: true,
    teaser: row.raw_claim || row.display_claim,
    id: row.id || `t${i}`,
  }));
  const factItems = SEED_FACTS.map((fact, i) => ({ isSponsor: false, isTrending: false, teaser: fact, id: `f${i}` }));
  const pool = [...trendingItems, ...factItems];

  const items = [];
  pool.forEach((entry, i) => {
    items.push(entry);
    if ((i + 1) % 4 === 0) {
      const ad = SPONSOR_ADS[Math.floor((i + 1) / 4 - 1) % SPONSOR_ADS.length];
      items.push(ad);
    }
  });
  return items;
}

// ── MERCH DATA ────────────────────────────────────────────────────────────────
const MERCH = [
  { id:1, emoji:"👤", name:'Hello, I\'m THEY Name Badge', price:"$4.99", desc:'The ultimate gag gift for every know-it-all. Wear it proudly. You\'ve been "they" this whole time.', tag:"BESTSELLER", printful:"https://printful.com", variants:["White","Red","Black"] },
  { id:2, emoji:"👕", name:'"Hello, I\'m THEY" T-Shirt', price:"$24.99", desc:'Classic name-tag design on a premium tee. The conversation starter you didn\'t know you needed.', tag:"NEW", printful:"https://printful.com", variants:["S","M","L","XL","2XL"] },
  { id:3, emoji:"👕", name:'"CALL BS" T-Shirt', price:"$24.99", desc:'For The Debunker. You were right. Now everyone can know it.', tag:"", printful:"https://printful.com", variants:["S","M","L","XL","2XL"] },
  { id:4, emoji:"☕", name:'"They Say..." Mug', price:"$16.99", desc:'Start every morning with the phrase that started a thousand arguments.', tag:"", printful:"https://printful.com", variants:["11oz","15oz"] },
  { id:5, emoji:"👕", name:'"The Oracle" T-Shirt', price:"$24.99", desc:'For those who are always right. You know who you are.', tag:"", printful:"https://printful.com", variants:["S","M","L","XL","2XL"] },
  { id:6, emoji:"🧢", name:'WHOzTHEY? Snapback', price:"$28.99", desc:'Raise the Z. Wear the brand. Start debates wherever you go.', tag:"", printful:"https://printful.com", variants:["One Size"] },
  { id:7, emoji:"📌", name:'"I\'m THEY" Enamel Pin', price:"$9.99", desc:'Small but mighty. Perfect for the lapel of every know-it-all in your life.', tag:"GIFT IDEA", printful:"https://printful.com", variants:["Standard"] },
  { id:8, emoji:"👕", name:'"Settle It At The Table" Tee', price:"$24.99", desc:'The peacemaker\'s uniform. Someone has to end the argument.', tag:"", printful:"https://printful.com", variants:["S","M","L","XL","2XL"] },
];

// ── AI FETCH ──────────────────────────────────────────────────────────────────
async function fetchClarification(claim) {
  // SECURE: API key lives on the server in /api/clarify — never in the browser
  const res = await fetch("/api/clarify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });
  if (!res.ok) return { needsClarification: false, versions: [] };
  return res.json();
}

async function fetchAnswer(claim, context = {}) {
  // SECURE: API key lives on the server in /api/search — never in the browser
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claim,
      sessionId: context.sessionId || null,
      firebaseUid: context.firebaseUid || null,
    }),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

async function fetchRecentSearches() {
  const res = await fetch("/api/recent-searches", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.searches) ? data.searches : [];
}

const VERDICT_MAP = {
  "ORIGIN TRACED":        { bg:"#f0fdf4", border:"#86efac", badge:"#16a34a", label:"📍 Origin Traced" },
  "BOTH SIDES VALID":     { bg:"#f0f9ff", border:"#7dd3fc", badge:"#0284c7", label:"⚖️ Both Sides Valid" },
  "TRADITIONAL WISDOM":   { bg:"#fffbeb", border:"#fde68a", badge:"#d97706", label:"🏡 Traditional Wisdom" },
  "INSTITUTIONALLY PUSHED":{ bg:"#faf5ff", border:"#d8b4fe", badge:"#7c3aed", label:"🏛 Institutionally Pushed" },
  "GENUINELY DISPUTED":   { bg:"#f8fafc", border:"#cbd5e1", badge:"#475569", label:"🤷 Genuinely Disputed" },
  "LIGHTHEARTED MYTH":    { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", label:"😄 Lighthearted Myth" },
  // fallbacks for old verdicts
  TRUE:             { bg:"#f0fdf4", border:"#86efac", badge:"#16a34a", label:"📍 Origin Traced" },
  FALSE:            { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", label:"😄 Lighthearted Myth" },
  "PARTIALLY TRUE": { bg:"#f0f9ff", border:"#7dd3fc", badge:"#0284c7", label:"⚖️ Both Sides Valid" },
  MYTH:             { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", label:"😄 Lighthearted Myth" },
  DISPUTED:         { bg:"#f8fafc", border:"#cbd5e1", badge:"#475569", label:"🤷 Genuinely Disputed" },
};

// ── FIREBASE AUTH ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

function appUserFromFirebase(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "WHOzTHEY User",
    photoURL: firebaseUser.photoURL || null,
  };
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email/password combination did not work.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Try signing in instead.";
  if (code.includes("weak-password")) return "Please use a password with at least 6 characters.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before it finished.";
  if (code.includes("unauthorized-domain")) return "This domain is not authorized in Firebase Authentication yet.";
  return error?.message || "Sign-in failed. Please try again.";
}

// ── THEY SAID WHAT? ───────────────────────────────────────────────────────────
function TheySaidWhat({ clarification, onSelect, onSkip }) {
  return (
    <div style={{ background:"#fffbeb", border:"2px solid #fde68a", borderRadius:"12px", padding:"20px", margin:"16px 20px", maxWidth:"680px", marginLeft:"auto", marginRight:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
        <span style={{ fontSize:"20px" }}>⚠️</span>
        <span style={{ fontFamily:"'Georgia',serif", fontSize:"18px", fontWeight:"700", color:"#0f172a" }}>
          THEY Said <span style={{ color:"#dc2626" }}>WHAT?</span>
        </span>
      </div>
      <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#92400e", margin:"0 0 16px", fontStyle:"italic" }}>
        {clarification.clarificationNote}
      </p>
      <p style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#d97706", margin:"0 0 10px" }}>
        Which claim are you actually debating?
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"14px" }}>
        {clarification.versions.map(v => (
          <button key={v.id} onClick={()=>onSelect(v.claim)} style={{
            padding:"14px 16px", background:"#fff", border:"1px solid #fde68a",
            borderRadius:"8px", textAlign:"left", cursor:"pointer", transition:"all 0.15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#dc2626";e.currentTarget.style.background="#fef2f2";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="#fde68a";e.currentTarget.style.background="#fff";}}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
              <span style={{ fontSize:"20px", flexShrink:0 }}>{v.emoji}</span>
              <div>
                <p style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", color:v.tone==="humorous"?"#dc2626":"#16a34a", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 3px" }}>{v.label}</p>
                <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", color:"#0f172a", margin:0, lineHeight:1.4 }}>"{v.claim}"</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onSkip} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#94a3b8", padding:0 }}>
        Skip clarification — just search as typed →
      </button>
    </div>
  );
}

// ── PERSONALITY QUIZ ──────────────────────────────────────────────────────────
function PersonalityQuiz({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ oracle:0, debunker:0, believer:0, instigator:0, peacemaker:0 });
  function pick(persona) {
    const next = { ...scores, [persona]:scores[persona]+1 };
    if (step < QUIZ_QUESTIONS.length-1) { setScores(next); setStep(step+1); }
    else { const winner = Object.entries(next).sort((a,b)=>b[1]-a[1])[0][0]; onComplete(winner); }
  }
  const q = QUIZ_QUESTIONS[step];
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#1e293b 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px" }}>
      <div style={{ marginBottom:"24px" }}><Wordmark size={36} /></div>
      <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", padding:"28px 24px", maxWidth:"500px", width:"100%" }}>
        <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
          {QUIZ_QUESTIONS.map((_,i)=><div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background:i<=step?"#dc2626":"#334155" }} />)}
        </div>
        <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 10px" }}>Find Your WHOzTHEY? Personality · {step+1} of {QUIZ_QUESTIONS.length}</p>
        <h2 style={{ fontFamily:"'Georgia',serif", fontSize:"18px", color:"#f8fafc", lineHeight:1.5, margin:"0 0 20px" }}>{q.q}</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
          {q.options.map((opt,i)=>(
            <button key={i} onClick={()=>pick(opt.persona)} style={{ padding:"12px 16px", background:"transparent", border:"1px solid #334155", borderRadius:"8px", textAlign:"left", cursor:"pointer", fontFamily:"system-ui", fontSize:"14px", color:"#cbd5e1" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#dc2626";e.currentTarget.style.color="#f8fafc";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#cbd5e1";}}>
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ textAlign:"center", borderTop:"1px solid #334155", paddingTop:"16px" }}>
          <button onClick={onSkip} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#475569", textDecoration:"underline", padding:0 }}>
            Skip — just take me to the site
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PERSONA BANNER ────────────────────────────────────────────────────────────
function PersonaBanner({ personaKey, badges, onDismiss }) {
  const p = PERSONAS[personaKey];
  const earned = ALL_BADGES.filter(b=>badges.includes(b.id));
  return (
    <div style={{ background:p.bg, border:`1px solid ${p.border}`, borderRadius:"10px", padding:"16px 20px", margin:"16px 20px", maxWidth:"700px", marginLeft:"auto", marginRight:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"28px" }}>{p.emoji}</span>
          <div>
            <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:p.color, margin:"0 0 2px" }}>Your WHOzTHEY? Personality</p>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:"18px", fontWeight:"700", color:"#0f172a", margin:"0 0 2px" }}>{p.title}</h3>
            <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#475569", margin:0 }}>{p.desc}</p>
          </div>
        </div>
        <button onClick={onDismiss} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:"18px", padding:"4px", flexShrink:0 }}>✕</button>
      </div>
      {earned.length>0 && (
        <div style={{ marginTop:"12px", paddingTop:"12px", borderTop:`1px solid ${p.border}` }}>
          <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 8px" }}>Badges Earned</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {earned.map(b=><span key={b.id} title={b.desc} style={{ padding:"4px 10px", background:"#fff", border:`1px solid ${p.border}`, borderRadius:"20px", fontFamily:"system-ui", fontSize:"11px", color:p.color, fontWeight:"600" }}>{b.emoji} {b.label}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── BADGE TOAST ───────────────────────────────────────────────────────────────
function BadgeToast({ badge, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:"#0f172a", border:"1px solid #dc2626", borderRadius:"10px", padding:"12px 20px", zIndex:999, display:"flex", alignItems:"center", gap:"10px", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideUp 0.3s ease", whiteSpace:"nowrap" }}>
      <span style={{ fontSize:"22px" }}>{badge.emoji}</span>
      <div>
        <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 1px" }}>Badge Unlocked!</p>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#f8fafc", margin:"0 0 1px" }}>{badge.label}</p>
        <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", margin:0 }}>{badge.desc}</p>
      </div>
    </div>
  );
}

// ── SHARE BUTTON ──────────────────────────────────────────────────────────────
function ShareButton({ query, verdict }) {
  const [copied, setCopied] = useState(false);
  function share() {
    const text = `They say "${query}" — WHOzTHEY? verdict: ${verdict}. Find out who "they" really are 👉 whoZthey.com`;
    if (navigator.share) { navigator.share({ title:"WHOzTHEY?", text, url:"https://whozthey.com" }).catch(()=>{}); }
    else { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  }
  return (
    <button onClick={share} style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 16px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"600", color:"#f8fafc" }}>
      {copied ? "✓ Copied!" : "📤 Share this result"}
    </button>
  );
}

// ── FIREBASE LOGIN ───────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin, currentUser, onLogout }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email.trim()) { setError("Enter your email address."); return; }
    if (!password.trim()) { setError("Enter your password."); return; }

    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      let credential;
      if (mode === "signup") {
        credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      } else {
        credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onLogin(appUserFromFirebase(credential.user));
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      onLogin(appUserFromFirebase(credential.user));
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await signOut(getFirebaseAuth());
      onLogout?.();
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", padding:"28px 24px", width:"100%", maxWidth:"380px" }}>
        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <Wordmark size={28} />
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#94a3b8", marginTop:"8px" }}>{currentUser ? "You are signed in to WHOzTHEY?" : "Sign in to comment & join the debate"}</p>
        </div>

        {currentUser ? (
          <>
            <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", padding:"14px", marginBottom:"14px" }}>
              <p style={{ fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#f8fafc", margin:"0 0 4px" }}>{currentUser.name}</p>
              <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#94a3b8", margin:0 }}>{currentUser.email}</p>
            </div>
            <button onClick={handleLogout} disabled={busy} style={{ width:"100%", padding:"12px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:busy?"wait":"pointer", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"10px" }}>
              {busy ? "Signing out…" : "Sign Out"}
            </button>
            {error && <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#fca5a5", margin:"0 0 10px", lineHeight:1.4 }}>{error}</p>}
            <button onClick={onClose} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#64748b" }}>Cancel</button>
          </>
        ) : (
          <>
            <div style={{ display:"flex", gap:"0", marginBottom:"20px", border:"1px solid #334155", borderRadius:"6px", overflow:"hidden" }}>
              {["login","signup"].map(m=>(
                <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1, padding:"8px", background:mode===m?"#dc2626":"transparent", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:mode===m?"#fff":"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>{m==="login"?"Sign In":"Sign Up"}</button>
              ))}
            </div>
            {mode==="signup" && (
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ width:"100%", padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", fontFamily:"system-ui", fontSize:"14px", color:"#f8fafc", outline:"none", marginBottom:"10px", boxSizing:"border-box" }} />
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" style={{ width:"100%", padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", fontFamily:"system-ui", fontSize:"14px", color:"#f8fafc", outline:"none", marginBottom:"10px", boxSizing:"border-box" }} />
            <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Password" type="password" autoComplete={mode==="signup"?"new-password":"current-password"} style={{ width:"100%", padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", fontFamily:"system-ui", fontSize:"14px", color:"#f8fafc", outline:"none", marginBottom:"14px", boxSizing:"border-box" }} />
            {error && <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#fca5a5", margin:"0 0 10px", lineHeight:1.4 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={busy} style={{ width:"100%", padding:"12px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:busy?"wait":"pointer", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"10px", opacity:busy?0.75:1 }}>
              {busy ? "Working…" : mode==="login"?"Sign In →":"Create Account →"}
            </button>
            <div style={{ textAlign:"center", marginBottom:"14px" }}>
              <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#475569" }}>or continue with</span>
            </div>
            <button onClick={handleGoogleSignIn} disabled={busy} style={{ width:"100%", padding:"10px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", cursor:busy?"wait":"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#cbd5e1", fontWeight:"600", marginBottom:"16px" }}>
              🔵 Google
            </button>
            <button onClick={onClose} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#475569" }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── COMMENTS ──────────────────────────────────────────────────────────────────
function CommentsSection({ claim, user, onLoginRequest }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  function submit() {
    if (!user) { onLoginRequest(); return; }
    if (!newComment.trim()) return;
    setComments(prev=>[...prev, { id:Date.now(), name:user.name, emoji:PERSONAS.oracle.emoji, text:newComment.trim(), time:"Just now" }]);
    setNewComment("");
  }
  return (
    <div style={{ padding:"20px", maxWidth:"700px", margin:"0 auto" }}>
      <h3 style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 14px" }}>💬 The Debate Floor</h3>
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={user?"Share your story or challenge this answer…":"Sign in to join the debate…"} style={{ flex:1, padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:"6px", fontFamily:"system-ui", fontSize:"13px", color:"#0f172a", outline:"none", background:"#f8fafc" }} />
        <button onClick={submit} style={{ padding:"0 16px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#fff", whiteSpace:"nowrap" }}>
          {user ? "Post" : "Sign In"}
        </button>
      </div>
      {comments.length === 0 && (
        <div style={{ background:"#f8fafc", border:"1px dashed #cbd5e1", borderRadius:"8px", padding:"14px" }}>
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#64748b", margin:0 }}>No debate posts yet. Be the first to join in.</p>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {comments.map(c=>(
          <div key={c.id} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
              <span>{c.emoji}</span>
              <span style={{ fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#0f172a" }}>{c.name}</span>
              <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", marginLeft:"auto" }}>{c.time}</span>
            </div>
            <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#374151", lineHeight:"1.6", margin:0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DEBATE PANEL ──────────────────────────────────────────────────────────────
function DebatePanel({ query, answer, persona, onBadgeEarned }) {
  const [votes, setVotes] = useState({ claim:null, origin:null, who:null });
  const [settled, setSettled] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const options = [
    { key:"sounds_good", label:"Sounds Good", color:"#16a34a", bg:"#f0fdf4", border:"#86efac", emoji:"✓" },
    { key:"call_bs", label:"I Call BS", color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", emoji:"✗" },
    { key:"no_clue", label:"No Clue", color:"#64748b", bg:"#f8fafc", border:"#cbd5e1", emoji:"?" },
  ];

  const layers = [
    { key:"claim",  label:"THE CLAIM", question:`They say "${query.length>40?query.slice(0,40)+"…":query}" — what do you think?` },
    { key:"origin", label:"THE ORIGIN", question:"Does the origin story WHOzTHEY? found sound right?" },
    { key:"who",    label:'WHO IS "THEY"?', question:"Does WHOzTHEY? seem to have identified 'they' correctly?" },
  ];

  function vote(layer, side) {
    const next = { ...votes, [layer]:side };
    setVotes(next);
    if (layer==="claim"&&side==="call_bs") onBadgeEarned("first_callbs");
    if (layer==="claim"&&side==="sounds_good") onBadgeEarned("first_believe");
    if (next.claim&&next.origin&&next.who) onBadgeEarned("debate_all3");
  }

  function handleSettle() {
    const msg = `They say "${query}" — WHOzTHEY? says ${answer.verdict||"DISPUTED"}. Argument settled. 👉 whoZthey.com`;
    setShareMsg(msg); setSettled(true); onBadgeEarned("settle_it");
    if (navigator.share) navigator.share({ title:"WHOzTHEY?", text:msg, url:"https://whozthey.com" }).catch(()=>{});
    else navigator.clipboard?.writeText(msg);
  }

  const p = persona ? PERSONAS[persona] : null;

  return (
    <div style={{ background:"#f8fafc", borderTop:"1px solid #e2e8f0", padding:"20px" }}>
      <div style={{ maxWidth:"700px", margin:"0 auto" }}>
        <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 14px" }}>⚡ Join the Debate</p>
        {layers.map(layer=>{
          const myVote = votes[layer.key];
          const selected = options.find(o=>o.key===myVote);
          return (
            <div key={layer.key} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"14px 16px", marginBottom:"10px" }}>
              <p style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 4px" }}>{layer.label}</p>
              <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#374151", margin:"0 0 12px" }}>{layer.question}</p>
              {!myVote ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
                  {options.map(opt=>(
                    <button key={opt.key} onClick={()=>vote(layer.key,opt.key)} style={{ padding:"9px 6px", background:opt.bg, border:`1px solid ${opt.border}`, borderRadius:"6px", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:opt.color, cursor:"pointer" }}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ background:selected.bg, border:`1px solid ${selected.border}`, borderRadius:"6px", padding:"10px 12px" }}>
                  <span style={{ fontFamily:"system-ui", fontSize:"12px", color:selected.color, fontWeight:"700" }}>You: {selected.label}{p?` · ${p.emoji} ${p.title}`:""}</span>
                  <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", margin:"4px 0 0" }}>Community results will appear once real votes are connected.</p>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ background:"#0f172a", borderRadius:"8px", padding:"16px", textAlign:"center" }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", color:"#f8fafc", margin:"0 0 10px" }}>Arguing about this with someone?</p>
          <button onClick={handleSettle} style={{ padding:"10px 24px", background:"#dc2626", border:"none", borderRadius:"6px", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>🕊️ Settle the Argument</button>
          {settled && <div style={{ marginTop:"10px", background:"#1e293b", borderRadius:"6px", padding:"10px 14px" }}><p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", margin:"0 0 4px" }}>Copied! Share this:</p><p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#f8fafc", margin:0 }}>{shareMsg}</p></div>}
        </div>
      </div>
    </div>
  );
}

// ── ANSWER PANEL ──────────────────────────────────────────────────────────────
function AnswerPanel({ query, answer, onClear, persona, onBadgeEarned, user, onLoginRequest }) {
  const [showDebate, setShowDebate] = useState(false);
  if (!answer) return null;
  const vc = VERDICT_MAP[answer.verdict] || VERDICT_MAP.DISPUTED;
  return (
    <section style={{ background:"#fff", borderBottom:"3px solid #e2e8f0" }}>
      <div style={{ background:vc.bg, borderBottom:`1px solid ${vc.border}`, padding:"20px 24px" }}>
        <div style={{ maxWidth:"760px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
          <div>
            <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 4px" }}>They say…</p>
            <h2 style={{ fontFamily:"'Georgia',serif", fontSize:"20px", fontWeight:"700", color:"#0f172a", margin:0, lineHeight:1.3 }}>"{query}"</h2>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px", flexShrink:0 }}>
            <span style={{ display:"inline-block", padding:"4px 12px", borderRadius:"20px", background:vc.badge, color:"#fff", fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase" }}>{vc.label}</span>
            <button onClick={onClear} style={{ background:"none", border:"1px solid #cbd5e1", borderRadius:"4px", color:"#64748b", fontSize:"11px", fontFamily:"system-ui", padding:"3px 10px", cursor:"pointer" }}>New search ✕</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"24px" }}>
        {/* WHO is "they" */}
        <div style={{ marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 8px" }}>WHOzTHEY? — The Origin</h3>
          <p style={{ fontFamily:"system-ui", fontSize:"15px", color:"#1e293b", lineHeight:"1.75", margin:0, fontWeight:"500" }}>{answer.whoIsThey}</p>
        </div>
        <div style={{ marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 8px" }}>How It Started</h3>
          <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#1e293b", lineHeight:"1.75", margin:0 }}>{answer.origin}</p>
        </div>

        {/* Two sides of the hand */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"20px" }}>
          <div style={{ background:"#f0f9ff", border:"1px solid #7dd3fc", borderRadius:"8px", padding:"14px 16px" }}>
            <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#0284c7", margin:"0 0 6px" }}>👁 From This Side</h3>
            <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#0f172a", lineHeight:"1.65", margin:0 }}>{answer.traditionalView}</p>
          </div>
          <div style={{ background:"#f8fafc", border:"1px solid #cbd5e1", borderRadius:"8px", padding:"14px 16px" }}>
            <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569", margin:"0 0 6px" }}>👁 From The Other Side</h3>
            <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#0f172a", lineHeight:"1.65", margin:0 }}>{answer.modernView}</p>
          </div>
        </div>

        {/* Where they meet */}
        {answer.commonGround && (
          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"8px", padding:"14px 16px", marginBottom:"20px" }}>
            <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#16a34a", margin:"0 0 6px" }}>🤝 Where Both Sides Agree</h3>
            <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#14532d", lineHeight:"1.65", margin:0 }}>{answer.commonGround}</p>
          </div>
        )}

        {/* Cultural spread */}
        <div style={{ background:"#f8fafc", borderRadius:"8px", padding:"16px 20px", borderLeft:"3px solid #dc2626", marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 8px" }}>How It Spread</h3>
          <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#1e293b", lineHeight:"1.75", margin:0 }}>{answer.culturalSpread}</p>
        </div>

        {/* Fun fact */}
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"8px", padding:"16px 20px", marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#d97706", margin:"0 0 6px" }}>★ They Also Say…</h3>
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#92400e", lineHeight:"1.7", margin:0 }}>{answer.funFact}</p>
        </div>

        {/* Cronkite sign-off */}
        <div style={{ textAlign:"center", padding:"16px 0 4px", borderTop:"1px solid #f1f5f9" }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"13px", color:"#94a3b8", fontStyle:"italic", margin:0 }}>
            "WHOzTHEY? doesn't tell you what to think. We just find out who said it first."
          </p>
        </div>
        {answer.sources?.length>0 && (
          <div style={{ marginBottom:"20px" }}>
            <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 8px" }}>Sources</h3>
            <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"4px" }}>
              {answer.sources.map((src,i)=><li key={i} style={{ fontFamily:"system-ui", fontSize:"12px", color:"#475569", display:"flex", gap:"6px" }}><span style={{ color:"#dc2626" }}>▸</span>{src}</li>)}
            </ul>
          </div>
        )}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"20px" }}>
          <ShareButton query={query} verdict={answer.verdict||"DISPUTED"} />
        </div>
        {!showDebate && (
          <button onClick={()=>setShowDebate(true)} style={{ width:"100%", padding:"14px", background:"#0f172a", border:"none", borderRadius:"8px", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            ⚡ Do you agree? Join the Debate
          </button>
        )}
      </div>
      {showDebate && <DebatePanel query={query} answer={answer} persona={persona} onBadgeEarned={onBadgeEarned} />}
      <CommentsSection claim={query} user={user} onLoginRequest={onLoginRequest} />
    </section>
  );
}

// ── FUN FACTS + SPONSOR CAROUSEL ─────────────────────────────────────────────
function FunFactsSection({ onSearch, onSponsorSelect, onBadgeEarned }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchRecentSearches()
      .then(rows => { if (alive) setTrendingSearches(rows); })
      .catch(() => { if (alive) setTrendingSearches([]); });
    return () => { alive = false; };
  }, []);

  const carouselItems = useMemo(() => buildCarousel(trendingSearches), [trendingSearches]);
  const item = carouselItems[current % carouselItems.length];
  const total = carouselItems.length;

  // Auto-rotate unless the user recently interacted with the carousel
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 10000);
    return () => clearInterval(t);
  }, [paused, total]);

  function goTo(i) { setCurrent(i); setPaused(true); setTimeout(()=>setPaused(false), 8000); }
  function prev() { goTo((current-1+total)%total); }
  function next() { goTo((current+1)%total); }

  function openItem() {
    setPaused(true);
    setTimeout(()=>setPaused(false), 8000);
    if (item.isSponsor) {
      onSponsorSelect(item);
      return;
    }
    onBadgeEarned("fun_fact_fan");
    onSearch(item.teaser);
  }

  return (
    <footer style={{ background:"#0f172a", position:"sticky", bottom:0, zIndex:40, boxShadow:"0 -4px 16px rgba(0,0,0,0.5)" }}>
      <div style={{ maxWidth:"760px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 12px" }}>
          <button onClick={prev} aria-label="Previous footer item" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", fontSize:"22px", padding:"0 8px", lineHeight:1, fontWeight:"300" }}>‹</button>
          <span style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#fff" }}>
            {item.isSponsor ? "★ SPONSORED" : item.isTrending ? "★ RECENT TRENDING SEARCHES" : "★ FUN FACTS"}
          </span>
          <button onClick={next} aria-label="Next footer item" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", fontSize:"22px", padding:"0 8px", lineHeight:1, fontWeight:"300" }}>›</button>
        </div>

        <div style={{ width:"100%", background:"#1e293b", border:"none", borderRadius:"0", padding:"10px 14px", display:"flex", alignItems:"center", gap:"12px", textAlign:"left", boxSizing:"border-box" }}>
          <button onClick={openItem} style={{ flex:1, minWidth:0, background:"transparent", border:"none", padding:0, cursor:"pointer", textAlign:"left" }}>
            <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#f8fafc", margin:"0", lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
              <span style={{ color:"#dc2626" }}>They say</span> {item.isSponsor ? item.teaser.replace(/^they say\s*/i, " ") : item.teaser.toLowerCase()}…
            </p>
          </button>
          <button
            onClick={openItem}
            onMouseEnter={()=>setButtonHover(true)}
            onMouseLeave={()=>setButtonHover(false)}
            aria-label="Open this WHOzTHEY result"
            className="whoz-submit-btn"
            style={{
              position:"relative",
              overflow:"hidden",
              flexShrink:0,
              padding:"7px 9px",
              background:buttonHover?"#dc2626":"#0f172a",
              border:buttonHover?"1px solid #fca5a5":"1px solid #475569",
              borderRadius:"9px",
              cursor:"pointer",
              boxShadow:buttonHover?"0 0 0 3px rgba(220,38,38,0.25)":"0 2px 0 rgba(0,0,0,0.4)",
              transition:"all 0.15s ease",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            <img src={buttonHover ? "/logo_blue_z.png" : "/logo.png"} alt="WHOzTHEY?" style={{ height:"36px", width:"auto", display:"block" }} />
          </button>
        </div>

        <div style={{ textAlign:"center", padding:"5px 8px 6px" }}>
          <span style={{ fontFamily:"system-ui", fontSize:"9px", color:"#64748b", letterSpacing:"0.08em" }}>
            © 2026 ARMS REACH Digital Agency
          </span>
        </div>
      </div>
    </footer>
  );
}

function SponsorResultPanel({ sponsor, onClear }) {
  if (!sponsor) return null;
  return (
    <section style={{ background:"#fff", borderBottom:"3px solid #e2e8f0" }}>
      <div style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0", padding:"20px 24px" }}>
        <div style={{ maxWidth:"760px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
          <div>
            <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:sponsor.accent, margin:"0 0 4px" }}>{sponsor.badge} · {sponsor.sponsor}</p>
            <h2 style={{ fontFamily:"'Georgia',serif", fontSize:"20px", fontWeight:"700", color:"#0f172a", margin:0, lineHeight:1.3 }}>
              <span style={{ color:"#dc2626" }}>They say</span> {sponsor.teaser.replace(/^they say\s*/i, " ")}
            </h2>
          </div>
          <button onClick={onClear} style={{ background:"none", border:"1px solid #cbd5e1", borderRadius:"4px", color:"#64748b", fontSize:"11px", fontFamily:"system-ui", padding:"3px 10px", cursor:"pointer", flexShrink:0 }}>Close ✕</button>
        </div>
      </div>
      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"24px" }}>
        <div style={{ background:"#0f172a", borderLeft:`4px solid ${sponsor.accent}`, borderRadius:"10px", padding:"22px", marginBottom:"18px" }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"18px", color:"#f8fafc", lineHeight:1.6, margin:"0 0 16px" }}>{sponsor.body}</p>
          <a href={sponsor.ctaUrl} target="_blank" rel="noopener" style={{ display:"inline-block", padding:"11px 18px", background:sponsor.accent, borderRadius:"7px", color:"#fff", textDecoration:"none", fontFamily:"system-ui", fontSize:"13px", fontWeight:"700" }}>
            {sponsor.cta}
          </a>
        </div>
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"16px 18px" }}>
          <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 8px" }}>Sponsor CTA Landing Area</h3>
          <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#475569", lineHeight:1.7, margin:0 }}>
            This is the middle-section sponsor result area. Each sponsor can use it as a pseudo landing page for a message, offer, form link, coupon, lead-generation CTA, or managed ARMS Reach campaign.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── MARKETPLACE TAB ───────────────────────────────────────────────────────────
function Marketplace() {
  return (
    <div style={{ minHeight:"70vh", background:"#fff" }}>
      <iframe
        title="WHOzTHEY ASB Store"
        src="https://asbshops.com/@b70491"
        style={{ width:"100%", height:"calc(100vh - 190px)", minHeight:"620px", border:"none", display:"block", background:"#fff" }}
      />
    </div>
  );
}

function _OldMarketplace_UNUSED() {
  return (
    <div style={{ minHeight:"60vh", padding:"32px 20px" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <p style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 8px" }}>WHOzTHEY? Store</p>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:"28px", fontWeight:"700", color:"#0f172a", margin:"0 0 8px" }}>Hello, I'm THEY.</h2>
          <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#64748b", margin:0 }}>Wear your title. Start the argument. Settle it with style.</p>
        </div>

        {/* Hero merch — Name Badge */}
        <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius:"12px", padding:"28px 24px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap" }}>
          <div style={{ background:"#fff", border:"3px solid #dc2626", borderRadius:"8px", padding:"16px 24px", textAlign:"center", minWidth:"160px" }}>
            <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", color:"#64748b", margin:"0 0 4px" }}>HELLO</p>
            <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#64748b", margin:"0 0 2px" }}>I'm</p>
            <p style={{ fontFamily:"'Georgia',serif", fontSize:"32px", fontWeight:"900", color:"#dc2626", margin:"0 0 6px", lineHeight:1 }}>THEY</p>
            <p style={{ fontFamily:"system-ui", fontSize:"8px", color:"#94a3b8", margin:0 }}>WHOzTHEY?.com</p>
          </div>
          <div style={{ flex:1, minWidth:"200px" }}>
            <span style={{ display:"inline-block", padding:"3px 10px", background:"#dc2626", borderRadius:"20px", fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", color:"#fff", marginBottom:"8px" }}>BESTSELLER</span>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:"22px", color:"#f8fafc", margin:"0 0 6px" }}>Hello, I'm THEY — Name Badge</h3>
            <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#94a3b8", margin:"0 0 12px", lineHeight:1.6 }}>The ultimate gag gift for every know-it-all in your life. You've been "they" this whole time. Own it.</p>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontFamily:"'Georgia',serif", fontSize:"24px", fontWeight:"700", color:"#f8fafc" }}>$4.99</span>
              <a href="https://printful.com" target="_blank" rel="noopener" style={{ padding:"10px 20px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"13px", fontWeight:"700", color:"#fff", textDecoration:"none", display:"inline-block" }}>Shop Now →</a>
            </div>
          </div>
        </div>

        {/* T-shirt showcase */}
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"24px", marginBottom:"24px" }}>
          <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 16px" }}>Featured Tee</p>
          <div style={{ display:"flex", gap:"20px", alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ background:"#0f172a", borderRadius:"8px", padding:"24px 20px", textAlign:"center", minWidth:"140px" }}>
              <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#64748b", margin:"0 0 2px" }}>HELLO</p>
              <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#64748b", margin:"0 0 2px" }}>I'm</p>
              <p style={{ fontFamily:"'Georgia',serif", fontSize:"28px", fontWeight:"900", color:"#dc2626", margin:"0", lineHeight:1 }}>THEY</p>
            </div>
            <div style={{ flex:1, minWidth:"180px" }}>
              <h3 style={{ fontFamily:"'Georgia',serif", fontSize:"20px", color:"#0f172a", margin:"0 0 6px" }}>"Hello, I'm THEY" T-Shirt</h3>
              <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#64748b", margin:"0 0 4px" }}>Available in S · M · L · XL · 2XL</p>
              <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#64748b", margin:"0 0 12px" }}>Black • White • Red</p>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:"22px", fontWeight:"700", color:"#0f172a" }}>$24.99</span>
                <a href="https://printful.com" target="_blank" rel="noopener" style={{ padding:"9px 18px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"13px", fontWeight:"700", color:"#fff", textDecoration:"none", display:"inline-block" }}>Order Now →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of merch grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:"14px" }}>
          {MERCH.slice(2).map(item=>(
            <div key={item.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"18px", display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:"28px", marginBottom:"10px" }}>{item.emoji}</div>
              {item.tag && <span style={{ display:"inline-block", padding:"2px 8px", background:item.tag==="NEW"?"#dc2626":"#d97706", color:"#fff", borderRadius:"4px", fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", marginBottom:"8px", alignSelf:"flex-start" }}>{item.tag}</span>}
              <h4 style={{ fontFamily:"'Georgia',serif", fontSize:"15px", fontWeight:"700", color:"#0f172a", margin:"0 0 6px" }}>{item.name}</h4>
              <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#64748b", lineHeight:"1.6", margin:"0 0 12px", flex:1 }}>{item.desc}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:"18px", fontWeight:"700", color:"#0f172a" }}>{item.price}</span>
                <a href={item.printful} target="_blank" rel="noopener" style={{ padding:"7px 14px", background:"#0f172a", border:"none", borderRadius:"6px", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#fff", textDecoration:"none" }}>Buy →</a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:"28px", padding:"20px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px" }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"16px", color:"#0f172a", margin:"0 0 4px" }}>Custom bulk orders for events, offices & family reunions?</p>
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#64748b", margin:"0 0 12px" }}>Nothing settles an argument like everyone wearing "Hello, I'm THEY" at Thanksgiving.</p>
          <a href="mailto:hello@whozthey.com" style={{ padding:"10px 24px", background:"#dc2626", border:"none", borderRadius:"6px", fontFamily:"system-ui", fontSize:"13px", fontWeight:"700", color:"#fff", textDecoration:"none", display:"inline-block" }}>Contact Us →</a>
        </div>
      </div>
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero({ onSearch, loading, persona, user, onLoginRequest, onQuizRequest, onStoreClick, onResetSearch }) {
  const [claim, setClaim] = useState("");
  const [submitHover, setSubmitHover] = useState(false);
  function submit() { if (claim.trim()&&!loading) onSearch(claim.trim()); }
  const p = persona ? PERSONAS[persona] : null;

  return (
    <header style={{ background:"#0f172a", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>

      {/* Row 1: "Type a claim..." + icons */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px 6px", gap:"8px" }}>
        <span style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#94a3b8", lineHeight:1.6 }}>
          Type a claim below<br/>to see who <span style={{ color:"#dc2626" }}>"they"</span> are
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          {/* Share */}
          <button onClick={()=>{ if(navigator.share) navigator.share({title:"WHOzTHEY?",url:"https://whozthey.com"}); else navigator.clipboard?.writeText("https://whozthey.com"); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"7px", color:"#64748b", letterSpacing:"0.04em" }}>Share</span>
          </button>
          {/* Reset */}
          <button onClick={()=>{ setClaim(""); onResetSearch?.(); }} title="Reset search" aria-label="Reset search" style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"7px", color:"#64748b", letterSpacing:"0.04em" }}>Reset</span>
          </button>
          {/* Store */}
          <button onClick={onStoreClick} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"7px", color:"#64748b", letterSpacing:"0.04em" }}>Store</span>
          </button>
          {/* Sign In / Profile */}
          <button onClick={user ? onLoginRequest : onLoginRequest} style={{ background:"none", border:"none", cursor:"pointer", color: p ? p.color : "#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            {p
              ? <span style={{ fontSize:"15px", lineHeight:1 }}>{p.emoji}</span>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            }
            <span style={{ fontFamily:"system-ui", fontSize:"7px", color:"#64748b", letterSpacing:"0.04em" }}>{user ? user.name.split(" ")[0] : "Sign In"}</span>
          </button>
        </div>
      </div>

      {/* Row 2: custom search input + WHOzTHEY submit button (same card treatment as the footer carousel row) */}
      <div style={{ padding:"6px 14px 10px" }}>
        <div style={{ width:"100%", background:"#1e293b", borderRadius:"8px", padding:"6px 10px", display:"flex", alignItems:"center", gap:"8px", boxSizing:"border-box" }}>
          <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", flexWrap:"wrap", gap:"3px 6px" }}>
            <span style={{ fontFamily:"system-ui", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#dc2626", fontSize:"10px", whiteSpace:"nowrap" }}>"they" say,</span>
            <input
              type="text" value={claim}
              autoFocus
              onChange={e=>setClaim(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}
              aria-label="Search a claim"
              style={{ flex:1, minWidth:"100px", padding:0, background:"transparent", border:"none", outline:"none", fontFamily:"system-ui", fontSize:"13px", color:"#f8fafc", caretColor:"#f8fafc" }}
            />
          </div>
          <button
            onClick={submit}
            disabled={loading||!claim.trim()}
            onMouseEnter={()=>setSubmitHover(true)}
            onMouseLeave={()=>setSubmitHover(false)}
            aria-label="Search WHOzTHEY?"
            className="whoz-submit-btn"
            style={{
              position:"relative",
              overflow:"hidden",
              flexShrink:0,
              padding:"5px 7px",
              background:submitHover&&!loading&&claim.trim()?"#dc2626":"#0f172a",
              border:submitHover&&!loading&&claim.trim()?"1px solid #fca5a5":"1px solid #475569",
              borderRadius:"8px",
              cursor:loading?"wait":claim.trim()?"pointer":"not-allowed",
              opacity:loading?0.55:1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              transition:"all 0.15s ease",
              boxShadow: submitHover&&!loading&&claim.trim() ? "0 0 0 3px rgba(220,38,38,0.25)" : "0 2px 0 rgba(0,0,0,0.4)",
            }}
          >
            {loading
              ? <span style={{ width:"16px", height:"16px", border:"2px solid #475569", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
              : <img src={submitHover&&!loading&&claim.trim() ? "/logo_blue_z.png" : "/logo.png"} alt="WHOzTHEY?" style={{ height:"30px", width:"auto", display:"block" }} />
            }
          </button>
        </div>
      </div>
    </header>
  );
}



function WelcomeState({ onSearch, onStoreClick }) {
  return (
    <div style={{ background:"#ffffff" }}>

      {/* Explainer: The Truth, Origin, and Curiosity Engine */}
      <div style={{ padding:"16px 16px 20px", maxWidth:"680px", margin:"0 auto" }}>
        <div style={{ borderRadius:"14px", overflow:"hidden", boxShadow:"0 4px 16px rgba(15,23,42,0.18)" }}>
          <img src="/explainer-engine.jpg" alt="The Truth, Origin, and Curiosity Engine — how WHOzTHEY? works in three steps" style={{ width:"100%", display:"block" }} />
        </div>
        {/* Video placeholder — swap for the explainer video embed when ready */}
        <div style={{ marginTop:"8px", textAlign:"center" }}>
          <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", letterSpacing:"0.04em" }}>
            🎬 Explainer video coming soon
          </span>
        </div>
      </div>

      {/* Swag Store promo */}
      <div style={{ background:"#0f172a", padding:"18px 16px 20px" }}>
        <div style={{ maxWidth:"680px", margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"16px" }}>
            <p style={{ fontFamily:"'Georgia',serif", fontSize:"13px", fontWeight:"700", color:"#dc2626", margin:0, lineHeight:1.35, flex:1, minWidth:0 }}>
              "THEY" SAY WHOzTHEY? SWAG CAN MAKE A GREAT GIFT FOR THE 'KNOWNIT ALL' IN YOUR LIFE!
            </p>
            <button onClick={onStoreClick} style={{ flexShrink:0, padding:"10px 14px", background:"#dc2626", border:"none", borderRadius:"8px", color:"#fff", fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.03em", cursor:"pointer", boxShadow:"0 2px 0 rgba(0,0,0,0.3)", whiteSpace:"nowrap" }}>
              SHOP OUR SWAG SHOP
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px" }}>
            {[
              { src:"/swag-hat-navy.jpg", alt:"WHOzTHEY? navy trucker hat" },
              { src:"/swag-hoodie-pink.jpg", alt:'"Hello I\'m THEY" pink hoodie' },
              { src:"/swag-hat-red-bs.jpg", alt:'"I Call Bullshit" red trucker hat' },
            ].map(item => (
              <button key={item.src} onClick={onStoreClick} style={{ background:"#fff", border:"none", borderRadius:"10px", padding:"6px", cursor:"pointer", overflow:"hidden" }}>
                <img src={item.src} alt={item.alt} style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", display:"block", borderRadius:"6px" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function LoadingAnswer({ query, stage }) {
  const [dot, setDot] = useState(".");
  useEffect(()=>{ const t=setInterval(()=>setDot(d=>d.length>=3?".":d+"."),500); return()=>clearInterval(t); },[]);
  return (
    <div style={{ padding:"60px 20px", textAlign:"center" }}>
      <div style={{ width:"36px", height:"36px", border:"3px solid #e2e8f0", borderTopColor:"#dc2626", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 20px" }} />
      <p style={{ fontFamily:"'Georgia',serif", fontSize:"16px", color:"#374151", margin:"0 0 6px" }}>{stage==="clarify"?"Checking the semantics":"Researching"} <em>"{query}"</em>{dot}</p>
      <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#94a3b8" }}>{stage==="clarify"?"Finding all the ways this could be interpreted…":"Tracing the origin. Finding out who 'they' really are."}</p>
    </div>
  );
}

function StickySearchBar({ onSearch, persona }) {
  const [claim, setClaim] = useState("");
  function submit() { if (claim.trim()) { onSearch(claim.trim()); setClaim(""); } }
  const p = persona ? PERSONAS[persona] : null;
  return (
    <div style={{ background:"#0f172a", position:"sticky", top:0, zIndex:50, borderBottom:"1px solid #1e293b" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"10px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
        {p&&<span style={{ fontSize:"18px", flexShrink:0 }}>{p.emoji}</span>}
        <span style={{ fontFamily:"'Georgia',serif", fontSize:"16px", fontWeight:"700", flexShrink:0 }}><BrandLabel light /></span>
        <div style={{ flex:1, display:"flex", background:"#1e293b", border:"1px solid #334155", borderRadius:"6px", overflow:"hidden" }}>
          <span style={{ fontFamily:"'Georgia',serif", fontSize:"12px", fontWeight:"700", color:"#dc2626", padding:"8px 0 8px 12px", whiteSpace:"nowrap", display:"flex", alignItems:"center" }}>They say…</span>
          <input type="text" value={claim} onChange={e=>setClaim(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="search another claim" style={{ flex:1, padding:"8px 10px", background:"transparent", border:"none", outline:"none", fontFamily:"system-ui", fontSize:"13px", color:"#f8fafc", minWidth:0 }} />
          <button onClick={submit} style={{ padding:"0 14px", background:"#dc2626", border:"none", cursor:"pointer", color:"#fff", whiteSpace:"nowrap", display:"flex", alignItems:"center" }}><BrandLabel light size="11px" /></button>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function WHOzTHEY() {
  const [screen, setScreen]           = useState("main");
  const [activeTab, setActiveTab]     = useState("search");
  const [persona, setPersona]         = useState(null);
  const [showPersona, setShowPersona] = useState(true);
  const [showQuiz, setShowQuiz]       = useState(false);
  const [badges, setBadges]           = useState([]);
  const [toastBadge, setToastBadge]   = useState(null);
  const [user, setUser]               = useState(null);
  const [showLogin, setShowLogin]     = useState(false);
  const [query, setQuery]             = useState("");
  const [answer, setAnswer]           = useState(null);
  const [clarification, setClarification] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingStage, setLoadingStage] = useState("clarify");
  const [error, setError]             = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [sessionId, setSessionId]     = useState(null);
  const answerRef                     = useRef(null);
  const handleSearchRef               = useRef(null);

  useEffect(() => {
    const key = "whozthey_session_id";
    let stored = window.localStorage.getItem(key);
    if (!stored) {
      stored = window.crypto?.randomUUID?.() || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(key, stored);
    }
    setSessionId(stored);

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, firebaseUser => {
      setUser(appUserFromFirebase(firebaseUser));
    });
  }, []);

  useEffect(() => {
    if (activeTab !== "search") return;
    if (!(loading || clarification || answer || error || selectedSponsor)) return;
    const t = setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 80);
    return () => clearTimeout(t);
  }, [activeTab, loading, clarification, answer, error, selectedSponsor]);

  function earnBadge(id) {
    if (badges.includes(id)) return;
    const badge = ALL_BADGES.find(b=>b.id===id);
    if (!badge) return;
    setBadges(prev=>[...prev,id]);
    setToastBadge(badge);
  }

  async function handleSearch(rawClaim) {
    setSelectedSponsor(null);
    setActiveTab("search");
    setAnswer(null); setClarification(null); setError(null);
    setQuery(rawClaim); setLoading(true); setLoadingStage("clarify");
    try {
      const clarify = await fetchClarification(rawClaim);
      if (clarify.needsClarification && clarify.versions?.length>1) {
        setClarification(clarify);
        setLoading(false);
        return;
      }
      await runSearch(rawClaim);
    } catch {
      await runSearch(rawClaim);
    }
  }

  async function runSearch(claim) {
    setLoading(true); setLoadingStage("research");
    const newCount = searchCount+1;
    setSearchCount(newCount);
    earnBadge("first_search");
    if (newCount>=3) earnBadge("streak_3");
    if (newCount>=5) earnBadge("five_searches");
    try { setAnswer(await fetchAnswer(claim, { sessionId, firebaseUid: user?.uid })); }
    catch { setError("They say the answer is out there — but we hit an error. Please try again."); }
    finally { setLoading(false); setClarification(null); }
  }

  function handleClarificationSelect(claim) {
    earnBadge("clarified");
    setClarification(null);
    setQuery(claim);
    runSearch(claim);
  }

  function handleClear() { setQuery(""); setAnswer(null); setError(null); setClarification(null); setSelectedSponsor(null); }

  function handleResetFromHeader() {
    setActiveTab("search");
    handleClear();
    setTimeout(() => window.scrollTo({ top:0, behavior:"smooth" }), 50);
  }

  function handleStoreClick() {
    window.open("https://asbshops.com/@b70491", "_blank", "noopener,noreferrer");
  }

  function handleSponsorSelect(sponsor) {
    setActiveTab("search");
    setSelectedSponsor(sponsor);
    setAnswer(null);
    setClarification(null);
    setError(null);
    setLoading(false);
  }

  // Keep ref and window global current on every render so external callers
  // (SponsorFooterBridge) always invoke the latest closure.
  handleSearchRef.current = handleSearch;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { window.__whoztheySearch = handleSearch; });

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <Hero onSearch={handleSearch} loading={loading} persona={persona} user={user} onLoginRequest={()=>setShowLogin(true)} onQuizRequest={()=>setShowQuiz(true)} onStoreClick={handleStoreClick} onResetSearch={handleResetFromHeader} />



      {activeTab==="search" && (
        <>
          {showPersona&&persona&&<PersonaBanner personaKey={persona} badges={badges} onDismiss={()=>setShowPersona(false)} />}
          <div ref={answerRef} style={{ scrollMarginTop:"190px" }}>
            {loading&&<LoadingAnswer query={query} stage={loadingStage} />}
            {error&&!loading&&(
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <p style={{ color:"#dc2626", fontFamily:"system-ui", fontSize:"14px" }}>{error}</p>
                <button onClick={handleClear} style={{ marginTop:"12px", padding:"8px 20px", background:"#dc2626", border:"none", borderRadius:"6px", color:"#fff", fontFamily:"system-ui", fontSize:"13px", cursor:"pointer" }}>Try again</button>
              </div>
            )}
            {clarification&&!loading&&(
              <TheySaidWhat clarification={clarification} onSelect={handleClarificationSelect} onSkip={()=>{ setClarification(null); runSearch(query); }} />
            )}
            {selectedSponsor&&!loading&&(
              <SponsorResultPanel sponsor={selectedSponsor} onClear={handleClear} />
            )}
            {answer&&!loading&&!selectedSponsor&&(
              <AnswerPanel query={query} answer={answer} onClear={handleClear} persona={persona} onBadgeEarned={earnBadge} user={user} onLoginRequest={()=>setShowLogin(true)} />
            )}
          </div>
          {!loading&&!answer&&!error&&!clarification&&!selectedSponsor&&<WelcomeState onSearch={handleSearch} onStoreClick={handleStoreClick} />}

        </>
      )}

      {activeTab==="marketplace" && <Marketplace />}


      {/* Sticky Footer Fun Facts */}
      <FunFactsSection onSearch={handleSearch} onSponsorSelect={handleSponsorSelect} onBadgeEarned={earnBadge} />

      {showLogin&&<LoginModal onClose={()=>setShowLogin(false)} currentUser={user} onLogin={u=>{ setUser(u); setShowPersona(true); }} onLogout={()=>{ setUser(null); }} />}
      {showQuiz&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#1e293b", borderRadius:"12px", padding:"8px", maxWidth:"480px", width:"100%", position:"relative" }}>
            <button onClick={()=>setShowQuiz(false)} style={{ position:"absolute", top:"12px", right:"12px", background:"none", border:"none", color:"#94a3b8", fontSize:"20px", cursor:"pointer", zIndex:1 }}>✕</button>
            <PersonalityQuiz onComplete={k=>{ setPersona(k); setShowQuiz(false); setShowPersona(true); }} onSkip={()=>setShowQuiz(false)} />
          </div>
        </div>
      )}
      {toastBadge&&<BadgeToast badge={toastBadge} onDone={()=>setToastBadge(null)} />}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes whoztheyShake{0%,88%,100%{transform:rotate(0deg)}90%{transform:rotate(-5deg)}92%{transform:rotate(5deg)}94%{transform:rotate(-4deg)}96%{transform:rotate(3deg)}98%{transform:rotate(0deg)}}
        @keyframes whoztheyShimmer{0%,70%{left:-60%}100%{left:160%}}
        .whoz-submit-btn{animation:whoztheyShake 5s ease-in-out infinite}
        .whoz-submit-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.5),transparent);transform:skewX(-20deg);animation:whoztheyShimmer 5s ease-in-out infinite;pointer-events:none}
        .whoz-submit-btn:disabled{animation:none}
        .whoz-submit-btn:disabled::after{animation:none;display:none}
      `}</style>
    </div>
  );
}
