'use client'

import { useState, useEffect, useRef } from "react";

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

// Interleave sponsor ads every 4 fact cards
function buildCarousel() {
  const items = [];
  SEED_FACTS.forEach((fact, i) => {
    items.push({ isSponsor: false, teaser: fact, id: `f${i}` });
    if ((i + 1) % 4 === 0) {
      const ad = SPONSOR_ADS[Math.floor((i + 1) / 4 - 1) % SPONSOR_ADS.length];
      items.push(ad);
    }
  });
  return items;
}
const CAROUSEL_ITEMS = buildCarousel();

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

async function fetchAnswer(claim) {
  // SECURE: API key lives on the server in /api/search — never in the browser
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
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

// ── FIREBASE LOGIN MOCK ───────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  function handleSubmit() {
    if (!email.trim()) return;
    onLogin({ email:email.trim(), name:name.trim()||email.split("@")[0], uid:"user_"+Date.now() });
    onClose();
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", padding:"28px 24px", width:"100%", maxWidth:"380px" }}>
        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <Wordmark size={28} />
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#94a3b8", marginTop:"8px" }}>Sign in to comment & join the debate</p>
        </div>
        <div style={{ display:"flex", gap:"0", marginBottom:"20px", border:"1px solid #334155", borderRadius:"6px", overflow:"hidden" }}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"8px", background:mode===m?"#dc2626":"transparent", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:mode===m?"#fff":"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>{m==="login"?"Sign In":"Sign Up"}</button>
          ))}
        </div>
        {mode==="signup" && (
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ width:"100%", padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", fontFamily:"system-ui", fontSize:"14px", color:"#f8fafc", outline:"none", marginBottom:"10px", boxSizing:"border-box" }} />
        )}
        <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Email address" type="email" style={{ width:"100%", padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", fontFamily:"system-ui", fontSize:"14px", color:"#f8fafc", outline:"none", marginBottom:"14px", boxSizing:"border-box" }} />
        <button onClick={handleSubmit} style={{ width:"100%", padding:"12px", background:"#dc2626", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"'Georgia',serif", fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"10px" }}>
          {mode==="login"?"Sign In →":"Create Account →"}
        </button>
        <div style={{ textAlign:"center", marginBottom:"14px" }}>
          <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#475569" }}>or continue with</span>
        </div>
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
          {["Google","Facebook"].map(p=>(
            <button key={p} onClick={()=>{ onLogin({ email:`user@${p.toLowerCase()}.com`, name:`${p} User`, uid:"user_"+Date.now() }); onClose(); }} style={{ flex:1, padding:"9px", background:"#0f172a", border:"1px solid #334155", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#cbd5e1", fontWeight:"600" }}>
              {p==="Google"?"🔵":"📘"} {p}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", fontFamily:"system-ui", fontSize:"12px", color:"#475569" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── COMMENTS ──────────────────────────────────────────────────────────────────
function CommentsSection({ claim, user, onLoginRequest }) {
  const [comments, setComments] = useState([
    { id:1, name:"Sarah K.", emoji:"🔥", text:"My grandmother said this every single winter. Turns out she was wrong but I still love her for it.", time:"2h ago" },
    { id:2, name:"Marcus T.", emoji:"🏆", text:"I called this out at Thanksgiving and nobody believed me until I showed them WHOzTHEY?", time:"5h ago" },
  ]);
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
  const layers = [
    { key:"claim",  label:"THE CLAIM",    question:`They say "${query.length>40?query.slice(0,40)+"…":query}" — do you believe it?`, yes:"BELIEVE IT", no:"CALL BS" },
    { key:"origin", label:"THE ORIGIN",   question:"Is the origin story WHOzTHEY? found accurate?", yes:"ACCURATE", no:"DISPUTED" },
    { key:"who",    label:'WHO IS "THEY"?', question:"Is the identity of 'they' correctly identified?", yes:"CONFIRMED", no:"WRONG" },
  ];
  const COMMUNITY = {
    claim:  answer.verdict==="TRUE"?{yes:72,no:28}:answer.verdict==="FALSE"?{yes:31,no:69}:{yes:54,no:46},
    origin: {yes:61,no:39}, who:{yes:58,no:42},
  };
  function vote(layer, side) {
    const next = { ...votes, [layer]:side };
    setVotes(next);
    if (layer==="claim"&&side==="no") onBadgeEarned("first_callbs");
    if (layer==="claim"&&side==="yes") onBadgeEarned("first_believe");
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
          const comm = COMMUNITY[layer.key];
          return (
            <div key={layer.key} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"14px 16px", marginBottom:"10px" }}>
              <p style={{ fontFamily:"system-ui", fontSize:"9px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", margin:"0 0 4px" }}>{layer.label}</p>
              <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#374151", margin:"0 0 12px" }}>{layer.question}</p>
              {!myVote ? (
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>vote(layer.key,"yes")} style={{ flex:1, padding:"9px", background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"6px", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#16a34a", cursor:"pointer" }}>✓ {layer.yes}</button>
                  <button onClick={()=>vote(layer.key,"no")} style={{ flex:1, padding:"9px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"6px", fontFamily:"system-ui", fontSize:"12px", fontWeight:"700", color:"#dc2626", cursor:"pointer" }}>✗ {layer.no}</button>
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                    <span style={{ fontFamily:"system-ui", fontSize:"11px", color:myVote==="yes"?"#16a34a":"#dc2626", fontWeight:"700" }}>You: {myVote==="yes"?layer.yes:layer.no}{p?` · ${p.emoji} ${p.title}`:""}</span>
                    <span style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8" }}>Community</span>
                  </div>
                  {[{pct:comm.yes,label:layer.yes,color:"#16a34a"},{pct:comm.no,label:layer.no,color:"#dc2626"}].map(bar=>(
                    <div key={bar.label} style={{ marginBottom:"4px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
                        <span style={{ fontFamily:"system-ui", fontSize:"10px", color:bar.color }}>{bar.label}</span>
                        <span style={{ fontFamily:"system-ui", fontSize:"10px", color:bar.color, fontWeight:"700" }}>{bar.pct}%</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:"4px", height:"6px", overflow:"hidden" }}>
                        <div style={{ width:`${bar.pct}%`, height:"100%", background:bar.color, borderRadius:"4px", transition:"width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
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
function FunFactsSection({ onSearch, onBadgeEarned }) {
  const [current, setCurrent] = useState(0);
  const [factAnswer, setFactAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const item = CAROUSEL_ITEMS[current];
  const total = CAROUSEL_ITEMS.length;

  // Auto-rotate every 3 seconds unless paused (user interacting)
  useEffect(() => {
    if (paused || loading) return;
    const t = setInterval(() => {
      setFactAnswer(null);
      setCurrent(c => (c + 1) % total);
    }, 10000);
    return () => clearInterval(t);
  }, [paused, loading, total]);

  async function reveal() {
    if (item.isSponsor) return;
    setLoading(true); setFactAnswer(null);
    try { const r=await fetchAnswer(item.teaser); setFactAnswer(r); onBadgeEarned("fun_fact_fan"); }
    catch { setFactAnswer({ verdict:"DISPUTED", whoIsThey:"We couldn't retrieve that right now.", sources:[] }); }
    finally { setLoading(false); }
  }
  function goTo(i) { setCurrent(i); setFactAnswer(null); setPaused(true); setTimeout(()=>setPaused(false), 8000); }
  function prev() { goTo((current-1+total)%total); }
  function next() { goTo((current+1)%total); }

  return (
    <footer style={{ background:"#dc2626", position:"sticky", bottom:0, zIndex:40, boxShadow:"0 -4px 16px rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth:"760px", margin:"0 auto" }}>
        {/* Red header bar with FUN FACTS label and arrows */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 12px" }}>
          <button onClick={prev} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", fontSize:"22px", padding:"0 8px", lineHeight:1, fontWeight:"300" }}>‹</button>
          <span style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", textTransform:"uppercase", color:"#fff" }}>
            {item.isSponsor ? "★ SPONSORED" : "★ FUN FACTS"}
          </span>
          <button onClick={next} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", fontSize:"22px", padding:"0 8px", lineHeight:1, fontWeight:"300" }}>›</button>
        </div>

        {/* Card */}
        {item.isSponsor ? (
          /* ── SPONSOR CARD ── */
          <div style={{ background:"rgba(255,255,255,0.95)", borderRadius:"0", padding:"8px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"inline-block", padding:"1px 6px", background:item.accent, color:"#fff", borderRadius:"4px", fontFamily:"system-ui", fontSize:"8px", fontWeight:"700", letterSpacing:"0.08em", marginBottom:"4px" }}>
                AD · {item.sponsor}
              </span>
              <p style={{ fontFamily:"'Georgia',serif", fontSize:"13px", fontWeight:"700", color:"#0f172a", margin:"0", lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                <span style={{ color:"#dc2626" }}>They say</span> {item.teaser.replace(/^they say\s*/i,"")}
              </p>
            </div>
            <a href={item.ctaUrl} target="_blank" rel="noopener" style={{
              flexShrink:0, padding:"8px 12px",
              background:item.accent, color:"#fff", borderRadius:"6px",
              fontFamily:"system-ui", fontSize:"11px", fontWeight:"700",
              textDecoration:"none", whiteSpace:"nowrap",
            }}>
              {item.cta}
            </a>
          </div>
        ) : (
          /* ── FACT CARD ── */
          <div style={{ background:"rgba(255,255,255,0.95)", borderRadius:"0", padding:"8px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:"'Georgia',serif", fontSize:"13px", fontWeight:"700", color:"#0f172a", margin:0, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                <span style={{ color:"#dc2626" }}>They say</span> {item.teaser.toLowerCase()}…
              </p>
              {factAnswer&&!loading&&(
                <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#92400e", margin:"4px 0 0", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {factAnswer.whoIsThey}
                </p>
              )}
            </div>
            {!factAnswer&&!loading&&(
              <button onClick={reveal} style={{ flexShrink:0, padding:"4px 8px", background:"#0f172a", border:"none", borderRadius:"6px", cursor:"pointer", display:"flex", alignItems:"center" }}>
                <img src="/logo.png" alt="WHOzTHEY?" style={{ height:"28px", width:"auto" }} />
              </button>
            )}
            {loading&&<div style={{ flexShrink:0, width:"16px", height:"16px", border:"2px solid #fde68a", borderTopColor:"#dc2626", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />}
            {factAnswer&&!loading&&(
              <button onClick={()=>onSearch(item.teaser)} style={{ flexShrink:0, padding:"8px 12px", background:"#d97706", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", color:"#fff", whiteSpace:"nowrap" }}>
                Full ↗
              </button>
            )}
          </div>
        )}

        {/* Counter */}
        <div style={{ textAlign:"center", paddingBottom:"4px" }}>
          <span style={{ fontFamily:"system-ui", fontSize:"9px", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em" }}>
            {current+1} of {total}
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── MARKETPLACE TAB ───────────────────────────────────────────────────────────
function Marketplace() {
  return (
    <div style={{ minHeight:"60vh", padding:"32px 20px", textAlign:"center" }}>
      <div style={{ maxWidth:"600px", margin:"0 auto" }}>

        {/* Logo */}
        <img src="/logo.png" alt="WHOzTHEY?" style={{ height:"120px", width:"auto", margin:"0 auto 20px", display:"block" }} />

        <h2 style={{ fontFamily:"'Georgia',serif", fontSize:"26px", fontWeight:"700", color:"#0f172a", margin:"0 0 10px" }}>
          Hello, I'm <span style={{ color:"#dc2626" }}>THEY.</span>
        </h2>
        <p style={{ fontFamily:"system-ui", fontSize:"14px", color:"#64748b", lineHeight:"1.7", margin:"0 0 24px" }}>
          Wear your title. Start the argument. Settle it with style.<br/>
          T-shirts, hoodies, hats, mugs, bags, polos and more —<br/>
          all branded with the WHOzTHEY? you know and love.
        </p>

        {/* Featured products preview */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"28px" }}>
          {[
            { label:"T-Shirts", emoji:"👕", price:"From $17.95" },
            { label:"Hoodies", emoji:"🧥", price:"From $33.95" },
            { label:"Hats", emoji:"🧢", price:"From $24.95" },
            { label:"Mugs", emoji:"☕", price:"From $16.95" },
            { label:"Bags", emoji:"👜", price:"From $50.95" },
            { label:"& More", emoji:"🎁", price:"Kids, Polos..." },
          ].map(p=>(
            <div key={p.label} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"12px 8px" }}>
              <div style={{ fontSize:"24px", marginBottom:"4px" }}>{p.emoji}</div>
              <div style={{ fontFamily:"system-ui", fontSize:"11px", fontWeight:"700", color:"#0f172a" }}>{p.label}</div>
              <div style={{ fontFamily:"system-ui", fontSize:"10px", color:"#64748b" }}>{p.price}</div>
            </div>
          ))}
        </div>

        {/* Big CTA */}
        <a
          href="https://asbshops.com/@b70491"
          target="_blank"
          rel="noopener"
          style={{
            display:"inline-block", width:"100%", padding:"18px",
            background:"#dc2626", borderRadius:"10px", boxSizing:"border-box",
            fontFamily:"'Georgia',serif", fontSize:"18px", fontWeight:"700",
            color:"#fff", textDecoration:"none", marginBottom:"14px",
          }}
        >
          🛒 Shop the WHOzTHEY? Store →
        </a>

        <p style={{ fontFamily:"system-ui", fontSize:"11px", color:"#94a3b8" }}>
          Powered by ASB · American Solutions for Business<br/>
          Fast 1–2 day printing · Direct shipping · No minimum order
        </p>

        {/* Gag gift callout */}
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px", padding:"16px", marginTop:"24px" }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"15px", color:"#0f172a", margin:"0 0 4px" }}>
            Looking for the perfect gag gift?
          </p>
          <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#64748b", margin:"0 0 12px" }}>
            The "Hello, I'm THEY" name badge is the ultimate gift for every know-it-all in your life.
          </p>
          <a href="https://asbshops.com/@b70491" target="_blank" rel="noopener" style={{ fontFamily:"system-ui", fontSize:"13px", fontWeight:"700", color:"#dc2626", textDecoration:"none" }}>
            Get the badge →
          </a>
        </div>

      </div>
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
function Hero({ onSearch, loading, persona, user, onLoginRequest, onQuizRequest, onStoreClick }) {
  const [claim, setClaim] = useState("");
  function submit() { if (claim.trim()&&!loading) onSearch(claim.trim()); }
  const p = persona ? PERSONAS[persona] : null;
  return (
    <header style={{ background:"linear-gradient(160deg,#0f172a 0%,#1e293b 100%)", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.4)" }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px 0" }}>
        {/* Logo */}
        <div style={{ flex:1 }}>
          <Wordmark size={36} />
        </div>
        {/* Icon bar top right */}
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          {/* Share */}
          <button onClick={()=>{ if(navigator.share) navigator.share({title:"WHOzTHEY?",url:"https://whozthey.com"}); else navigator.clipboard?.writeText("https://whozthey.com"); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"8px", color:"#64748b" }}>Share</span>
          </button>
          {/* Store */}
          <button onClick={onStoreClick} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span style={{ fontFamily:"system-ui", fontSize:"8px", color:"#64748b" }}>Store</span>
          </button>
          {/* Quiz / Profile */}
          <button onClick={user ? onLoginRequest : onQuizRequest} style={{ background:"none", border:"none", cursor:"pointer", color: p ? p.color : "#94a3b8", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
            {p
              ? <span style={{ fontSize:"20px" }}>{p.emoji}</span>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            }
            <span style={{ fontFamily:"system-ui", fontSize:"8px", color:"#64748b" }}>{user ? user.name.split(" ")[0] : "Sign In"}</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding:"10px 16px 14px" }}>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:"12px", fontWeight:"700", color:"#dc2626", margin:"0 0 5px" }}>They say…</p>
        <div style={{ display:"flex", background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.4)" }}>
          <input
            type="text" value={claim}
            onChange={e=>setClaim(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="What did you hear?"
            style={{ flex:1, padding:"12px 14px", background:"transparent", border:"none", outline:"none", fontFamily:"system-ui", fontSize:"15px", color:"#f8fafc", minWidth:0 }}
          />
          <button onClick={submit} disabled={loading||!claim.trim()} style={{ flexShrink:0, padding:"0 16px", background:loading?"#7f1d1d":"#dc2626", border:"none", cursor:loading?"wait":"pointer", display:"flex", alignItems:"center" }}>
            {loading
              ? <span style={{ width:"16px", height:"16px", border:"2px solid #fca5a5", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
              : <img src="/logo.png" alt="WHOzTHEY?" style={{ height:"32px", width:"auto" }} />
            }
          </button>
        </div>
      </div>
    </header>
  );
}

function WelcomeState({ onSearch }) {
  const ex = ["cracking knuckles causes arthritis","you only use 10% of your brain","wait 30 min after eating to swim","carrots improve your eyesight","lightning never strikes the same place twice","hair grows back thicker after shaving"];
  return (
    <div style={{ padding:"40px 20px", textAlign:"center" }}>
      <p style={{ fontFamily:"'Georgia',serif", fontSize:"16px", color:"#475569", margin:"0 0 6px" }}>Type any claim above and hit <strong>WHOzTHEY?</strong></p>
      <p style={{ fontFamily:"system-ui", fontSize:"13px", color:"#94a3b8", margin:"0 0 20px" }}>We'll tell you who "they" really are, where it started, and whether it's true.</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center", maxWidth:"600px", margin:"0 auto" }}>
        {ex.map((e,i)=><button key={i} onClick={()=>onSearch(e)} style={{ padding:"6px 14px", background:"#f1f5f9", borderRadius:"20px", fontFamily:"system-ui", fontSize:"12px", color:"#475569", border:"1px solid #e2e8f0", cursor:"pointer" }}>They say {e}…</button>)}
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
  const [searchCount, setSearchCount] = useState(0);
  const answerRef                     = useRef(null);

  function earnBadge(id) {
    if (badges.includes(id)) return;
    const badge = ALL_BADGES.find(b=>b.id===id);
    if (!badge) return;
    setBadges(prev=>[...prev,id]);
    setToastBadge(badge);
  }

  async function handleSearch(rawClaim) {
    setAnswer(null); setClarification(null); setError(null);
    setQuery(rawClaim); setLoading(true); setLoadingStage("clarify");
    setTimeout(()=>answerRef.current?.scrollIntoView({ behavior:"smooth" }),100);
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
    try { setAnswer(await fetchAnswer(claim)); }
    catch { setError("They say the answer is out there — but we hit an error. Please try again."); }
    finally { setLoading(false); setClarification(null); }
  }

  function handleClarificationSelect(claim) {
    earnBadge("clarified");
    setClarification(null);
    setQuery(claim);
    runSearch(claim);
  }

  function handleClear() { setQuery(""); setAnswer(null); setError(null); setClarification(null); }

  // Quiz is now opt-in only — no longer the landing screen

  const TABS = [
    { id:"search", label:"🔍 Search" },
    { id:"marketplace", label:"🛒 Store" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <Hero onSearch={handleSearch} loading={loading} persona={persona} user={user} onLoginRequest={()=>setShowLogin(true)} onQuizRequest={()=>setShowQuiz(true)} onStoreClick={()=>setActiveTab("marketplace")} />

      {/* Tab Nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"center", gap:"0" }}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            padding:"12px 28px", background:"none", border:"none", borderBottom:activeTab===tab.id?"2px solid #dc2626":"2px solid transparent",
            cursor:"pointer", fontFamily:"system-ui", fontSize:"13px", fontWeight:activeTab===tab.id?"700":"400",
            color:activeTab===tab.id?"#dc2626":"#64748b", transition:"all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab==="search" && (
        <>
          {showPersona&&persona&&<PersonaBanner personaKey={persona} badges={badges} onDismiss={()=>setShowPersona(false)} />}
          <div ref={answerRef}>
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
            {answer&&!loading&&(
              <AnswerPanel query={query} answer={answer} onClear={handleClear} persona={persona} onBadgeEarned={earnBadge} user={user} onLoginRequest={()=>setShowLogin(true)} />
            )}
          </div>
          {!loading&&!answer&&!error&&!clarification&&<WelcomeState onSearch={handleSearch} />}

        </>
      )}

      {activeTab==="marketplace" && <Marketplace />}

      <footer style={{ borderTop:"1px solid #1e293b", padding:"28px 20px", textAlign:"center", background:"#0f172a", marginTop:"40px" }}>
        <div style={{ marginBottom:"6px" }}><Wordmark size={20} /></div>
        {badges.length>0&&<div style={{ display:"flex", justifyContent:"center", gap:"6px", flexWrap:"wrap", marginBottom:"10px" }}>{ALL_BADGES.filter(b=>badges.includes(b.id)).map(b=><span key={b.id} title={b.desc} style={{ fontSize:"16px" }}>{b.emoji}</span>)}</div>}
        <p style={{ fontFamily:"system-ui", fontSize:"12px", color:"#475569", margin:0 }}>They say a lot of things. Now you'll know who said it first.</p>
      </footer>

      {/* Sticky Footer Fun Facts */}
      <FunFactsSection onSearch={handleSearch} onBadgeEarned={earnBadge} />

      {showLogin&&<LoginModal onClose={()=>setShowLogin(false)} onLogin={u=>{ setUser(u); setShowPersona(true); }} />}
      {showQuiz&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#1e293b", borderRadius:"12px", padding:"8px", maxWidth:"480px", width:"100%", position:"relative" }}>
            <button onClick={()=>setShowQuiz(false)} style={{ position:"absolute", top:"12px", right:"12px", background:"none", border:"none", color:"#94a3b8", fontSize:"20px", cursor:"pointer", zIndex:1 }}>✕</button>
            <PersonalityQuiz onComplete={k=>{ setPersona(k); setShowQuiz(false); setShowPersona(true); }} onSkip={()=>setShowQuiz(false)} />
          </div>
        </div>
      )}
      {toastBadge&&<BadgeToast badge={toastBadge} onDone={()=>setToastBadge(null)} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}
