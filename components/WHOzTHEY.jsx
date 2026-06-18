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
  { id:"fun_fact_fan",  emoji:"★",   label:"Trend Spotter", desc:"Opened a Recent Trending Search" },
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

// Only DB-backed sponsor cards have real uuid ids; the hardcoded SPONSOR_ADS
// fallback (used when /api/sponsor-cards is unreachable) uses plain ids like
// "s1" with nothing in Neon to join against, so tracking calls skip those.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── SPONSOR ADS — mixed into Fun Facts carousel ───────────────────────────────
const SPONSOR_ADS = [
  {
    id:"s1",
    isSponsor: true,
    sponsor: "Travel Protection Club",
    badge: "SPONSORED",
    badgeColor: "#0284c7",
    teaser: "They are giving golfers $75 ShipSticks Vouchers!",
    body: "WHOzTHEY? says CALL BS. The Travel Protection Club + ShipSticks gives you real protection for just $75 your first year.",
    cta: "Get Protected →",
    ctaUrl: "https://armsreach-global360.manus.space/",
    accent: "#0284c7",
    linkMode: "direct",
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
function buildCarousel(trending = [], sponsorAds = SPONSOR_ADS) {
  const ads = sponsorAds.length ? sponsorAds : SPONSOR_ADS;
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
      const ad = ads[Math.floor((i + 1) / 4 - 1) % ads.length];
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

async function fetchSponsorCards() {
  const res = await fetch("/api/sponsor-cards", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.sponsorCards) ? data.sponsorCards : [];
}

const VERDICT_MAP = {
  "ORIGIN TRACED":        { bg:"#f0fdf4", border:"#86efac", badge:"#16a34a", emoji:"📍", text:"Origin Traced" },
  "BOTH SIDES VALID":     { bg:"#f0f9ff", border:"#7dd3fc", badge:"#0284c7", emoji:"⚖️", text:"Both Sides Valid" },
  "TRADITIONAL WISDOM":   { bg:"#fffbeb", border:"#fde68a", badge:"#d97706", emoji:"🏡", text:"Traditional Wisdom" },
  "INSTITUTIONALLY PUSHED":{ bg:"#faf5ff", border:"#d8b4fe", badge:"#7c3aed", emoji:"🏛", text:"Institutionally Pushed" },
  "GENUINELY DISPUTED":   { bg:"#f8fafc", border:"#cbd5e1", badge:"#475569", emoji:"🤷", text:"Genuinely Disputed" },
  "LIGHTHEARTED MYTH":    { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", emoji:"🤥", text:"Lighthearted Myth" },
  // fallbacks for old verdicts
  TRUE:             { bg:"#f0fdf4", border:"#86efac", badge:"#16a34a", emoji:"📍", text:"Origin Traced" },
  FALSE:            { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", emoji:"🤥", text:"Lighthearted Myth" },
  "PARTIALLY TRUE": { bg:"#f0f9ff", border:"#7dd3fc", badge:"#0284c7", emoji:"⚖️", text:"Both Sides Valid" },
  MYTH:             { bg:"#fef2f2", border:"#fca5a5", badge:"#dc2626", emoji:"🤥", text:"Lighthearted Myth" },
  DISPUTED:         { bg:"#f8fafc", border:"#cbd5e1", badge:"#475569", emoji:"🤷", text:"Genuinely Disputed" },
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

// ── SHARE / SETTLE THE ARGUMENT BUTTON ───────────────────────────────────────
function buildShareUrl(claim) {
  if (typeof window === "undefined") return "https://whozthey.com";
  const url = new URL(window.location.origin + "/");
  url.searchParams.set("q", claim);
  return url.toString();
}

function ShareButton({ query, verdict, onBadgeEarned }) {
  const [copied, setCopied] = useState(false);
  function share() {
    const shareUrl = buildShareUrl(query);
    const text = `They say "${query}" — WHOzTHEY? verdict: ${verdict}. Settle the argument 👉 ${shareUrl}`;
    onBadgeEarned?.("settle_it");
    if (navigator.share) { navigator.share({ title:"WHOzTHEY?", text, url:shareUrl }).catch(()=>{}); }
    else { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  }
  return (
    <div style={{ background:"#0f172a", borderRadius:"8px", padding:"16px", textAlign:"center" }}>
      <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", color:"#f8fafc", margin:"0 0 10px" }}>Arguing about this with someone?</p>
      <button onClick={share} style={{ padding:"10px 24px", background:"#dc2626", border:"none", borderRadius:"6px", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>
        {copied ? "✓ Copied! Paste it anywhere" : "🕊️ Settle the Argument"}
      </button>
    </div>
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
async function fetchComments(claim) {
  const res = await fetch(`/api/comments?claim=${encodeURIComponent(claim)}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.comments) ? data.comments : [];
}

function relativeTime(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function CommentsSection({ claim, user, sessionId, onLoginRequest }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchComments(claim).then(rows => { if (alive) setComments(rows); });
    return () => { alive = false; };
  }, [claim]);

  async function submit() {
    if (!user) { onLoginRequest(); return; }
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, sessionId, firebaseUid: user.uid, displayName: user.name, text: newComment.trim() }),
      });
      const data = await res.json();
      if (data.ok) setComments(prev => [...prev, data.comment]);
      setNewComment("");
    } finally {
      setPosting(false);
    }
  }
  return (
    <div style={{ padding:"20px", maxWidth:"700px", margin:"0 auto" }}>
      <h3 style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 14px" }}>💬 The Debate Floor</h3>
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={user?"Share your story or challenge this answer…":"Sign in to join the debate…"} style={{ flex:1, padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:"6px", fontFamily:"system-ui", fontSize:"13px", color:"#0f172a", outline:"none", background:"#f8fafc" }} />
        <button onClick={submit} disabled={posting} style={{ padding:"0 16px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:posting?"wait":"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#fff", whiteSpace:"nowrap", opacity:posting?0.7:1 }}>
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
              <span style={{ fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#0f172a" }}>{c.name}</span>
              <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", marginLeft:"auto" }}>{relativeTime(c.createdAt)}</span>
            </div>
            <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#374151", lineHeight:"1.6", margin:0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DEBATE PANEL (VOTE TAB) ───────────────────────────────────────────────────
async function fetchVoteStats(claim) {
  const res = await fetch(`/api/vote?claim=${encodeURIComponent(claim)}`, { cache:"no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.ok ? data.stats : null;
}

async function postVote(claim, layer, choice, sessionId, firebaseUid) {
  const res = await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim, layer, choice, sessionId, firebaseUid }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.ok ? data.counts : null;
}

function VoteBars({ counts }) {
  if (!counts || counts.total === 0) {
    return <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8", margin:"4px 0 0" }}>Be the first to weigh in on this layer.</p>;
  }
  const rows = [
    { key:"sounds_good", label:"Sounds Good", color:"#16a34a" },
    { key:"call_bs", label:"I Call BS", color:"#dc2626" },
    { key:"no_clue", label:"No Clue", color:"#64748b" },
  ];
  return (
    <div style={{ marginTop:"6px", display:"flex", flexDirection:"column", gap:"4px" }}>
      {rows.map(r=>{
        const pct = Math.round((counts[r.key]/counts.total)*100) || 0;
        return (
          <div key={r.key} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontFamily:"system-ui", fontSize:"10px", color:"#64748b", width:"78px", flexShrink:0 }}>{r.label}</span>
            <div style={{ flex:1, height:"6px", background:"#e2e8f0", borderRadius:"4px", overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:r.color }} />
            </div>
            <span style={{ fontFamily:"system-ui", fontSize:"10px", color:"#94a3b8", width:"34px", textAlign:"right" }}>{pct}%</span>
          </div>
        );
      })}
      <span style={{ fontFamily:"system-ui", fontSize:"10px", color:"#94a3b8", marginTop:"2px" }}>{counts.total} vote{counts.total===1?"":"s"} so far</span>
    </div>
  );
}

function DebatePanel({ query, persona, onBadgeEarned, sessionId, user }) {
  const [votes, setVotes] = useState({ claim:null, origin:null, who:null });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchVoteStats(query).then(s => { if (alive) setStats(s); });
    return () => { alive = false; };
  }, [query]);

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

  async function vote(layer, side) {
    const next = { ...votes, [layer]:side };
    setVotes(next);
    if (layer==="claim"&&side==="call_bs") onBadgeEarned("first_callbs");
    if (layer==="claim"&&side==="sounds_good") onBadgeEarned("first_believe");
    if (next.claim&&next.origin&&next.who) onBadgeEarned("debate_all3");
    const counts = await postVote(query, layer, side, sessionId, user?.uid);
    if (counts) setStats(prev => ({ ...(prev||{}), [layer]:counts }));
  }

  const p = persona ? PERSONAS[persona] : null;

  return (
    <div style={{ background:"#f8fafc", borderTop:"1px solid #e2e8f0", padding:"14px 0" }}>
      <div style={{ width:"100%" }}>
        <p style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 10px" }}>⚡ Weigh In</p>
        {layers.map(layer=>{
          const myVote = votes[layer.key];
          const selected = options.find(o=>o.key===myVote);
          const counts = stats?.[layer.key];
          return (
            <div key={layer.key} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"10px 12px", marginBottom:"8px" }}>
              <p style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 3px" }}>{layer.label}</p>
              <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#374151", margin:"0 0 8px", lineHeight:1.3 }}>{layer.question}</p>
              {!myVote ? (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
                    {options.map(opt=>(
                      <button key={opt.key} onClick={()=>vote(layer.key,opt.key)} style={{ padding:"7px 4px", background:opt.bg, border:`1px solid ${opt.border}`, borderRadius:"6px", fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", color:opt.color, cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                  <VoteBars counts={counts} />
                </>
              ) : (
                <div style={{ background:selected.bg, border:`1px solid ${selected.border}`, borderRadius:"6px", padding:"8px 10px" }}>
                  <span style={{ fontFamily:"system-ui", fontSize:"12px", color:selected.color, fontWeight:"700" }}>You: {selected.label}{p?` · ${p.emoji} ${p.title}`:""}</span>
                  <VoteBars counts={counts} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ANSWER PANEL ──────────────────────────────────────────────────────────────
const RESULT_TABS = [
  { key:"origin",  label:"Origin",  icon:"origin" },
  { key:"sides",   label:"Sides",   icon:"sides" },
  { key:"spread",  label:"Spread",  icon:"spread" },
  { key:"vote",    label:"Vote",    icon:"vote" },
  { key:"debate",  label:"Debate",  icon:"debate" },
  { key:"sources", label:"Sources", icon:"sources" },
];

function TabIcon({ name, color }) {
  const common = { width:20, height:20, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round" };
  switch (name) {
    case "origin":
      return <svg {...common}><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "sides":
      return <svg {...common}><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
    case "spread":
      return <svg {...common}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
    case "vote":
      return <svg {...common}><path d="M9 11l3 3L22 4"/><path d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11"/></svg>;
    case "debate":
      return <svg {...common}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
    case "sources":
      return <svg {...common}><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>;
    default:
      return null;
  }
}

function AnswerPanel({ query, answer, persona, onBadgeEarned, user, onLoginRequest, sessionId, headerHeight, showExplainer, onStoreClick }) {
  const [activeTab, setActiveTab] = useState("origin");
  const sectionRef = useRef(null);
  if (!answer) return null;
  const verdictText = VERDICT_MAP[answer.verdict]?.text || answer.verdict || "Disputed";

  function selectTab(key) {
    setActiveTab(key);
    // Snap back to the top of this tab's content instead of leaving the
    // scroll position wherever the previous (possibly long) tab left it.
    // (The tab bar itself is sticky, so scrolling IT into view is a no-op
    // once it's already stuck — scroll the section's natural position instead.)
    const el = sectionRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior:"smooth" });
    }
  }

  return (
    <section ref={sectionRef} style={{ background:"#fff", borderBottom:"3px solid #e2e8f0" }}>
      <div style={{ position:"sticky", top:`${headerHeight}px`, zIndex:80, background:"#0f172a", borderBottom:"1px solid #1e293b", boxShadow:"0 2px 10px rgba(0,0,0,0.4)" }}>
        <div style={{ maxWidth:"760px", margin:"0 auto", display:"flex" }}>
          {RESULT_TABS.map(tab=>{
            const active = activeTab===tab.key;
            const color = active ? "#fff" : "#64748b";
            return (
              <button key={tab.key} onClick={()=>selectTab(tab.key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", padding:"8px 2px 7px", background:"none", border:"none", borderBottom:`2px solid ${active?"#dc2626":"transparent"}`, cursor:"pointer" }}>
                <TabIcon name={tab.icon} color={color} />
                <span style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.06em", textTransform:"uppercase", color }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"20px 24px", minHeight:"240px" }}>
        {activeTab==="origin" && (
          <>
            {showExplainer && (
              <div style={{ margin:"-20px -24px 24px" }}>
                <ExplainerFlipbook query={query} onStoreClick={onStoreClick} />
              </div>
            )}
            <div style={{ marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#dc2626", margin:"0 0 8px" }}>WHOzTHEY? — The Origin</h3>
              <p style={{ fontFamily:"system-ui", fontSize:"15px", color:"#1e293b", lineHeight:"1.75", margin:0, fontWeight:"500" }}>{answer.whoIsThey}</p>
            </div>
            <div style={{ marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 8px" }}>How It Started</h3>
              <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#1e293b", lineHeight:"1.75", margin:0 }}>{answer.origin}</p>
            </div>
            <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
          </>
        )}

        {activeTab==="sides" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"20px" }}>
              <div style={{ background:"#f0f9ff", border:"1px solid #7dd3fc", borderRadius:"8px", padding:"14px 16px" }}>
                <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#0284c7", margin:"0 0 6px" }}>👁 From This Side</h3>
                <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#0f172a", lineHeight:"1.65", margin:0 }}>{answer.traditionalView}</p>
              </div>
              <div style={{ background:"#f8fafc", border:"1px solid #cbd5e1", borderRadius:"8px", padding:"14px 16px" }}>
                <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569", margin:"0 0 6px" }}>👁 From That Side</h3>
                <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#0f172a", lineHeight:"1.65", margin:0 }}>{answer.modernView}</p>
              </div>
            </div>
            {answer.commonGround && (
              <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"8px", padding:"14px 16px", marginBottom:"20px" }}>
                <h3 style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#16a34a", margin:"0 0 6px" }}>🤝 Where Both Sides Agree</h3>
                <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#14532d", lineHeight:"1.65", margin:0 }}>{answer.commonGround}</p>
              </div>
            )}
            <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
          </>
        )}

        {activeTab==="spread" && (
          <>
            <div style={{ background:"#f8fafc", borderRadius:"8px", padding:"16px 20px", borderLeft:"3px solid #dc2626", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b", margin:"0 0 8px" }}>How It Spread</h3>
              <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#1e293b", lineHeight:"1.75", margin:0 }}>{answer.culturalSpread}</p>
            </div>
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"8px", padding:"16px 20px", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#d97706", margin:"0 0 6px" }}>★ They Also Say…</h3>
              <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#92400e", lineHeight:"1.7", margin:0 }}>{answer.funFact}</p>
            </div>
            <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
          </>
        )}

        {activeTab==="vote" && (
          <>
            <DebatePanel query={query} persona={persona} onBadgeEarned={onBadgeEarned} sessionId={sessionId} user={user} />
            <div style={{ marginTop:"20px" }}>
              <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
            </div>
          </>
        )}

        {activeTab==="debate" && (
          <>
            <CommentsSection claim={query} user={user} sessionId={sessionId} onLoginRequest={onLoginRequest} />
            <div style={{ marginTop:"4px" }}>
              <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
            </div>
          </>
        )}

        {activeTab==="sources" && (
          <>
            {answer.sources?.length>0 && (
              <div style={{ marginBottom:"20px" }}>
                <h3 style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 8px" }}>Sources</h3>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"4px" }}>
                  {answer.sources.map((src,i)=><li key={i} style={{ fontFamily:"system-ui", fontSize:"12px", color:"#475569", display:"flex", gap:"6px" }}><span style={{ color:"#dc2626" }}>▸</span>{src}</li>)}
                </ul>
              </div>
            )}
            <ShareButton query={query} verdict={verdictText} onBadgeEarned={onBadgeEarned} />
            <div style={{ textAlign:"center", padding:"16px 0 4px", borderTop:"1px solid #f1f5f9", marginTop:"20px" }}>
              <p style={{ fontFamily:"'Georgia',serif", fontSize:"13px", color:"#94a3b8", fontStyle:"italic", margin:0 }}>
                "WHOzTHEY? doesn't tell you what to think. We just find out who said it first."
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ── FUN FACTS + SPONSOR CAROUSEL ─────────────────────────────────────────────
function renderSponsorTeaser(text) {
  const match = text.match(/^(They)\b/i);
  if (!match) return text;
  return <><span style={{ color:"#dc2626" }}>{match[1]}</span>{text.slice(match[1].length)}</>;
}

function trackSponsor(type, item, sessionId, firebaseUid) {
  if (!UUID_RE.test(item?.id || "")) return;
  fetch("/api/sponsor-track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sponsorCardId: item.id, sessionId, firebaseUid, placement: "footer_carousel", destinationUrl: item.ctaUrl || null }),
  }).catch(() => {});
}

function FunFactsSection({ onSearch, onSponsorSelect, onBadgeEarned, refreshSignal, sessionId, firebaseUid }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [sponsorAds, setSponsorAds] = useState(SPONSOR_ADS);

  useEffect(() => {
    let alive = true;
    fetchRecentSearches()
      .then(rows => { if (alive) setTrendingSearches(rows); })
      .catch(() => { if (alive) setTrendingSearches([]); });
    return () => { alive = false; };
  }, [refreshSignal]);

  useEffect(() => {
    let alive = true;
    fetchSponsorCards()
      .then(cards => { if (alive && cards.length) setSponsorAds(cards); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const carouselItems = useMemo(() => buildCarousel(trendingSearches, sponsorAds), [trendingSearches, sponsorAds]);
  const item = carouselItems[current % carouselItems.length];
  const total = carouselItems.length;

  useEffect(() => {
    if (item?.isSponsor) trackSponsor("impression", item, sessionId, firebaseUid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

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
      trackSponsor("click", item, sessionId, firebaseUid);
      if (item.linkMode === "direct" && item.ctaUrl) {
        window.open(item.ctaUrl, "_blank", "noopener,noreferrer");
        return;
      }
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
            {item.isSponsor ? "★ SPONSORED" : "★ RECENT TRENDING SEARCHES"}
          </span>
          <button onClick={next} aria-label="Next footer item" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", fontSize:"22px", padding:"0 8px", lineHeight:1, fontWeight:"300" }}>›</button>
        </div>

        <div style={{ width:"100%", background:"#1e293b", border:"none", borderRadius:"0", padding:"10px 14px", display:"flex", alignItems:"center", gap:"12px", textAlign:"left", boxSizing:"border-box" }}>
          <button onClick={openItem} style={{ flex:1, minWidth:0, background:"transparent", border:"none", padding:0, cursor:"pointer", textAlign:"left" }}>
            <p style={{ fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#f8fafc", margin:"0", lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
              {item.isSponsor ? renderSponsorTeaser(item.teaser) : (<><span style={{ color:"#dc2626" }}>They say</span> {item.teaser.toLowerCase()}</>)}…
            </p>
          </button>
          <button
            onClick={openItem}
            aria-label="Open this WHOzTHEY result"
            className="whoz-submit-btn"
            style={{
              position:"relative",
              overflow:"hidden",
              flexShrink:0,
              padding:"7px 9px",
              background:"linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              border:"1px solid #334155",
              borderRadius:"9px",
              cursor:"pointer",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.45)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            <img src="/logo.png" alt="WHOzTHEY?" style={{ height:"36px", width:"auto", display:"block" }} />
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
              {renderSponsorTeaser(sponsor.teaser)}
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
function Hero({ onSearch, loading, persona, user, onLoginRequest, onQuizRequest, onStoreClick, onResetSearch, attract, query, verdict, onHeightChange }) {
  const [claim, setClaim] = useState("");
  const headerRef = useRef(null);
  useEffect(() => { setClaim(query || ""); }, [query]);
  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return;
    const el = headerRef.current;
    const report = () => onHeightChange(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);
  function submit() { if (claim.trim()&&!loading) onSearch(claim.trim()); }
  const p = persona ? PERSONAS[persona] : null;

  return (
    <header ref={headerRef} style={{ background:"#0f172a", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>

      {/* Row 1: "Type a claim..." + icons */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px 6px", gap:"8px" }}>
        <span style={{ fontFamily:"system-ui", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#f8fafc", lineHeight:1.15 }}>
          Type a claim below<br/>to see who <span style={{ color:"#dc2626" }}>"they"</span> are
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          {/* Personality Test */}
          <button onClick={onQuizRequest} title="Find your WHOzTHEY? personality" aria-label="Take the personality test" style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"7px", color:"#64748b", letterSpacing:"0.04em" }}>Quiz</span>
          </button>
          {/* Reset */}
          <button onClick={onResetSearch} title="Reset search" aria-label="Reset search" style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
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
        <div style={{ width:"100%", background:"#1e293b", borderRadius:"8px", padding:"8px 10px", display:"flex", alignItems:"flex-start", gap:"8px", boxSizing:"border-box" }}>
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"row", alignItems:"flex-start", gap:"4px" }}>
            <span style={{ fontFamily:"'Georgia',serif", fontWeight:"700", color:"#dc2626", fontSize:"13px", lineHeight:1.35, whiteSpace:"nowrap", flexShrink:0 }}>They say,</span>
            <textarea
              rows={2}
              value={claim}
              autoFocus
              onChange={e=>setClaim(e.target.value)}
              onKeyDown={e=>{ if (e.key==="Enter") { e.preventDefault(); submit(); } }}
              aria-label="Search a claim"
              style={{ flex:1, minWidth:0, padding:0, margin:0, background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"'Georgia',serif", fontWeight:"700", fontSize:"13px", lineHeight:1.35, color:"#f8fafc", caretColor:"#f8fafc" }}
            />
          </div>
          <button
            onClick={submit}
            disabled={loading||!claim.trim()}
            aria-label="Search WHOzTHEY?"
            className={attract&&!loading ? "whoz-submit-btn" : ""}
            style={{
              position:"relative",
              overflow:"hidden",
              flexShrink:0,
              padding:"5px 7px",
              background:"linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              border:"1px solid #334155",
              borderRadius:"9px",
              cursor:loading?"wait":claim.trim()?"pointer":"not-allowed",
              opacity:loading?0.55:1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.45)",
            }}
          >
            {verdict ? (
              <span role="img" aria-label={verdict.text} title={verdict.text} style={{ fontSize:"24px", lineHeight:1, display:"block" }}>{verdict.emoji}</span>
            ) : (
              <img src="/logo.png" alt="WHOzTHEY?" style={{ height:"30px", width:"auto", display:"block" }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}



const EXPLAINER_SLIDE_COUNT = 13;
const BRAND_CREAM = "#f9f3e9";
const BRAND_NAVY = "#131720";
const BRAND_RED = "#dc2626";

const EXPLAINER_STORE_SLIDE = 11; // the "Wear your curiosity" merch slide

function ExplainerFlipbook({ query, onStoreClick }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const goTo = (i) => setIndex(Math.max(0, Math.min(EXPLAINER_SLIDE_COUNT - 1, i)));
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  return (
    <div>
      {/* "WHOzTHEY?" speech-bubble frame around the slide */}
      <div style={{ position:"relative", padding:"0 30px 30px" }}>
        <div
          style={{ position:"relative", background:BRAND_CREAM, borderRadius:"28px", padding:"10px", boxShadow:"0 10px 28px rgba(0,0,0,0.4)" }}
          onTouchStart={(e)=>{ touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e)=>{
            if (touchStartX.current == null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (delta < -40) next();
            else if (delta > 40) prev();
            touchStartX.current = null;
          }}
        >
          {/* speech-bubble tail */}
          <div style={{ position:"absolute", left:"34px", bottom:"-16px", width:0, height:0, borderRight:"22px solid transparent", borderTop:`20px solid ${BRAND_CREAM}` }} />

          <div style={{ position:"relative", borderRadius:"20px", overflow:"hidden", background:BRAND_NAVY, aspectRatio:"1376/768", display:"flex", flexDirection:"column" }}>
            {index === 0 && query && (
              <p style={{ flexShrink:0, fontFamily:"'Georgia',serif", fontWeight:"700", fontSize:"12px", color:BRAND_CREAM, lineHeight:1.4, textAlign:"center", margin:0, padding:"10px 20px 2px" }}>
                <span style={{ color:BRAND_RED }}>They say,</span> {query}
              </p>
            )}
            <img
              src={index === 0 ? "/explainer-slides/slide-01-logo.jpg" : `/explainer-slides/slide-${String(index + 1).padStart(2, "0")}.jpg`}
              alt={`WHOzTHEY? explainer slide ${index + 1} of ${EXPLAINER_SLIDE_COUNT}`}
              style={{ width:"100%", flex:1, minHeight:0, display:"block", objectFit:"contain" }}
            />
            <button
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous slide"
              style={{ position:"absolute", top:"50%", left:"8px", transform:"translateY(-50%)", width:"30px", height:"30px", borderRadius:"50%", border:"none", background:"rgba(15,23,42,0.55)", color:"#fff", fontSize:"16px", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, display:"flex", alignItems:"center", justifyContent:"center" }}
            >
              ‹
            </button>
            <button
              onClick={next}
              disabled={index === EXPLAINER_SLIDE_COUNT - 1}
              aria-label="Next slide"
              style={{ position:"absolute", top:"50%", right:"8px", transform:"translateY(-50%)", width:"30px", height:"30px", borderRadius:"50%", border:"none", background:"rgba(15,23,42,0.55)", color:"#fff", fontSize:"16px", cursor: index === EXPLAINER_SLIDE_COUNT - 1 ? "default" : "pointer", opacity: index === EXPLAINER_SLIDE_COUNT - 1 ? 0.3 : 1, display:"flex", alignItems:"center", justifyContent:"center" }}
            >
              ›
            </button>
            {index === EXPLAINER_STORE_SLIDE - 1 && onStoreClick && (
              <button
                onClick={onStoreClick}
                aria-label="Shop the WHOzTHEY? swag store"
                style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", padding:"9px 18px", background:BRAND_RED, border:"none", borderRadius:"20px", color:"#fff", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", letterSpacing:"0.03em", cursor:"pointer", boxShadow:"0 4px 14px rgba(220,38,38,0.55)", whiteSpace:"nowrap" }}
              >
                Shop our swag shop →
              </button>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily:"var(--font-anton)", fontWeight:"400", fontSize:"19px", textAlign:"center", color:BRAND_NAVY, margin:"0 0 16px", letterSpacing:"0.01em", textTransform:"uppercase" }}>
        Tracing the origins of<br />everything <span style={{ color:BRAND_RED }}>"They"</span> ever said.
      </h2>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
        {Array.from({ length: EXPLAINER_SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={()=>goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{ width: i === index ? "18px" : "6px", height:"6px", borderRadius:"3px", border:"none", background: i === index ? BRAND_RED : "rgba(19,23,32,0.2)", cursor:"pointer", padding:0, transition:"width 0.15s" }}
          />
        ))}
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

// ── DEFAULT "ORIGIN" CLAIM — WHOzTHEY? explaining itself, shown on first load ──
const DEFAULT_QUERY = 'there\'s a new website that you can ask who "they" are whenever you hear someone say, "They say..." and it will research the claim for you';
const DEFAULT_ANSWER = {
  verdict: "ORIGIN TRACED",
  whoIsThey: 'In this case, \'They\' is WHOzTHEY? — a website built on the idea that \'They say...\' claims deserve a real investigation. The creators are the curious minds behind this very page you\'re reading right now. For once, \'They\' showed up and identified themselves.',
  origin: 'WHOzTHEY? was born from a simple frustration: people repeat claims constantly without knowing where they came from, and nobody ever stops to ask who \'they\' actually are. The site launched with the mission of tracing folk sayings, old wives\' tales, and handed-down wisdom back to their real origins — names, eras, and cultures included. It may be the first site dedicated entirely to unmasking the mysterious \'they\' behind everyday claims.',
  traditionalView: 'Before WHOzTHEY?, when someone said "They say..." the conversation usually ended in a shrug, a Google rabbit hole, or a family argument with no real resolution.',
  modernView: 'Now you can type the claim straight into WHOzTHEY? and get a traced origin, the cultural context, and a verdict — no more vague "they".',
  commonGround: 'Either way, everyone agrees: somebody should finally be held accountable for everything "they" supposedly said.',
  culturalSpread: 'WHOzTHEY? spread the way most claims do — word of mouth, a few dinner-table debates settled on the spot, and people sharing their results with whoever they were arguing with.',
  funFact: 'WHOzTHEY? may be the first site dedicated entirely to unmasking the mysterious "they" behind everyday claims.',
  sources: ["WHOzTHEY? — About the Project", "Built by ARMS Reach Digital Agency"],
};

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
  const [query, setQuery]             = useState(DEFAULT_QUERY);
  const [answer, setAnswer]           = useState(DEFAULT_ANSWER);
  const [isDefault, setIsDefault]     = useState(true);
  const [clarification, setClarification] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingStage, setLoadingStage] = useState("clarify");
  const [error, setError]             = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(110);
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

    fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: stored, source: "web" }),
    }).catch(() => {});

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, firebaseUser => {
      setUser(appUserFromFirebase(firebaseUser));
    });
  }, []);

  // Re-sync the visitor record whenever we learn more about who they are
  // (signed in, or picked a persona) and restore any badges already earned
  // on this session/account so the UI doesn't think they're starting fresh.
  useEffect(() => {
    if (!sessionId) return;
    fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, firebaseUid: user?.uid, email: user?.email, displayName: user?.name, persona, source: "web" }),
    }).catch(() => {});

    const params = new URLSearchParams({ sessionId });
    if (user?.uid) params.set("firebaseUid", user.uid);
    fetch(`/api/badges?${params.toString()}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.badgeIds?.length) {
          setBadges(prev => Array.from(new Set([...prev, ...data.badgeIds])));
        }
      })
      .catch(() => {});
  }, [sessionId, user?.uid, persona]);

  // Deep link: a shared result URL like /?q=claim opens straight into that result.
  useEffect(() => {
    const sharedClaim = new URLSearchParams(window.location.search).get("q");
    if (sharedClaim && sharedClaim.trim()) handleSearch(sharedClaim.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "search") return;
    if (!(loading || clarification || (answer && !isDefault) || error || selectedSponsor)) return;
    const t = setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 80);
    return () => clearTimeout(t);
  }, [activeTab, loading, clarification, answer, error, selectedSponsor, isDefault]);

  function earnBadge(id) {
    if (badges.includes(id)) return;
    const badge = ALL_BADGES.find(b=>b.id===id);
    if (!badge) return;
    setBadges(prev=>[...prev,id]);
    setToastBadge(badge);
    fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId: id, sessionId, firebaseUid: user?.uid }),
    }).catch(() => {});
  }

  async function handleSearch(rawClaim) {
    setSelectedSponsor(null);
    setActiveTab("search");
    setIsDefault(false);
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
    try {
      setAnswer(await fetchAnswer(claim, { sessionId, firebaseUid: user?.uid }));
      const url = new URL(window.location.href);
      url.searchParams.set("q", claim);
      window.history.replaceState(null, "", url.toString());
    }
    catch { setError("They say the answer is out there — but we hit an error. Please try again."); }
    finally { setLoading(false); setClarification(null); }
  }

  function handleClarificationSelect(claim) {
    earnBadge("clarified");
    setClarification(null);
    setQuery(claim);
    runSearch(claim);
  }

  function handleClear() {
    setQuery(DEFAULT_QUERY); setAnswer(DEFAULT_ANSWER); setError(null); setClarification(null); setSelectedSponsor(null);
    setIsDefault(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }

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

  const isWelcome = isDefault&&!loading&&!error&&!clarification&&!selectedSponsor;
  const verdict = answer&&!loading&&!isDefault ? (VERDICT_MAP[answer.verdict] || VERDICT_MAP.DISPUTED) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <Hero onSearch={handleSearch} loading={loading} persona={persona} user={user} onLoginRequest={()=>setShowLogin(true)} onQuizRequest={()=>setShowQuiz(true)} onStoreClick={handleStoreClick} onResetSearch={handleResetFromHeader} attract={isWelcome} query={isDefault ? "" : query} verdict={verdict} onHeightChange={setHeaderHeight} />



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
              <AnswerPanel query={query} answer={answer} persona={persona} onBadgeEarned={earnBadge} user={user} onLoginRequest={()=>setShowLogin(true)} headerHeight={headerHeight} sessionId={sessionId} showExplainer={isDefault} onStoreClick={handleStoreClick} />
            )}
          </div>

        </>
      )}

      {activeTab==="marketplace" && <Marketplace />}


      {/* Sticky Footer Fun Facts */}
      <FunFactsSection onSearch={handleSearch} onSponsorSelect={handleSponsorSelect} onBadgeEarned={earnBadge} refreshSignal={searchCount} sessionId={sessionId} firebaseUid={user?.uid} />

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
