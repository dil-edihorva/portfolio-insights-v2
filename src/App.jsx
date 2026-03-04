import React, { useState, useMemo, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LineChart, Line } from "recharts";

/* ═══ TOKENS (Atlas Lens DS) ═══ */
const T = {
  surfaceDefault: "#FFFFFF", surfaceInverse: "#282E37", surfaceVariant: "#F9F9FC", surfaceMuted: "#F0F0F3",
  typeDefault: "#282E37", typeMuted: "#6F7377", typeInverse: "#FFFFFF", typeDisabled: "#A0A2A5",
  brandRed: "#D3222A", selectedRed: "#E5252E",
  divider: "#DADADA", dividerLight: "#E6E6E6",
  outlineDefault: "#6F7377", outlineHover: "#464E53", outlineActive: "#000000",
  actionSecHover: "#F3F3F3", actionSecBorder: "#282E37",
  ragGreen: "#15A015", ragRed: "#A01516", ragAmber: "#FE8E22",
  blue04: "#0B4CCE",
  aiStroke: "#B11F62", aiRed: "rgba(226, 46, 51, 0.3)", aiPurple: "rgba(171, 72, 218, 0.3)", aiIndigo: "rgba(64, 105, 254, 0.3)",
  indigo50: "#4069FE", ocean40: "#2A5DAA",
  tableHeaderBg: "#F3F3F3",
};

/* ═══ DATA ═══ */
const SECTORS = ["Fintech","Logistics","HealthTech","AI/ML","SaaS","Cybersecurity","EdTech","CleanTech"];
const STAGES = ["Seed","Growth","Late-stage"];
const GEOS = ["AMER","EMEA","APAC"];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function generateCompanies(n) {
  const names = ["Neohaul Solutions","AcmeCorp","Creditcredit Corp","Skillclass Corp","Teampartner Corp","Nextmech HQ","Buildprod Inc","Livechat Labs","Cureon Systems","Cargomove Inc","Pulsebio Labs","Metahaul AI","Smartcare AI","Helixly Systems","Prodly HQ","Cybercyber Solutions","Consultconsult Global","Docer HQ","Tutorly Platform","Purepure Networks","Openwallet Platform","Capitaltrade Group","Paytrade Platform","Advison Technologies","Ledgerledger AI","Tradevault Labs","Payia Solutions","Smartfin Inc","Expertgroup Systems","Serveserve HQ","Smartchain Solutions","Vaultly Finance","Curexa Health","DataPilot AI","GreenGrid Energy","CodeNest Labs","ShieldByte Security","LearnLoop Ed","FleetSync Logistics","Quantis Analytics"];
  const rand = seededRandom(42);
  return names.slice(0, n).map((name, i) => {
    const r = () => rand();
    const arr = Math.round((5 + r() * 350) * 10) / 10;
    const prevArr = arr * (0.82 + r() * 0.16);
    return {
      id: i, name,
      sector: SECTORS[Math.floor(r() * SECTORS.length)],
      stage: STAGES[Math.floor(r() * STAGES.length)],
      geo: GEOS[Math.floor(r() * GEOS.length)],
      arr, prevArr,
      nrr: Math.round((85 + r() * 50) * 10) / 10,
      prevNrr: 85 + r() * 50 + (r() * 8 - 4),
      grr: Math.round((70 + r() * 30) * 10) / 10,
      prevGrr: 70 + r() * 30 + (r() * 6 - 3),
      grossMargin: Math.round((30 + r() * 55) * 10) / 10,
      ebitdaMargin: Math.round((-20 + r() * 50) * 10) / 10,
      ro40: Math.round(((-20 + r() * 50) + (r() * 40 - 10)) * 10) / 10,
      cash: Math.round((2 + r() * 200) * 10) / 10,
      ltv_cac: Math.round((0.5 + r() * 6) * 10) / 10,
      magic: Math.round((0.1 + r() * 1.8) * 100) / 100,
      arrPerEmp: Math.round(40000 + r() * 200000),
      grossMarginPrev: Math.round((30 + r() * 55) * 10) / 10,
      ebitdaMarginPrev: Math.round((-20 + r() * 50) * 10) / 10,
      cashPrev: Math.round((2 + r() * 200) * 10) / 10,
      health: r() < 0.6 ? "healthy" : r() < 0.8 ? "at_risk" : "critical",
      prevHealth: r() < 0.7 ? "healthy" : r() < 0.88 ? "at_risk" : "critical",
      runway: Math.round(3 + r() * 36),
      yoy: Math.round(((arr - prevArr) / prevArr * 100) * 10) / 10,
      qoq: Math.round((r() * 20 - 5) * 10) / 10,
    };
  });
}
const ALL_COMPANIES = generateCompanies(40);
const KPI_DEFS = [
  { key: "arr", label: "Total ARR", format: v => `$${v.toFixed(1)}M` },
  { key: "nrr", label: "Net Revenue Retention", format: v => `${v.toFixed(1)}%` },
  { key: "grr", label: "Gross Revenue Retention", format: v => `${v.toFixed(1)}%` },
  { key: "grossMargin", label: "Gross Margin", format: v => `${v.toFixed(1)}%` },
  { key: "ebitdaMargin", label: "EBITDA Margin", format: v => `${v.toFixed(1)}%` },
  { key: "ro40", label: "Rule of 40", format: v => v.toFixed(1) },
  { key: "cash", label: "Cash Position", format: v => `$${v.toFixed(1)}M` },
  { key: "ltv_cac", label: "LTV/CAC", format: v => `${v.toFixed(1)}x` },
  { key: "magic", label: "Magic Number", format: v => v.toFixed(2) },
  { key: "arrPerEmp", label: "ARR per Employee", format: v => `$${(v / 1000).toFixed(0)}K` },
];

/* ═══ ICON ═══ */
const MI = ({ name, size = 24, color = "currentColor", style: s = {} }) => (
  <span className="material-icons-outlined" style={{ fontSize: size, color, lineHeight: 1, verticalAlign: "middle", userSelect: "none", ...s }}>{name}</span>
);

/* ═══ AI VISUAL SYSTEM ═══ */
function AIContainer({ children, style = {} }) {
  return (
    <div style={{ position: "relative", background: T.surfaceDefault, borderRadius: 12, borderTop: `1px solid ${T.aiStroke}`, overflow: "clip", boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.1)", ...style }}>
      <div style={{ position: "absolute", top: -41, left: "50%", transform: "translateX(-50%)", width: 500, height: 40, filter: "blur(40px)", pointerEvents: "none", backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.3) 0.9%, ${T.aiRed} 15.8%, ${T.aiPurple} 50.5%, ${T.aiIndigo} 84.3%, rgba(255,255,255,0.3) 100%)` }} />
      {children}
    </div>
  );
}
function AIBadge() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, fontSize: 12, color: T.typeMuted, lineHeight: 1 }}>✦</span>
      <span style={{ fontSize: 11, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.4px", lineHeight: "16px" }}>Generated by AI</span>
    </div>
  );
}
function AIDisclaimer() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 20 }}>
      <span style={{ fontSize: 11, color: T.typeMuted, letterSpacing: "0.4px" }}>AI-generated content may have inaccuracies.</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.4px", textDecoration: "underline", cursor: "pointer" }}>Learn more.</span>
    </div>
  );
}

/* ═══ SIDEBAR ═══ */
function Sidebar({ activePage, onPageChange }) {
  const NI = (icon, label, active, indent, onClick) => (
    <div key={label} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 16, padding: indent ? "12px 16px 12px 56px" : "12px 16px", borderRadius: 8, background: active ? T.selectedRed : "transparent", cursor: "pointer", transition: "background 0.12s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? T.selectedRed : "transparent"; }}>
      {!indent && <MI name={icon} size={24} color={T.typeInverse} />}
      <span style={{ color: T.typeInverse, fontSize: 16, fontWeight: active ? 600 : 400, letterSpacing: "0.2px", lineHeight: "24px" }}>{label}</span>
    </div>
  );
  return (
    <div style={{ width: 270, minWidth: 270, background: T.surfaceInverse, display: "flex", flexDirection: "column", height: "100vh", padding: "0 12px" }}>
      <div style={{ padding: "16px 4px", display: "flex", alignItems: "center", gap: 12 }}>
        <MI name="menu" size={24} color={T.typeInverse} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: T.brandRed, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: T.typeInverse, fontSize: 12, fontWeight: 700 }}>D</span></div>
          <span style={{ color: T.typeInverse, fontSize: 16, fontWeight: 600 }}>Diligent</span>
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px 8px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Back to Boards */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderRadius: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <MI name="arrow_back" size={20} color={T.typeInverse} />
          <span style={{ color: T.typeInverse, fontSize: 16, fontWeight: 600, letterSpacing: "0.2px", lineHeight: "24px" }}>Boards</span>
        </div>
        {NI("home", "Home", false, false, () => {})}
        {NI("menu_book", "Books", false, false, () => {})}
        {NI("business_center", "Resource Center", false, false, () => {})}
        {NI("auto_awesome", "Smart Builder", false, false, () => {})}
        {NI("hub", "Decision Hub", false, false, () => {})}
        {NI("quiz", "Questionnaires", false, false, () => {})}
        {/* Portfolio Intelligence — expandable section */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", cursor: "pointer", borderRadius: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <MI name="insights" size={24} color={T.typeInverse} />
          <span style={{ color: T.typeInverse, fontSize: 16, flex: 1, lineHeight: "24px" }}>Portfolio Intelligence</span>
          <MI name="expand_less" size={20} color={T.typeInverse} />
        </div>
        <div style={{ position: "relative", paddingLeft: 28, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ position: "absolute", left: 28, top: 0, bottom: 20, width: 1, background: "rgba(255,255,255,0.15)" }} />
          {NI(null, "Company Metrics", activePage === "smartdb", true, () => onPageChange("smartdb"))}
          {NI(null, "Insights Dashboard", activePage === "portfolio", true, () => onPageChange("portfolio"))}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {/* Boards account at bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 0", marginTop: 8 }}>
        {NI("group", "Boards account", false, false, () => {})}
      </div>
    </div>
  );
}

/* ═══ TOP BAR ═══ */
function TopBar() {
  return (
    <div style={{ height: 60, minHeight: 60, background: T.surfaceDefault, borderBottom: `1px solid ${T.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: T.brandRed, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: T.typeInverse, fontSize: 14, fontWeight: 700 }}>D</span></div>
        <span style={{ fontSize: 16, fontWeight: 500, color: T.typeDefault, letterSpacing: "0.2px" }}>BLC Dogfooding</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 14, color: T.typeMuted, cursor: "pointer" }}>Open administrator view</span>
        <MI name="open_in_new" size={20} color={T.typeMuted} />
        <MI name="help_outline" size={20} color={T.typeMuted} />
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8D4C8", display: "flex", alignItems: "center", justifyContent: "center" }}><MI name="person" size={20} color="#8B7355" /></div>
      </div>
    </div>
  );
}

/* ═══ DS SELECT ═══ */
function DSSelect({ value, options, onChange, triggerLabel, labelAbove, labels }) {
  const [open, setOpen] = useState(false);
  const display = v => (labels && labels[v]) || v;
  if (labelAbove) {
    return (
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, marginBottom: 6, letterSpacing: "0.3px", lineHeight: "16px" }}>{triggerLabel}</div>
        <button onClick={() => setOpen(!open)} style={{ height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 36px 0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", position: "relative", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
          {display(value)}
          <MI name={open ? "expand_less" : "expand_more"} size={20} color={T.typeMuted} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
        </button>
        {open && <>
          <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.surfaceDefault, borderRadius: 8, zIndex: 200, boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.1)", padding: 8, maxHeight: 320, overflowY: "auto" }}>
            {options.map(opt => (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 6, fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", background: opt === value ? T.actionSecHover : "transparent", display: "flex", alignItems: "center", gap: 12, transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                onMouseLeave={e => e.currentTarget.style.background = opt === value ? T.actionSecHover : "transparent"}>
                {opt === value ? <MI name="check" size={18} color={T.typeDefault} /> : <span style={{ width: 18 }} />}{display(opt)}
              </div>
            ))}
          </div>
        </>}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      {triggerLabel && <span style={{ fontSize: 14, color: T.typeMuted, letterSpacing: "0.2px" }}>{triggerLabel}</span>}
      <button onClick={() => setOpen(!open)} style={{ height: 36, minWidth: 100, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 32px 0 12px", fontSize: 14, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", textAlign: "left", position: "relative", display: "flex", alignItems: "center" }}>
        {display(value)}
        <MI name={open ? "expand_less" : "expand_more"} size={18} color={T.typeMuted} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} />
      </button>
      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: T.surfaceDefault, borderRadius: 8, zIndex: 200, boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.1)", padding: 8, minWidth: 180, maxHeight: 320, overflowY: "auto" }}>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 6, fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", background: opt === value ? T.actionSecHover : "transparent", display: "flex", alignItems: "center", gap: 12, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
              onMouseLeave={e => e.currentTarget.style.background = opt === value ? T.actionSecHover : "transparent"}>
              {opt === value ? <MI name="check" size={18} color={T.typeDefault} /> : <span style={{ width: 18 }} />}{display(opt)}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ═══ SEGMENTED TOGGLE ═══ */
function Seg({ options, value, onChange, small }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${T.dividerLight}`, borderRadius: 8, overflow: "hidden" }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding: small ? "5px 14px" : "8px 20px", fontSize: small ? 13 : 14, fontWeight: 600,
          color: value === o ? T.typeInverse : T.typeDefault,
          background: value === o ? T.surfaceInverse : T.surfaceDefault,
          border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", transition: "all 0.12s",
        }}>{o}</button>
      ))}
    </div>
  );
}

/* ═══ FILTER BAR ═══ */
function FilterBar({ filters, setFilters, companyCount, groupBy, setGroupBy }) {
  const hasFilters = filters.stage !== "All" || filters.sector !== "All" || filters.geo !== "All";
  const clearAll = () => setFilters({ stage: "All", sector: "All", geo: "All", time: "Q4 2025" });
  const summary = [
    `${companyCount} companies`,
    filters.stage !== "All" && filters.stage,
    filters.sector !== "All" && filters.sector,
    filters.geo !== "All" && `Geo: ${filters.geo}`,
    filters.time,
  ].filter(Boolean).join(" · ");

  return (
    <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "16px 24px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}><DSSelect triggerLabel="Stage" value={filters.stage} labelAbove options={["All", ...STAGES]} onChange={v => setFilters({ ...filters, stage: v })} /></div>
        <div style={{ flex: 1 }}><DSSelect triggerLabel="Sector" value={filters.sector} labelAbove options={["All", ...SECTORS]} onChange={v => setFilters({ ...filters, sector: v })} /></div>
        <div style={{ flex: 1 }}><DSSelect triggerLabel="Geography" value={filters.geo} labelAbove options={["All", ...GEOS]} onChange={v => setFilters({ ...filters, geo: v })} /></div>
        <div style={{ flex: 1 }}><DSSelect triggerLabel="Time" value={filters.time} labelAbove options={["Q4 2025","Q3 2025","Q2 2025","Q1 2025"]} onChange={v => setFilters({ ...filters, time: v })} /></div>
        {/* Divider */}
        <div style={{ width: 1, height: 32, background: T.divider, flexShrink: 0, marginBottom: 4 }} />
        {/* Group by view selector */}
        <div style={{ flexShrink: 0, marginBottom: 4, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px" }}>Group by</span>
          <Seg options={["Sector","Stage"]} value={groupBy} onChange={setGroupBy} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ fontSize: 12, color: T.typeMuted }}>{summary}</span>
        {hasFilters && <button onClick={clearAll} style={{ background: "none", border: "none", color: T.typeMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>Clear filters</button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI ANALYST SIDE PANEL — Contextual AI Companion
   ═══════════════════════════════════════════════════════════════════════════ */
const HEALTH_LABEL = { healthy: "Healthy", at_risk: "Watch", critical: "Critical" };
const HEALTH_COLOR = { healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed };

/* ═══════════════════════════════════════════════════════════════════════════
   DYNAMIC AI CONTEXT — generates prompts based on tab state
   ═══════════════════════════════════════════════════════════════════════════ */

function getPulseContext() {
  return {
    title: "AI Analyst",
    greeting: "Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.",
    suggestions: [
      "Summarize the biggest portfolio changes this quarter",
      "Which alerts should I prioritize and why?",
      "Are the health deteriorations concentrated in a sector?",
      "Draft talking points for my next LP update",
    ],
  };
}

function getGIContext(filters, groupBy, companies) {
  const hasFilters = filters.stage !== "All" || filters.sector !== "All" || filters.geo !== "All";
  const n = companies.length;

  const baseSuggestions = [
    "Which companies saw the largest ARR swing vs last quarter?",
    `Summarize the biggest portfolio-level risk this quarter`,
    "Which companies have runway under 12 months?",
  ];

  if (hasFilters && filters.sector !== "All") {
    return {
      title: "AI Analyst",
        greeting: `Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.`,
      suggestions: [
        `Why is NRR lower across ${filters.sector} companies this quarter?`,
        `What explains the EBITDA spread within ${filters.sector}?`,
        `Which ${filters.sector} company improved most since Q3?`,
        `Are there ${filters.sector} companies that should be on watch?`,
      ],
    };
  }

  if (groupBy === "Stage") {
    return {
      title: "AI Analyst",
        greeting: `Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.`,
      suggestions: [
        "Are Growth-stage companies outperforming Late-stage on NRR?",
        "Which stage has the most companies on watch status?",
        "Compare burn rates across stages — who's most efficient?",
        ...baseSuggestions.slice(0, 1),
      ],
    };
  }

  return {
    title: "AI Analyst",
    greeting: `Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.`,
    suggestions: [
      ...baseSuggestions,
      "What explains the EBITDA gap between SaaS and AI/ML companies?",
    ],
  };
}

function getPeerContext(subject, peers) {
  if (!subject || !peers || peers.length === 0) return {
    title: "AI Analyst",
    greeting: "Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.",
    suggestions: [
      "Which companies should I compare first?",
      "Show me the top performers by NRR this quarter",
      "What metrics best differentiate leaders from laggards?",
    ],
  };
  const peerNames = peers.slice(0, 3).map(p => p.name).join(", ");
  return {
    title: "AI Analyst",
    greeting: `Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.`,
    suggestions: [
      `Why is ${subject.name} ${subject.nrr < 110 ? "trailing" : "leading"} peers on NRR?`,
      `What's driving the CAC efficiency gap vs peers?`,
      `Which peer should ${subject.name}'s board pay closest attention to?`,
      `Draft a board-ready comparison summary for ${subject.name}`,
    ],
  };
}

function getTeardownContext(company) {
  if (!company) return {
    title: "AI Analyst",
    greeting: "Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.",
    suggestions: [
      "Which company should I review first based on recent changes?",
      "Show me companies with the most concerning health trends",
      "Compare the top 3 companies by ARR growth",
    ],
  };
  return {
    title: "AI Analyst",
    greeting: `Analysing your portfolio. I can surface cross-cutting patterns, outliers, and actionable insights.`,
    suggestions: [
      `What are the biggest risks for ${company.name} right now?`,
      `How does ${company.name}\'s burn rate compare to similar-stage companies?`,
      `Summarize ${company.name}\'s trajectory over the last 4 quarters`,
      `Draft board-ready talking points for ${company.name}`,
    ],
  };
}

const MOCK_RESPONSES = {
  "Which companies saw the largest ARR swing vs last quarter?": {
    text: "Based on the current portfolio data, here are the companies with the largest ARR movement quarter-over-quarter:",
    table: [
      { company: "Creditcredit Corp", change: "+$42.3M", pct: "+18.2%", direction: "up" },
      { company: "Neohaul Solutions", change: "+$28.1M", pct: "+24.7%", direction: "up" },
      { company: "Cargomove Inc", change: "-$14.8M", pct: "-12.3%", direction: "down" },
      { company: "Tutorly Platform", change: "-$8.2M", pct: "-9.1%", direction: "down" },
    ],
    followUp: "Cargomove's decline correlates with their NRR dropping below 90% — worth investigating whether this is churn-driven or pricing-related.",
    citations: ["metrics_Q4_2025.json", "metrics_Q3_2025.json"],
  },
  "What explains the EBITDA gap between SaaS and AI/ML companies?": {
    text: "The EBITDA margin gap between SaaS and AI/ML companies in your portfolio is significant — averaging 14.2% for SaaS vs -8.7% for AI/ML. Three primary drivers:",
    bullets: [
      "Compute costs: AI/ML companies spend 35-50% of revenue on cloud infrastructure vs 12-18% for SaaS",
      "Gross margin structure: AI/ML avg gross margin is 42% vs SaaS at 68%",
      "R&D intensity: AI/ML companies invest 40%+ of revenue in R&D vs 25% for mature SaaS",
    ],
    followUp: "This suggests AI/ML companies may need significantly higher revenue scale before achieving profitability.",
    citations: ["insights_Q4_2025.json"],
  },
  "Which companies have runway under 12 months?": {
    text: "6 companies are flagged with estimated runway under 12 months:",
    bullets: [
      "Tutorly Platform — ~6 months, actively exploring bridge financing",
      "Purepure Networks — ~7 months, hiring freeze implemented",
      "Docer HQ — ~8 months, in conversations with existing investors",
      "Cargomove Inc — ~9 months, exploring strategic alternatives",
      "Consultconsult Global — ~10 months, cost restructuring underway",
      "LearnLoop Ed — ~11 months, Series C planned for Q2",
    ],
    followUp: "Tutorly and Purepure are the most urgent. Consider coordinating bridge financing across the portfolio.",
    citations: ["metrics_Q4_2025.json", "insights_Q4_2025.json"],
  },
};


/* AI sparkle icon — 3 four-pointed stars with diagonal gradient */
function SparkleIcon({ size = 24 }) {
  const scale = size / 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="aiSparkleGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BE0C1E" />
          <stop offset="0.5" stopColor="#AB48DA" />
          <stop offset="1" stopColor="#4069FE" />
        </linearGradient>
      </defs>
      {/* Large star — bottom left */}
      <path d="M10 21C10 16 7 13 2 13C7 13 10 10 10 5C10 10 13 13 18 13C13 13 10 16 10 21Z" fill="url(#aiSparkleGrad)" />
      {/* Medium star — top right */}
      <path d="M17.5 10C17.5 7.5 16 6 13.5 6C16 6 17.5 4.5 17.5 2C17.5 4.5 19 6 21.5 6C19 6 17.5 7.5 17.5 10Z" fill="url(#aiSparkleGrad)" />
      {/* Small star — mid right */}
      <path d="M19 15.5C19 14.2 18.2 13.5 17 13.5C18.2 13.5 19 12.7 19 11.5C19 12.7 19.8 13.5 21 13.5C19.8 13.5 19 14.2 19 15.5Z" fill="url(#aiSparkleGrad)" />
    </svg>
  );
}

/* Tab-header AI trigger — matches Figma AI Button component with gradient border */
function AIAnalystTrigger({ onClick, isOpen }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", padding: "1px", borderRadius: 8,
        background: "linear-gradient(135deg, #B11F62 0%, #1C4EE4 100%)",
        border: "none", cursor: "pointer", flexShrink: 0,
        opacity: hover ? 0.9 : 1, transition: "opacity 0.15s",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "4px 12px", borderRadius: 7,
        background: isOpen ? "rgba(255,255,255,0.94)" : T.surfaceDefault,
      }}>
        <SparkleIcon size={24} />
        <span style={{
          fontSize: 14, fontWeight: 600, color: "#282E37",
          letterSpacing: "0.14px", lineHeight: "20px", padding: "4px 0",
          fontFamily: "inherit",
        }}>AI Analyst</span>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE TAB AI PANEL — Matches Company Insights Suite Figma designs
   ═══════════════════════════════════════════════════════════════════════════ */
function TabAIPanel({ isOpen, onClose, ctx, pendingAsk, onPendingHandled, newChatSignal }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([
    { id: 1, title: "Q4 portfolio health review", date: "Feb 28, 2026 · 3:14 PM", messages: [] },
    { id: 2, title: "Fintech sector NRR analysis", date: "Feb 25, 2026 · 10:02 AM", messages: [] },
    { id: 3, title: "Runway risk assessment", date: "Feb 20, 2026 · 2:45 PM", messages: [] },
  ]);
  const [activeThread, setActiveThread] = useState("new");
  const [showThreadList, setShowThreadList] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const msgContainerRef = useRef(null);
  const stickyRef = useRef(null);





  const activeSuggestions = ctx?.suggestions || [];

  /* When AI Analyst button is clicked, start a fresh chat */
  useEffect(() => {
    if (newChatSignal > 0) {
      setMessages([]);
      setActiveThread("new");
      setShowThreadList(false);
    }
  }, [newChatSignal]);

  useEffect(() => {
    if (!pendingAsk) return;
    setShowThreadList(false);
    const label = pendingAsk.label || "Selected element";
    const detail = pendingAsk.detail || "";
    const q = "Tell me more about: " + label + (detail ? " \u2014 " + detail.slice(0, 120) : "");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Here\u2019s a deeper look at \u201c" + label + "\u201d:",
        bullets: [
          "Analysis generated from structured metrics and board materials, contextual to your selection.",
          "Cross-referenced with historical trends and peer benchmarks for perspective.",
          "Actionable recommendations based on this specific data point.",
        ],
        followUp: "Would you like me to compare this against benchmarks or drill into a specific driver?",
        citations: ["metrics_Q4_2025.json", "insights_Q4_2025.json"],
      }]);
      setIsTyping(false);
    }, 1200);
    if (onPendingHandled) onPendingHandled();
  }, [pendingAsk]);

  useEffect(() => { if (msgContainerRef.current) msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight; }, [messages]);




  const handleSend = (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setIsTyping(true);
    setTimeout(() => {
      const mockKey = Object.keys(MOCK_RESPONSES).find(k => q === k);
      const mock = mockKey ? MOCK_RESPONSES[mockKey] : null;
      if (mock) {
        setMessages(prev => [...prev, { role: "ai", ...mock }]);
      } else {
        setMessages(prev => [...prev, {
          role: "ai",
          text: `Based on the current context, here's what I found:`,
          bullets: [
            "Analysis generated from structured metrics database and board materials, scoped to the active filter/selection.",
            "Results include specific numbers, trends, and cross-references to source documents.",
            "Actionable follow-up suggestions provided based on findings.",
          ],
          followUp: "Would you like me to drill deeper into any of these areas?",
          citations: ["metrics_Q4_2025.json", "insights_Q4_2025.json"],
        }]);
      }
      setIsTyping(false);
    }, 1200);
  };

  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  /* Agent header block — reused for greeting and each AI response */
  const AgentHeader = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: T.surfaceDefault, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <SparkleIcon size={20} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "18.5px" }}>AI Analyst</span>
        <span style={{ fontSize: 11, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.4px", lineHeight: "16px" }}>{timeStr}</span>
      </div>
    </div>
  );

  /* Feedback row — copy, thumbs up, thumbs down */
  const FeedbackRow = () => (
    <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
      {[{ icon: "content_copy", tip: "Copy" }, { icon: "thumb_up", tip: "Helpful" }, { icon: "thumb_down", tip: "Not helpful" }].map((a, j) => (
        <button key={j} title={a.tip} style={{ width: 28, height: 28, borderRadius: 9999, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <MI name={a.icon} size={20} color={T.typeMuted} />
        </button>
      ))}
    </div>
  );

  /* ═══ FULL-VIEW EXPANDED OVERLAY ═══ */
  if (expanded) {
    /* Inline citation badge — small numbered pill rendered inline with text */
    const CitBadge = ({ n }) => (
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 18, height: 18, padding: "0 5px", borderRadius: 4,
        background: T.surfaceVariant, fontSize: 11, fontWeight: 600,
        color: T.typeMuted, marginLeft: 4, verticalAlign: "middle", lineHeight: "18px",
        cursor: "pointer",
      }}>{n}</span>
    );

    const renderMessage = (msg, i) => (
      <div key={i} style={{ marginBottom: 32 }}>
        {msg.role === "system" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#FFF8E1", borderRadius: 10, border: "1px solid #FFE082" }}>
            <MI name="tune" size={16} color="#F59E0B" />
            <span style={{ fontSize: 13, color: "#92400E", flex: 1 }}>{msg.text}</span>
          </div>
        ) : msg.role === "user" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.typeDefault }}>You</div>
                <div style={{ fontSize: 11, color: T.typeMuted }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: T.dividerLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MI name="person" size={20} color={T.typeMuted} />
              </div>
            </div>
            <div style={{
              padding: "10px 16px", background: "#E8F5E9", borderRadius: "16px 4px 16px 16px",
              fontSize: 15, fontWeight: 400, color: T.typeDefault,
              lineHeight: "22px", maxWidth: "75%",
            }}>{msg.text}</div>
          </div>
        ) : (
          <div>
            <AgentHeader />
            <div style={{ fontSize: 15, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.1px" }}>
              {msg.text}
              {msg.citations && msg.citations.length > 0 && !msg.bullets && !msg.table && (
                <>{msg.citations.map((_, j) => <CitBadge key={j} n={j + 1} />)}</>
              )}
            </div>

            {msg.table && (
              <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${T.dividerLight}`, margin: "16px 0", background: T.surfaceDefault }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead><tr style={{ background: T.surfaceVariant }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>Company</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>Change</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>%</th>
                  </tr></thead>
                  <tbody>{msg.table.map((row, j) => (
                    <tr key={j}>
                      <td style={{ padding: "10px 16px", fontWeight: 500, color: T.ocean40, borderBottom: `1px solid ${T.dividerLight}` }}>{row.company}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: row.direction === "up" ? T.ragGreen : T.ragRed, borderBottom: `1px solid ${T.dividerLight}` }}>{row.change}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", color: T.typeMuted, borderBottom: `1px solid ${T.dividerLight}` }}>{row.pct}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {msg.bullets && (
              <div style={{ marginTop: 16 }}>
                {msg.bullets.map((b, j) => (
                  <div key={j} style={{ marginBottom: 16, fontSize: 15, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.1px" }}>
                    <span style={{ fontWeight: 600 }}>{j + 1}. </span>{b}
                    {msg.citations && msg.citations[j] && <CitBadge n={j + 1} />}
                  </div>
                ))}
              </div>
            )}

            {msg.followUp && <div style={{ fontSize: 15, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.1px", marginTop: 16 }}>{msg.followUp}</div>}

            {/* Sources footer — numbered rows like GovernAI */}
            {msg.citations && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Sources</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {msg.citations.map((c, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.dividerLight}`, fontSize: 13, color: T.typeDefault, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceVariant}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.typeMuted, minWidth: 16 }}>{j + 1}</span>
                      <MI name="description" size={16} color={T.typeMuted} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FeedbackRow />
          </div>
        )}
      </div>
    );

    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        display: "flex", flexDirection: "column", background: T.surfaceDefault,
      }}>
        {/* ── Header — hamburger left, title center, collapse right ── */}
        <div style={{ flexShrink: 0, padding: "14px 20px", display: "flex", alignItems: "center", position: "relative", borderBottom: `1px solid ${T.dividerLight}` }}>
          <button onClick={() => setExpanded(false)} title="Menu" style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name="menu" size={22} color={T.typeDefault} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault, lineHeight: "24px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>AI Analyst</span>
          <button onClick={() => setExpanded(false)} title="Collapse to panel" style={{ marginLeft: "auto", width: 36, height: 36, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name="close_fullscreen" size={20} color={T.typeDefault} />
          </button>
        </div>

        {/* ── Messages area — white bg, centered column ── */}
        <div ref={msgContainerRef} style={{
          flex: 1, overflowY: "auto",
          display: "flex", flexDirection: "column",
          justifyContent: messages.length === 0 && !isTyping ? "center" : "flex-start",
          background: T.surfaceDefault,
        }}>
          <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "32px 24px 40px" }}>

            {/* Empty / welcome state */}
            {messages.length === 0 && !isTyping && (
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: T.surfaceVariant, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SparkleIcon size={30} />
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px", marginBottom: 6 }}>
                  {ctx?.greeting || "Welcome back"}
                </div>
                <div style={{ fontSize: 15, color: T.typeMuted, lineHeight: "22px" }}>What would you like to focus on today?</div>
              </div>
            )}

            {/* Suggestion pills — centered in welcome */}
            {messages.length === 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, textAlign: "left", marginBottom: 10 }}>Suggested questions</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" }}>
                {activeSuggestions.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)} style={{
                    height: 32, padding: "0 16px", borderRadius: 9999, border: `1px solid ${T.divider}`,
                    background: T.surfaceDefault, fontSize: 13, fontWeight: 500, color: T.typeDefault,
                    cursor: "pointer", fontFamily: "inherit", lineHeight: "20px", letterSpacing: "0.2px", transition: "all 0.12s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; e.currentTarget.style.borderColor = T.typeMuted; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.surfaceDefault; e.currentTarget.style.borderColor = T.divider; }}>
                    {q}
                  </button>
                ))}
                </div>
              </div>
            )}

            {/* Greeting when conversation has started */}
            {messages.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <AgentHeader />
                <div style={{ fontSize: 15, fontWeight: 400, color: T.typeDefault, lineHeight: "24px" }}>{ctx?.greeting || "Analysing your portfolio."}</div>
                <div style={{ fontSize: 15, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", marginTop: 4 }}>What would you like to know?</div>
              </div>
            )}

            {/* Messages */}
            {messages.map(renderMessage)}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ marginBottom: 16 }}>
                <AgentHeader />
                <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
                  {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: T.typeMuted, opacity: 0.5, animation: `aiDot 1.4s infinite ${j * 0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Input card — centered, bordered container ── */}
        <div style={{ flexShrink: 0, padding: "0 24px 8px", background: T.surfaceDefault }}>
          <div style={{
            maxWidth: 720, margin: "0 auto",
            border: `1px solid ${T.divider}`, borderRadius: 16,
            background: T.surfaceDefault,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}>
            {/* Text input */}
            <div style={{ padding: "14px 20px 8px", display: "flex", alignItems: "center" }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask me anything"
                style={{ flex: 1, border: "none", outline: "none", fontFamily: "inherit", fontSize: 15, fontWeight: 400, color: T.typeDefault, background: "transparent", lineHeight: "22px" }} />
            </div>
            {/* Scope + send row */}
            <div style={{ padding: "6px 12px 12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              
              <button onClick={() => handleSend()} style={{
                width: 36, height: 36, borderRadius: 9999, border: "none",
                background: input.trim() ? T.typeDefault : T.dividerLight,
                cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0,
              }}>
                <MI name="arrow_upward" size={18} color={input.trim() ? "#fff" : T.typeMuted} />
              </button>
            </div>
          </div>
          {/* Disclaimer below card */}
          <div style={{ textAlign: "center", padding: "10px 0 4px", fontSize: 11, color: T.typeMuted, letterSpacing: "0.2px" }}>
            AI-generated content may have inaccuracies. <span style={{ textDecoration: "underline", cursor: "pointer" }}>Learn more</span>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ SIDE PANEL VIEW ═══ */
  return (
    <div ref={stickyRef} style={{
      width: isOpen ? 440 : 0, minWidth: isOpen ? 440 : 0,
      overflow: "hidden", flexShrink: 0,
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
    <div style={{
      width: 440, height: "100%",
      borderLeft: `1px solid ${T.divider}`,
      display: "flex", flexDirection: "column",
      background: T.surfaceVariant,
    }}>

      {/* ─── HEADER — white bg, AI gradient bottom border ─── */}
      <div style={{ background: T.surfaceDefault, flexShrink: 0 }}>
        <div style={{
          padding: "16px 16px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!showThreadList && (
            <button title="Back to threads" onClick={() => setShowThreadList(true)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <MI name="arrow_back" size={20} color={T.typeDefault} />
            </button>
          )}
          <span style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>AI Analyst</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button title="Expand" onClick={() => setExpanded(true)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name="open_in_full" size={20} color={T.typeDefault} />
          </button>
          <button onClick={onClose} title="Close" style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name="close" size={20} color={T.typeDefault} />
          </button>
        </div>
        </div>
        {/* AI gradient stroke */}
        <div style={{ height: 2, background: "linear-gradient(128deg, #BE0C1E 17.49%, #AB48DA 58.74%, #4069FE 100%)" }} />
      </div>

      {showThreadList ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginBottom: 16 }}>Your AI threads</div>
          <button onClick={() => { setMessages([]); setActiveThread("new"); setShowThreadList(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.divider}`, background: T.surfaceDefault, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.typeDefault, fontFamily: "inherit", width: "100%", marginBottom: 16 }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceVariant} onMouseLeave={e => e.currentTarget.style.background = T.surfaceDefault}><MI name="add" size={18} color={T.typeDefault} /> New chat</button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {threads.map(thread => (
              <button key={thread.id} onClick={() => { setActiveThread(thread.id); setShowThreadList(false); setMessages(thread.messages); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", borderRadius: 0, border: "none", borderBottom: `1px solid ${T.dividerLight}`, background: activeThread === thread.id ? T.surfaceVariant : "transparent", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceVariant} onMouseLeave={e => { if (activeThread !== thread.id) e.currentTarget.style.background = "transparent"; }}>
                <div><div style={{ fontSize: 14, fontWeight: 500, color: T.typeDefault, lineHeight: "20px", marginBottom: 2 }}>{thread.title}</div><div style={{ fontSize: 12, color: T.typeMuted }}>{thread.date}</div></div>
                <MI name="arrow_forward" size={18} color={T.typeMuted} />
              </button>
            ))}
          </div>
        </div>
      ) : (
      <>

      <div ref={msgContainerRef} style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "16px 16px 32px",
      }}>

        {/* AI greeting — plain text, no bubble (matches Figma) */}
        <div style={{ marginBottom: messages.length > 0 ? 24 : 0 }}>
          <AgentHeader />
          <div style={{ fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.2px" }}>
            {ctx?.greeting || "Analysing your portfolio."}
          </div>
          <div style={{ fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.2px", marginTop: 4 }}>
            What would you like to know?
          </div>
        </div>

        {/* Suggested questions — right-aligned DS Secondary/Small buttons */}
        {messages.length === 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, textAlign: "left", marginBottom: 10 }}>Suggested questions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
            {activeSuggestions.map((q, i) => (
              <button key={i} onClick={() => handleSend(q)} style={{
                height: 28, padding: "0 14px",
                borderRadius: 9999, border: `1px solid ${T.typeDefault}`,
                background: T.surfaceDefault,
                fontSize: 12, fontWeight: 600, color: T.typeDefault,
                cursor: "pointer", fontFamily: "inherit",
                lineHeight: "18px", letterSpacing: "0.3px",
                transition: "all 0.12s", whiteSpace: "nowrap",
                maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surfaceDefault; }}>
                {q}
              </button>
            ))}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            {msg.role === "system" ? (
              /* SYSTEM MESSAGE — focus changed inline card */
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                }}>
                  <div style={{ flex: 1, height: 1, background: T.divider }} />
                  <MI name="tune" size={14} color={T.typeMuted} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px", whiteSpace: "nowrap" }}>{msg.text}</span>
                  <div style={{ flex: 1, height: 1, background: T.divider }} />
                </div>
                {/* Fresh suggestions for new scope */}
                {msg.suggestions && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
                    {msg.suggestions.map((q, j) => (
                      <button key={j} onClick={() => handleSend(q)} style={{
                        height: 28, padding: "0 14px",
                        borderRadius: 9999, border: `1px solid ${T.typeDefault}`,
                        background: T.surfaceDefault,
                        fontSize: 12, fontWeight: 600, color: T.typeDefault,
                        cursor: "pointer", fontFamily: "inherit",
                        lineHeight: "18px", letterSpacing: "0.3px",
                        transition: "all 0.12s", whiteSpace: "nowrap",
                        maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.surfaceDefault; }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : msg.role === "user" ? (
              /* USER MESSAGE — white bubble, right-aligned, subtle shadow */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px" }}>You</span>
                  <div style={{ width: 32, height: 32, borderRadius: 9999, background: T.dividerLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MI name="person" size={18} color={T.typeMuted} />
                  </div>
                </div>
                <div style={{
                  padding: "8px 16px",
                  background: T.surfaceDefault,
                  borderRadius: "12px 0 12px 12px",
                  boxShadow: "0 0 30px #eff1f6",
                  fontSize: 16, fontWeight: 400, color: T.typeDefault,
                  lineHeight: "24px", letterSpacing: "0.2px",
                  maxWidth: "90%",
                }}>{msg.text}</div>
              </div>
            ) : (
              /* AI RESPONSE — plain text, no bubble, bullet list */
              <div>
                <AgentHeader />
                <div style={{ fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.2px", marginBottom: msg.table || msg.bullets ? 16 : 0 }}>{msg.text}</div>

                {msg.table && (
                  <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${T.dividerLight}`, marginBottom: 16, background: T.surfaceDefault }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead><tr style={{ background: T.surfaceVariant }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>Company</th>
                        <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>Change</th>
                        <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.divider}` }}>%</th>
                      </tr></thead>
                      <tbody>{msg.table.map((row, j) => (
                        <tr key={j}>
                          <td style={{ padding: "8px 12px", fontWeight: 500, color: T.ocean40, borderBottom: `1px solid ${T.dividerLight}` }}>{row.company}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: row.direction === "up" ? T.ragGreen : T.ragRed, borderBottom: `1px solid ${T.dividerLight}` }}>{row.change}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: T.typeMuted, borderBottom: `1px solid ${T.dividerLight}` }}>{row.pct}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}

                {msg.bullets && (
                  <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                    {msg.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 16, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.2px" }}>{b}</li>
                    ))}
                  </ul>
                )}

                {msg.followUp && (
                  <div style={{ fontSize: 16, fontWeight: 400, color: T.typeDefault, lineHeight: "24px", letterSpacing: "0.2px", marginTop: 16 }}>{msg.followUp}</div>
                )}

                {msg.citations && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Sources</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {msg.citations.map((c, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.dividerLight}`, background: T.surfaceDefault, fontSize: 13, color: T.typeDefault }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.typeMuted, minWidth: 16 }}>{j + 1}</span>
                          <MI name="description" size={14} color={T.typeMuted} />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <FeedbackRow />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ marginBottom: 16 }}>
            <AgentHeader />
            <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
              {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: T.typeMuted, opacity: 0.5, animation: `aiDot 1.4s infinite ${j * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── INPUT AREA — white bg, AI gradient glow blur, scope bar ─── */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        {/* AI gradient glow/blur above input (matches Figma "AI Shadow") */}
        <div style={{
          position: "absolute", top: -66, left: 0, right: 0, height: 66, pointerEvents: "none",
          filter: "blur(40px)",
          background: "linear-gradient(90deg, rgba(255,255,255,0.24) 1%, rgba(255,255,255,0.24) 11%, rgba(226,46,51,0.24) 26%, rgba(219,139,255,0.24) 50%, rgba(64,105,254,0.24) 75%, rgba(255,255,255,0.24) 90%, rgba(255,255,255,0.24) 100%)",
        }} />

        <div style={{
          background: T.surfaceDefault,
          boxShadow: "-1px 1px 0px 0px rgba(0,0,0,0.1), 1px 1px 0px 0px rgba(0,0,0,0.1)",
        }}>
          {/* AI gradient stroke at top of input */}
          <div style={{ height: 2, background: "linear-gradient(90deg, rgba(226,226,229,0) 0%, #BE0C1E 15%, #AB48DA 50%, #4069FE 85%, rgba(226,226,229,0) 100%)" }} />

          {/* Prompt row */}
          <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", gap: 16 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Tell me how can I help..."
              style={{
                flex: 1, border: "none", outline: "none", fontFamily: "inherit",
                fontSize: 16, fontWeight: 400, color: T.typeDefault, background: "transparent",
                lineHeight: "24px", letterSpacing: "0.2px",
              }} />
          </div>

          {/* Bottom bar: scope + send */}
          <div style={{ padding: "8px 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            
            {/* Send button — circle, arrow up */}
            <button onClick={() => handleSend()}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                border: `1px solid ${input.trim() ? T.typeDefault : T.divider}`,
                background: input.trim() ? T.surfaceDefault : "transparent",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}>
              <MI name="arrow_upward" size={20} color={input.trim() ? T.typeDefault : T.typeMuted} />
            </button>
          </div>
        </div>
      </div>

      </>
      )}

    </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE ASK — ✦ hover button for Teardown sections
   ═══════════════════════════════════════════════════════════════════════════ */
function InlineAskButton({ sectionTitle, companyName, suggestions }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [selectedQ, setSelectedQ] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  const handleAsk = (q) => {
    setSelectedQ(q);
    setLoading(true);
    setTimeout(() => {
      setAnswer({
        text: `Based on ${companyName}'s data for this section:`,
        bullets: [
          "Analysis scoped to " + sectionTitle.toLowerCase() + " with cross-references to board materials and historical trends.",
          "Specific metrics and comparisons would be surfaced from the structured data.",
          "Recommendations tailored to the board's decision-making context.",
        ],
        citations: ["metrics_Q4_2025.json", "insights_Q4_2025.json"],
      });
      setLoading(false);
    }, 1000);
  };

  const handleClose = () => { setOpen(false); setSelectedQ(null); setAnswer(null); };

  return (
    <div style={{ position: "relative", display: "inline-flex" }} ref={btnRef}>
      <button
        onClick={() => { setOpen(!open); setSelectedQ(null); setAnswer(null); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          width: 28, height: 28, borderRadius: 6,
          border: `1px solid ${open ? T.aiStroke : hover ? T.outlineHover : "transparent"}`,
          background: open ? "rgba(177, 31, 98, 0.06)" : hover ? "rgba(177, 31, 98, 0.04)" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", opacity: hover || open ? 1 : 0,
        }}>
        <span style={{ fontSize: 14, color: T.aiStroke, lineHeight: 1 }}>✦</span>
      </button>

      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={handleClose} />
        <div style={{
          position: "absolute", top: 36, right: 0, width: 340, zIndex: 1000,
          background: T.surfaceDefault, borderRadius: 12,
          border: `1px solid ${T.dividerLight}`, boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}>
          {/* AI glow at top */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #E22E33 0%, #AB48DA 50%, #4069FE 100%)" }} />

          <div style={{ padding: 16 }}>
            {/* Context header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <SparkleIcon size={14} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault }}>Ask about {sectionTitle}</span>
            </div>

            {!selectedQ ? (
              /* Suggested questions */
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => handleAsk(q)} style={{
                    padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.dividerLight}`,
                    background: T.surfaceDefault, fontSize: 12, color: T.ocean40, cursor: "pointer",
                    textAlign: "left", fontFamily: "inherit", lineHeight: "17px", transition: "all 0.12s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; e.currentTarget.style.borderColor = T.ocean40; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.surfaceDefault; e.currentTarget.style.borderColor = T.dividerLight; }}>
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              /* Answer view */
              <div>
                {/* User question */}
                <div style={{ padding: "6px 10px", background: T.surfaceInverse, color: T.typeInverse, borderRadius: "8px 8px 4px 8px", fontSize: 12, lineHeight: "17px", marginBottom: 10 }}>
                  {selectedQ}
                </div>

                {loading ? (
                  <div style={{ display: "flex", gap: 3, padding: "10px 0" }}>
                    {[0, 1, 2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: T.typeMuted, opacity: 0.5, animation: `aiDot 1.4s infinite ${j * 0.2}s` }} />)}
                  </div>
                ) : answer && (
                  <div style={{ background: T.surfaceVariant, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, color: T.typeDefault, lineHeight: "18px", marginBottom: 8 }}>{answer.text}</div>
                    {answer.bullets && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {answer.bullets.map((b, j) => (
                          <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.indigo50, marginTop: 6, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: T.typeDefault, lineHeight: "17px" }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {answer.citations && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: T.typeMuted, marginBottom: 4 }}>Sources</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {answer.citations.map((c, j) => (
                            <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.dividerLight}`, background: T.surfaceDefault, fontSize: 10, color: T.typeDefault }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: T.typeMuted }}>{j + 1}</span>
                              <MI name="description" size={10} color={T.typeMuted} />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {answer && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    <button onClick={() => { setSelectedQ(null); setAnswer(null); }} style={{
                      fontSize: 12, color: T.typeMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <MI name="arrow_back" size={14} color={T.typeMuted} /> More questions
                    </button>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[{ icon: "content_copy", tip: "Copy" }, { icon: "thumb_up", tip: "Helpful" }, { icon: "thumb_down", tip: "Not helpful" }].map((a, j) => (
                        <button key={j} title={a.tip} style={{ width: 24, height: 24, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <MI name={a.icon} size={12} color={T.typeMuted} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>}
    </div>
  );
}

function OverviewContent({ companies }) {
  const [viewMode, setViewMode] = useState("Chart");
  const [selectedKpis, setSelectedKpis] = useState(["arr", "nrr", "grr"]);
  const [chartScope, setChartScope] = useState({});
  return (
    <>
      <div><OverviewKPISummary companies={companies} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "40px 0 24px" }}>
        <KPISel selected={selectedKpis} onChange={setSelectedKpis} />
        <Seg options={["Chart", "Table"]} value={viewMode} onChange={setViewMode} />
      </div>
      {viewMode === "Chart" ? (
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {KPI_DEFS.filter(k => selectedKpis.includes(k.key)).map(kpi => (
              <OverviewChart key={kpi.key} kpi={kpi} companies={companies}
                scopeValue={chartScope[kpi.key] || "Top 5"}
                onScopeChange={v => setChartScope(p => ({ ...p, [kpi.key]: v }))} />
            ))}
          </div>
          <div style={{ width: 340, flexShrink: 1, minWidth: 240 }}><div style={{ position: "sticky", top: 32 }}><AIPanel companies={companies} /></div></div>
        </div>
      ) : (
        <OverviewTable companies={companies} selectedKpis={selectedKpis} />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GROUP INSIGHTS TAB — Components
   ═══════════════════════════════════════════════════════════════════════════ */
function GIKPICards({ companies }) {
  const t = companies.length;
  const totalArr = companies.reduce((s, c) => s + c.arr, 0);
  const healthy = companies.filter(c => c.health === "healthy").length;
  const watch = companies.filter(c => c.health === "at_risk").length;
  const critical = companies.filter(c => c.health === "critical").length;
  const avgNrr = t ? companies.reduce((s, c) => s + c.nrr, 0) / t : 0;
  const Card = ({ label, value, dotColor }) => (
    <div style={{ flex: "1 1 130px", background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {dotColor && <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />}
        <span style={{ fontSize: 26, fontWeight: 700, color: T.typeDefault }}>{value}</span>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Card label="Companies" value={t} />
      <Card label="Total ARR" value={`$${totalArr.toFixed(0)}M`} />
      <Card label="Healthy" value={healthy} dotColor={T.ragGreen} />
      <Card label="Watch" value={watch} dotColor={T.ragAmber} />
      <Card label="Critical" value={critical} dotColor={T.ragRed} />
      <Card label="Avg NRR" value={`${avgNrr.toFixed(0)}%`} />
    </div>
  );
}

function GIExecSummary({ companies }) {
  const [collapsed, setCollapsed] = useState(false);
  const healthy = companies.filter(c => c.health === "healthy").sort((a, b) => b.arr - a.arr);
  const atRisk = companies.filter(c => c.health === "at_risk" || c.health === "critical").sort((a, b) => b.arr - a.arr);
  const totalArr = companies.reduce((s, c) => s + c.arr, 0);
  const avgEbitda = companies.length ? companies.reduce((s, c) => s + c.ebitdaMargin, 0) / companies.length : 0;
  return (
    <AIContainer>
      <div style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault }}>Executive Summary</div>
              <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}
                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <MI name={collapsed ? "expand_more" : "expand_less"} size={20} color={T.typeMuted} />
              </button>
            </div>
            {!collapsed && <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 4 }}>AI-generated portfolio analysis</div>}
          </div>
          <AIBadge />
        </div>
        {!collapsed && <>
          <p style={{ fontSize: 15, color: T.typeDefault, lineHeight: "24px", margin: "20px 0 24px" }}>
            Portfolio ARR reached ${totalArr.toFixed(0)}M, reflecting {companies.reduce((s,c)=>s+c.yoy,0)/companies.length > 20 ? "strong" : "mixed"} aggregate YoY growth. {avgEbitda > 0 ? `EBITDA margins improved to ${avgEbitda.toFixed(0)}%` : `EBITDA margins remain compressed at ${avgEbitda.toFixed(0)}%`} due to {avgEbitda > 0 ? "operational discipline" : "widespread restructuring"}, {atRisk.length > 0 ? `while liquidity remains the dominant risk with ${atRisk.length} companies on watch or critical status.` : "and portfolio health is strong across all segments."}
          </p>
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#0A6B0A", marginBottom: 8 }}><MI name="emoji_events" size={18} color="#0A6B0A" />Top Performers</div>
            {healthy.slice(0, 3).map(c => (
              <div key={c.id} style={{ fontSize: 14, color: T.typeDefault, lineHeight: "24px", marginBottom: 2 }}>
                <strong>{c.name}</strong> <span style={{ color: T.typeMuted }}>({c.sector})</span>: {c.yoy.toFixed(0)}% YoY growth, {c.ro40.toFixed(1)} Rule of 40{c.ebitdaMargin > 0 ? ", EBITDA positive" : ""}.
              </div>
            ))}
          </div>
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#D4700A", marginBottom: 8 }}><MI name="visibility" size={18} color="#D4700A" />Watch List</div>
            {atRisk.slice(0, 3).map(c => (
              <div key={c.id} style={{ fontSize: 14, color: T.typeDefault, lineHeight: "24px", marginBottom: 2 }}>
                <strong>{c.name}</strong> <span style={{ color: T.typeMuted }}>({c.sector})</span>: {c.nrr.toFixed(0)}% NRR, {c.grr.toFixed(0)}% GRR{c.ebitdaMargin < 0 ? `, ${c.ebitdaMargin.toFixed(0)}% EBITDA` : ""}.
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: T.ragRed, marginBottom: 8 }}><MI name="warning" size={18} color={T.ragRed} />Key Portfolio Risk</div>
              <div style={{ fontSize: 14, color: T.typeDefault, lineHeight: "24px" }}>Refinancing risk for high-burn companies — {atRisk.length} on watch with ${atRisk.reduce((s,c) => s + c.arr, 0).toFixed(0)}M ARR at risk in a constrained fundraising environment.</div>
            </div>
            <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: T.blue04, marginBottom: 8 }}><MI name="bolt" size={18} color={T.blue04} />Biggest Lever</div>
              <div style={{ fontSize: 14, color: T.typeDefault, lineHeight: "24px" }}>Aggressive monetization of enterprise upsell pipelines and pricing optimization to restore 70%+ gross margins across the portfolio.</div>
            </div>
          </div>
          <AIDisclaimer />
        </>}
      </div>
    </AIContainer>
  );
}

const GI_OBS = [
  { title: "SaaS Transformation Margin Lift", insight: "SaaS companies transitioning to enterprise have seen 15-20pp gross margin improvement within 3 quarters. Late-stage SaaS cohort outperforms on Rule of 40.", data: "SaaS avg Rule of 40: 38 vs portfolio: 21. Smartfin Inc saw 18pp margin lift since Q2." },
  { title: "AI Infrastructure Cost Inflation", insight: "AI/ML companies show persistent compute cost escalation compressing gross margins below the 60% threshold for venture-scale economics.", data: "AI/ML avg gross margin: 42% vs SaaS: 68%. 3 companies below 35%." },
  { title: "GTM Leadership Stability Gap", insight: "5 companies had CRO or VP Sales turnover in the past 2 quarters, correlating with declining Magic Numbers and 15-25% longer sales cycles.", data: "Avg Magic Number for affected: 0.48 vs stable leadership: 0.82." },
  { title: "Fintech Regulatory Headwind", insight: "Fintech companies facing increased compliance costs are seeing 8-12% EBITDA margin compression as new regulations take effect across multiple jurisdictions.", data: "Fintech avg EBITDA margin dropped from 14% to 6% YoY. 2 companies turned negative." },
  { title: "Net Revenue Retention Divergence", insight: "Top-quartile NRR companies (>115%) are pulling further ahead, while bottom-quartile (<95%) are accelerating losses — the middle is hollowing out.", data: "NRR spread widened from 18pp to 31pp over 4 quarters. 7 companies crossed below 100%." },
  { title: "Cash Runway Concentration Risk", insight: "6 companies have less than 12 months runway at current burn rates, creating a potential cluster of bridge rounds or down-rounds in the next 2 quarters.", data: "Avg runway for at-risk cohort: 8.4 months. Combined capital need: ~$180M." },
  { title: "Enterprise Upsell Momentum", insight: "Companies with dedicated enterprise expansion teams show 2.3x higher net new ARR per account compared to those relying on product-led growth alone.", data: "Enterprise-motion NRR: 118% avg vs PLG-only: 103%. 4 companies added enterprise motion in Q3." },
  { title: "Geographic Expansion Drag", insight: "Companies expanding into new geographies show 18-month revenue contribution delays with 30-40% higher CAC during the ramp period.", data: "Avg CAC payback for new-geo cohorts: 28 months vs home market: 14 months." },
  { title: "Customer Concentration Risk", insight: "3 portfolio companies derive >40% of ARR from their top 5 accounts, creating significant revenue volatility if any single contract churns.", data: "Top-5 account concentration: 42% avg for flagged companies. Largest single-account exposure: $12M ARR." },
  { title: "DevTools Adoption Ceiling", insight: "Developer-focused tools hit a natural ceiling at ~$30M ARR without pivoting to platform or enterprise. All 3 DevTools companies are approaching this threshold.", data: "DevTools avg ARR: $26M, growth decelerated from 45% to 18% YoY over 3 quarters." },
  { title: "Sales Efficiency Recovery", insight: "Companies that restructured sales teams in H1 are showing early signs of efficiency recovery, with Magic Numbers trending back toward 0.7+ after bottoming at 0.4.", data: "Restructured cohort (5 companies) Magic Number: 0.62 avg, up from 0.41 two quarters ago." },
  { title: "Healthcare Compliance Moat", insight: "HealthTech companies with SOC 2 + HIPAA certifications show 25% lower logo churn and command 15-20% pricing premiums vs non-certified competitors.", data: "Certified HealthTech logo churn: 4.2% vs non-certified: 7.8%. Avg ACV premium: 18%." },
];

function GIKeyObservations() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_COUNT = 6;
  const visible = showAll ? GI_OBS : GI_OBS.slice(0, VISIBLE_COUNT);
  const hasMore = GI_OBS.length > VISIBLE_COUNT;
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Key Observations</div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px", marginBottom: 20 }}>By theme across portfolio</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {visible.map((o, i) => (
          <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.typeDefault, marginBottom: 10 }}>{o.title}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 4 }}>Insight</div>
              <div style={{ fontSize: 13, color: T.typeDefault, lineHeight: "20px", marginBottom: 14 }}>{o.insight}</div>
              <div style={{ marginTop: "auto", padding: "10px 12px", background: T.surfaceVariant, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 4 }}>Supporting Data</div>
                <div style={{ fontSize: 12, color: T.typeMuted, lineHeight: "18px" }}>{o.data}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 16, width: "100%", padding: "12px 0", background: T.surfaceVariant, border: `1px solid ${T.dividerLight}`, borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.typeMuted, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = "#EBEBEB"}
          onMouseLeave={e => e.currentTarget.style.background = T.surfaceVariant}>
          <MI name={showAll ? "expand_less" : "expand_more"} size={16} color={T.typeMuted} />
          {showAll ? "Show less" : `Show all ${GI_OBS.length} observations`}
        </button>
      )}
    </div>
  );
}

function GIRetentionGrowth({ companies, groupBy }) {
  const dim = groupBy === "Sector" ? "sector" : "stage";
  const groups = groupBy === "Sector" ? SECTORS : STAGES;

  /* RAG thresholds */
  const nrrColor = v => v >= 105 ? T.ragGreen : v >= 95 ? "#FE8E22" : T.ragRed;
  const yoyColor = v => v >= 20 ? T.ragGreen : v >= 5 ? "#FE8E22" : T.ragRed;

  /* Sector/Stage aggregated data */
  const buildGroup = (key, colorFn) => groups.map(g => {
    const cos = companies.filter(c => c[dim] === g);
    if (!cos.length) return null;
    const avg = cos.reduce((s, c) => s + c[key], 0) / cos.length;
    return { name: g, value: Math.round(avg * 10) / 10, fill: colorFn(avg) };
  }).filter(Boolean).sort((a, b) => b.value - a.value);

  const nrrData = buildGroup("nrr", nrrColor);
  const yoyData = buildGroup("yoy", yoyColor);

  const barHeight = 44;
  const barGap = "28%";
  const fontSize = 12;
  const yWidth = 100;

  const MiniChart = ({ data, title, sub, fmt, axisLabel, thresholds }) => (
    <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: T.typeMuted, marginBottom: 12 }}>{sub}</div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, padding: "8px 12px", background: T.surfaceVariant, borderRadius: 8 }}>
        {thresholds.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: t.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: T.typeMuted, letterSpacing: "0.2px", whiteSpace: "nowrap" }}>{t.label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={data.length * barHeight + 30}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, bottom: 16, left: 0 }} barCategoryGap={barGap}>
          <XAxis type="number" tick={{ fontSize: 11, fill: T.typeMuted, fontFamily: "Plus Jakarta Sans" }} axisLine={{ stroke: T.dividerLight }} tickLine={false} tickFormatter={fmt}>
            <text x="50%" y="100%" textAnchor="middle" fontSize={11} fill={T.typeMuted} dy={12}>{axisLabel}</text>
          </XAxis>
          <YAxis type="category" dataKey="name" width={yWidth} tick={{ fontSize, fontWeight: 500, fill: T.typeDefault, fontFamily: "Plus Jakarta Sans" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${T.dividerLight}`, fontSize: 13, fontFamily: "Plus Jakarta Sans" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const sub = `Averaged by ${groupBy.toLowerCase()}`;
  const thresholds = [
    { color: T.ragGreen, label: "Strong" },
    { color: "#FE8E22", label: "Watch" },
    { color: T.ragRed, label: "At Risk" },
  ];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Retention & Growth</div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px" }}>
        Performance averaged by {groupBy.toLowerCase()}
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <MiniChart data={nrrData} title="Net Revenue Retention" sub={sub} fmt={v => `${v}%`} axisLabel="NRR %" thresholds={thresholds} />
        <MiniChart data={yoyData} title="Year-over-Year Growth" sub={sub} fmt={v => `${v}%`} axisLabel="YoY Growth %" thresholds={thresholds} />
      </div>
    </div>
  );
}

function GIScorecard({ companies }) {
  const [sortKey, setSortKey] = useState("arr");
  const [sortAsc, setSortAsc] = useState(false);
  const [healthFilter, setHealthFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const toggleSort = k => { if (k === sortKey) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false); } };
  const filtered = companies.filter(c =>
    (healthFilter === "All" || (healthFilter === "Healthy" && c.health === "healthy") || (healthFilter === "Watch" && c.health === "at_risk") || (healthFilter === "Critical" && c.health === "critical"))
  );
  const sorted = [...filtered].sort((a, b) => sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
  const VISIBLE_COUNT = 20;
  const visibleRows = showAll ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hasMore = sorted.length > VISIBLE_COUNT;
  const hc = h => ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[h]);
  const cols = [
    { key: "arr", label: "ARR", fmt: v => `$${v.toFixed(1)}M` },
    { key: "qoq", label: "QoQ", fmt: v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` },
    { key: "yoy", label: "YoY", fmt: v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%` },
    { key: "grr", label: "GRR", fmt: v => `${v.toFixed(0)}%` },
    { key: "nrr", label: "NRR", fmt: v => `${v.toFixed(0)}%` },
    { key: "ebitdaMargin", label: "EBITDA", fmt: v => `${v.toFixed(0)}%` },
    { key: "ro40", label: "Ro40", fmt: v => v.toFixed(1) },
  ];
  const SI = ({ k }) => { const a = sortKey === k; return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, opacity: a ? 1 : 0.5 }}><MI name={a ? (sortAsc ? "expand_less" : "expand_more") : "unfold_more"} size={16} color={a ? T.typeDefault : T.typeMuted} /></span>; };
  return (
    <div>
      {/* Section header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Portfolio Scorecard</div>
        <DSSelect value={healthFilter} options={["All","Healthy","Watch","Critical"]} onChange={setHealthFilter} triggerLabel="Health" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px", marginBottom: 20 }}>All companies' financial metrics</div>

      {/* Table only in container */}
      <div style={{ background: T.surfaceDefault, borderBottom: `1px solid ${T.dividerLight}`, borderRadius: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              <th style={{ position: "sticky", left: 0, background: "#F3F3F3", zIndex: 10, padding: "0 12px", height: 40, textAlign: "center", fontWeight: 600, fontSize: 11, width: 44, borderBottom: `1px solid ${T.divider}` }}>Status</th>
              <th style={{ position: "sticky", left: 44, background: "#F3F3F3", zIndex: 10, padding: "0 12px", height: 40, textAlign: "left", fontWeight: 600, fontSize: 11, minWidth: 160, borderBottom: `1px solid ${T.divider}`, borderRight: `1px solid ${T.dividerLight}` }}>Company</th>
              <th style={{ padding: "0 12px", height: 40, textAlign: "left", fontWeight: 600, fontSize: 11, background: "#F3F3F3", borderBottom: `1px solid ${T.divider}` }}>Sector</th>
              {cols.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)} style={{ padding: "0 12px", height: 40, textAlign: "right", fontWeight: 600, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", background: "#F3F3F3", borderBottom: `1px solid ${T.divider}`, userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>{c.label}<SI k={c.key} /></div>
                </th>
              ))}
            </tr></thead>
            <tbody>{visibleRows.map(c => (
              <tr key={c.id} onMouseEnter={e => { for (const td of e.currentTarget.children) td.style.background = "#FAFAFA"; }} onMouseLeave={e => { for (const td of e.currentTarget.children) td.style.background = T.surfaceDefault; }}>
                <td style={{ position: "sticky", left: 0, background: T.surfaceDefault, zIndex: 5, padding: "0 12px", height: 40, borderBottom: `1px solid ${T.dividerLight}`, textAlign: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: hc(c.health), display: "inline-block" }} />
                </td>
                <td style={{ position: "sticky", left: 44, background: T.surfaceDefault, zIndex: 5, padding: "0 12px", height: 40, borderBottom: `1px solid ${T.dividerLight}`, borderRight: `1px solid ${T.dividerLight}` }}>
                  <span style={{ fontWeight: 500, color: T.ocean40, cursor: "pointer" }}>{c.name}</span>
                </td>
                <td style={{ padding: "0 12px", height: 40, fontSize: 12, color: T.typeMuted, borderBottom: `1px solid ${T.dividerLight}`, background: T.surfaceDefault }}>{c.sector}</td>
                {cols.map(col => (
                  <td key={col.key} style={{ padding: "0 12px", height: 40, textAlign: "right", color: T.typeDefault, fontSize: 13, whiteSpace: "nowrap", borderBottom: `1px solid ${T.dividerLight}`, background: T.surfaceDefault }}>{col.fmt(c[col.key])}</td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 14, color: T.typeMuted }}>No companies match selected filters</div>}
        {hasMore && (
          <button onClick={() => setShowAll(!showAll)} style={{ width: "100%", padding: "12px 0", background: T.surfaceVariant, border: "none", borderTop: `1px solid ${T.dividerLight}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.typeMuted, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = "#EBEBEB"}
            onMouseLeave={e => e.currentTarget.style.background = T.surfaceVariant}>
            <MI name={showAll ? "expand_less" : "expand_more"} size={16} color={T.typeMuted} />
            {showAll ? "Show less" : `Show all ${sorted.length} companies`}
          </button>
        )}
      </div>
    </div>
  );
}

const GI_ACTIONS = [
  { priority: "Immediate Action Required", icon: "error", iconColor: T.ragRed, items: ["Initiate cash runway review for all companies below 12-month runway.","Conduct strategic review of critical-status companies.","Require monthly board updates from all watch-list companies."] },
  { priority: "Accelerate / Double Down", icon: "trending_up", iconColor: T.ragGreen, items: ["Fast-track enterprise upsell programs across top SaaS and Fintech companies.","Support AI/ML companies in reducing compute costs."] },
  { priority: "Portfolio-Wide Initiatives", icon: "lightbulb", iconColor: T.ragAmber, items: ["Launch portfolio-wide procurement consortium to reduce SaaS/cloud costs by 15-20%."] },
];

function GIActionItems() {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Action Items</div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px", marginBottom: 20 }}>Recommended actions for portfolio entity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GI_ACTIONS.map((a, i) => (
          <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <MI name={a.icon} size={20} color={a.iconColor} />
              <span style={{ fontSize: 15, fontWeight: 700, color: a.iconColor }}>{a.priority}</span>
            </div>
            {a.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: 10, marginBottom: j < a.items.length - 1 ? 6 : 0 }}>
                <span style={{ color: T.typeMuted, fontWeight: 700, fontSize: 14, lineHeight: "22px", flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 14, color: T.typeDefault, lineHeight: "22px" }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const GI_HIDDEN_RISKS = [
  { risk: "Correlated churn risk across 4 Fintech companies sharing the same banking-as-a-service provider — a single vendor failure could trigger simultaneous NRR declines.", severity: "high" },
  { risk: "AI/ML compute cost exposure is unhedged — 6 companies rely on spot pricing for 60%+ of GPU capacity, creating unpredictable COGS volatility.", severity: "high" },
  { risk: "Key-person dependency: 3 portfolio companies have a single technical co-founder controlling all architecture decisions with no succession plan.", severity: "high" },
  { risk: "Regulatory convergence risk: EU AI Act, DORA, and NIS2 requirements overlap for 8 companies, but none have unified compliance architectures — duplicated costs could reach $2-4M each.", severity: "medium" },
  { risk: "Customer concentration in government contracts: 4 companies derive 30%+ of ARR from public sector deals subject to budget cycle freezes.", severity: "medium" },
  { risk: "Technical debt accumulation: 5 companies deferred platform migrations to hit growth targets, creating compounding re-architecture costs estimated at 2-3 quarters of engineering capacity.", severity: "medium" },
  { risk: "Cross-portfolio talent poaching: 3 instances of senior engineers moving between portfolio companies in Q4, creating IP transfer concerns and relationship friction.", severity: "low" },
  { risk: "FX exposure for APAC-heavy companies (4 total) is largely unhedged, with JPY and INR volatility creating 5-8% revenue reporting variance.", severity: "medium" },
  { risk: "Open-source dependency: 2 DevTools companies build on frameworks with uncertain governance — a licensing change (SSPL-style) could force costly re-implementation.", severity: "low" },
  { risk: "Valuation mark-down clustering: 7 companies have not raised since 2022, creating a potential wave of down-round revaluations if bridge financing is required simultaneously.", severity: "high" },
];

function GIHiddenRisks() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 5;
  const visible = showAll ? GI_HIDDEN_RISKS : GI_HIDDEN_RISKS.slice(0, VISIBLE);
  const sevColor = { high: T.ragRed, medium: T.ragAmber, low: T.typeMuted };
  const sevBg = { high: "rgba(160,21,22,0.06)", medium: "rgba(254,142,34,0.06)", low: "rgba(0,0,0,0.03)" };
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Hidden Risks</div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px", marginBottom: 20 }}>Portfolio-level blind spots and emerging threats</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((r, i) => (
          <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <MI name="warning" size={18} color={sevColor[r.severity]} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 14, color: T.typeDefault, lineHeight: "22px" }}>{r.risk}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: sevColor[r.severity], background: sevBg[r.severity], padding: "2px 8px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>{r.severity}</span>
          </div>
        ))}
      </div>
      {GI_HIDDEN_RISKS.length > VISIBLE && (
        <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 14, width: "100%", padding: "10px 0", background: T.surfaceVariant, border: `1px solid ${T.dividerLight}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.typeMuted, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = "#EBEBEB"}
          onMouseLeave={e => e.currentTarget.style.background = T.surfaceVariant}>
          <MI name={showAll ? "expand_less" : "expand_more"} size={16} color={T.typeMuted} />
          {showAll ? "Show less" : `Show all ${GI_HIDDEN_RISKS.length} risks`}
        </button>
      )}
    </div>
  );
}

const INITIATIVE_CATEGORIES = {
  operational: { label: "operational", color: "#0A6B0A", bg: "rgba(21,160,21,0.08)" },
  capital_allocation: { label: "capital allocation", color: "#6B3FA0", bg: "rgba(107,63,160,0.08)" },
  risk_mitigation: { label: "risk mitigation", color: "#D4700A", bg: "rgba(254,142,34,0.08)" },
  strategic_positioning: { label: "strategic positioning", color: "#1A6FA0", bg: "rgba(42,93,170,0.08)" },
};

const GI_INITIATIVES = [
  { title: "Bio-Compute Shared Services Consortium", desc: "Addressing the 'AI Tax' by negotiating collective AWS/NVIDIA capacity to restore Gross Margins by 4-6pp across discovery platforms.", cat: "operational" },
  { title: "Internal Portfolio Secondary/Bridge Fund", desc: "Allocate $50M for defensive bridge notes to prevent IP fire-sales in the Seed/Pre-Clinical cohort during clinical filing delays.", cat: "capital_allocation" },
  { title: "Centralized CleanTech Regulatory Task Force", desc: "Regulatory friction (DOE audits, EU AI Act) delayed $80M in aggregate revenue in H2 FY2025.", cat: "risk_mitigation" },
  { title: "Automated Scope 3 Data Ingestion Hub", desc: "Standardizing data ingestion across Sustainclean and Purepure can reduce CAC by 15% via shared infra.", cat: "operational" },
  { title: "Project Quantize: Portfolio AI Cost Reduction", desc: "Average AI Tax is 6.5% of ARR; moving 30% of inference to local/proprietary models recovers $3.4M in gross profit across the group.", cat: "operational" },
  { title: "ASEAN Regulatory Shared Services Hub", desc: "High fine recurrence in Indonesia/Vietnam ($10M+ aggregate 2025 impact) necessitates a unified compliance and data residency architecture.", cat: "risk_mitigation" },
  { title: "GPU Cost Optimization Program", desc: "Inference costs are eroding group margins by 400bps; centralized procurement of reserved GPU instances can restore 150-200bps.", cat: "operational" },
  { title: "EMEA Sovereign Cloud Hub", desc: "Capitalize on NIS2 compliance: 8 companies currently lack a DACH/Warsaw-based data residency solution.", cat: "strategic_positioning" },
  { title: "AUKUS Cross-Portfolio Procurement Framework", desc: "Leveraging the collective $4B scale of the portfolio to lobby for unified 'Sovereign' status across Five Eyes markets.", cat: "strategic_positioning" },
  { title: "Margin Recovery Task Force (Vertical Sensor Integration)", desc: "Addressing the 10-15% margin leak to component providers by vertically integrating sensor housing and logistics.", cat: "operational" },
  { title: "Cross-Portfolio Logistics Consolidation", desc: "Leverage Hypershop and Gettia's automated hubs to provide 3PL services to Seed-stage companies, reducing their unit costs by an estimated 15%.", cat: "operational" },
  { title: "Series A Bridge Facility", desc: "Establish a $50M internal credit facility to bridge the 4 companies facing terminal runway gaps, protecting equity value ahead of late-2026 IPO windows.", cat: "capital_allocation" },
  { title: "Internal SLM Deployment Taskforce", desc: "Gross margins are lagging targets by 320bps due to third-party API costs; fine-tuning open-source models can reclaim this margin.", cat: "operational" },
  { title: "DACH/ASEAN Regulatory Lobbying Consortium", desc: "6 of 14 companies report growth delays due to GDPR and data sovereignty; a unified compliance architecture can serve as a shared moat.", cat: "strategic_positioning" },
  { title: "Automated Ledger Consolidation Framework", desc: "Gross margins are being eroded by legacy maintenance; unifying on Apex/Nexus modules saves $1.8M/year in COGS.", cat: "operational" },
  { title: "Strategic Seed Bridge Pool", desc: "2 of 14 assets have <4 months runway; a structured $5M pool prevents distressed asset liquidation of validated IP.", cat: "capital_allocation" },
  { title: "Project Janus: AI Compute Efficiency", desc: "Portfolio's gross margins have dropped 700bps due to AI inference costs; standardizing on tiered SLMs will recover 400bps.", cat: "operational" },
  { title: "Sovereign Cloud Shared Service", desc: "Multiple companies are replicating high-cost data residency deployments in Germany and France; a shared infrastructure layer could reduce OpEx by 15%.", cat: "risk_mitigation" },
  { title: "Mexico-US Border Automation Corridor", desc: "Leverage Neohaul's success to create a cross-portfolio GTM for automotive and electronics logistics.", cat: "strategic_positioning" },
  { title: "Portfolio Series A Bridge Facility", desc: "Protect early-stage technical moats (Prodly, Nextmake) from distressed valuations during the current liquidity squeeze.", cat: "capital_allocation" },
  { title: "ASEAN Supply Chain Shared Service", desc: "Leverage $3.3B aggregate scale to negotiate fixed-rate capacitor and sensor contracts for the new Vietnam hub.", cat: "operational" },
  { title: "Unified Infrastructure Synergy Hub", desc: "Cross-portfolio cloud and AI compute spending is uncoordinated. Group-level negotiation could save $5M+ across the 8 companies.", cat: "operational" },
  { title: "Portfolio Venture Debt Buffer", desc: "3 of 8 companies have runways < 10 months. Securing a sector-wide credit facility would de-risk current 'At Risk' transitions.", cat: "capital_allocation" },
  { title: "Cross-Portfolio Infrastructure Consolidation", desc: "Collective bargaining with hyperscalers can recover an estimated $120M in aggregate annual cloud spend.", cat: "operational" },
  { title: "Seed Cohort Bridge Financing Fund", desc: "7 assets with strong product-market fit face insolvency due to external funding delays.", cat: "capital_allocation" },
];

function GIPortfolioInitiatives() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 8;
  const visible = showAll ? GI_INITIATIVES : GI_INITIATIVES.slice(0, VISIBLE);
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Portfolio-Wide Initiatives</div>
      <div style={{ fontSize: 16, fontWeight: 400, color: T.typeMuted, lineHeight: "24px", marginBottom: 20 }}>Cross-portfolio actions and investments</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((item, i) => {
          const cat = INITIATIVE_CATEGORIES[item.cat];
          return (
            <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, lineHeight: "20px", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: T.typeMuted, lineHeight: "20px" }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: cat.color, background: cat.bg, padding: "3px 10px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.2px", marginTop: 2 }}>{cat.label}</span>
            </div>
          );
        })}
      </div>
      {GI_INITIATIVES.length > VISIBLE && (
        <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 14, width: "100%", padding: "10px 0", background: T.surfaceVariant, border: `1px solid ${T.dividerLight}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.typeMuted, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = "#EBEBEB"}
          onMouseLeave={e => e.currentTarget.style.background = T.surfaceVariant}>
          <MI name={showAll ? "expand_less" : "expand_more"} size={16} color={T.typeMuted} />
          {showAll ? "Show less" : `Show all ${GI_INITIATIVES.length} initiatives`}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PULSE TAB — Portfolio Alert Center
   ═══════════════════════════════════════════════════════════════════════════ */

function computePulseData(companies) {
  const healthOrder = { critical: 0, at_risk: 1, healthy: 2 };

  // ── Health status changes ──
  const allHealthChanges = companies.filter(c => c.health !== c.prevHealth).map(c => {
    let driver = "";
    if (healthOrder[c.health] < healthOrder[c.prevHealth]) {
      if (c.nrr < 100) driver = `NRR contracted to ${c.nrr.toFixed(0)}% (was ${c.prevNrr.toFixed(0)}%)`;
      else if (c.grr < 80) driver = `GRR declined to ${c.grr.toFixed(0)}%`;
      else if (c.yoy < 10) driver = `YoY growth slowed to ${c.yoy.toFixed(0)}%`;
      else if (c.ebitdaMargin < -10) driver = `EBITDA margin at ${c.ebitdaMargin.toFixed(0)}%`;
      else driver = `Multiple metrics below threshold`;
    } else {
      if (c.nrr - c.prevNrr > 5) driver = `NRR improved to ${c.nrr.toFixed(0)}%`;
      else if (c.yoy > 25) driver = `ARR growth accelerated to ${c.yoy.toFixed(0)}% YoY`;
      else driver = `Broad metric improvement`;
    }
    return { ...c, driver, worsened: healthOrder[c.health] < healthOrder[c.prevHealth] };
  }).sort((a, b) => {
    if (a.worsened !== b.worsened) return a.worsened ? -1 : 1;
    return healthOrder[a.health] - healthOrder[b.health];
  });
  const worsened = allHealthChanges.filter(c => c.worsened);
  const improved = allHealthChanges.filter(c => !c.worsened);

  // ── Portfolio-level deltas ──
  const totalArrNow = companies.reduce((s, c) => s + c.arr, 0);
  const totalArrPrev = companies.reduce((s, c) => s + c.prevArr, 0);
  const arrChangePct = ((totalArrNow - totalArrPrev) / totalArrPrev * 100);
  const avgNrrNow = companies.reduce((s, c) => s + c.nrr, 0) / companies.length;
  const avgNrrPrev = companies.reduce((s, c) => s + c.prevNrr, 0) / companies.length;
  const nrrChangePp = avgNrrNow - avgNrrPrev;
  const avgGrrNow = companies.reduce((s, c) => s + c.grr, 0) / companies.length;
  const avgGrrPrev = companies.reduce((s, c) => s + c.prevGrr, 0) / companies.length;
  const grrChangePp = avgGrrNow - avgGrrPrev;

  // ── Sector NRR analysis ──
  const SECTORS_USED = [...new Set(companies.map(c => c.sector))];
  const sectorNrrDeltas = SECTORS_USED.map(s => {
    const sc = companies.filter(c => c.sector === s);
    const avgDelta = sc.reduce((sum, c) => sum + (c.nrr - c.prevNrr), 0) / sc.length;
    return { sector: s, avgDelta, count: sc.length };
  }).sort((a, b) => a.avgDelta - b.avgDelta);
  const worstNrrSector = sectorNrrDeltas[0];

  // ── Runway alerts ──
  const lowRunway = companies.filter(c => c.runway && c.runway < 12 && c.runway > 0);

  // ── Key Movers (biggest ARR swings) ──
  const arrMovers = companies.map(c => ({
    ...c, arrDeltaPct: ((c.arr - c.prevArr) / c.prevArr * 100),
  })).filter(c => Math.abs(c.arrDeltaPct) > 5).sort((a, b) => Math.abs(b.arrDeltaPct) - Math.abs(a.arrDeltaPct));

  // ── Positive Signals ──
  const positiveSignals = [];
  improved.forEach(c => positiveSignals.push({ company: c, type: "health_improved", text: `Improved from ${c.prevHealth === "critical" ? "Critical" : "Watch"} to ${c.health === "healthy" ? "Healthy" : "Watch"}`, detail: c.driver }));
  companies.filter(c => c.ebitdaMargin > 0 && c.ebitdaMarginPrev < 0).forEach(c => positiveSignals.push({ company: c, type: "profitability", text: "Reached EBITDA profitability", detail: `Margin moved from ${c.ebitdaMarginPrev.toFixed(0)}% to ${c.ebitdaMargin.toFixed(0)}%` }));
  companies.filter(c => c.nrr >= 120 && c.prevNrr < 120).forEach(c => positiveSignals.push({ company: c, type: "nrr_milestone", text: "NRR crossed 120%", detail: `${c.prevNrr.toFixed(0)}% → ${c.nrr.toFixed(0)}%` }));
  companies.filter(c => c.yoy > 40 && ((c.arr - c.prevArr) / c.prevArr * 100) > 8).forEach(c => {
    if (!positiveSignals.find(p => p.company.id === c.id)) positiveSignals.push({ company: c, type: "strong_growth", text: "Accelerating growth", detail: `${c.yoy.toFixed(0)}% YoY, ARR +${((c.arr - c.prevArr) / c.prevArr * 100).toFixed(1)}% QoQ` });
  });

  // ── Alerts (AI-prioritized) ──
  const alerts = [];
  const newCritical = worsened.filter(c => c.health === "critical");
  if (newCritical.length > 0) {
    alerts.push({ id: "critical", severity: "critical", icon: "error", title: `${newCritical.length} ${newCritical.length === 1 ? "company" : "companies"} moved to Critical`, description: `${newCritical.map(c => c.name).join(", ")} deteriorated to Critical. ${newCritical[0].driver}.`, companies: newCritical,
      actions: [...newCritical.map(c => ({ label: `Review ${c.name}`, icon: "open_in_new", type: "navigate", companyId: c.id })), { label: "Draft escalation memo", icon: "auto_awesome", type: "agent", agentAction: "escalation_memo", context: newCritical }] });
  }
  const newWatch = worsened.filter(c => c.health === "at_risk");
  if (newWatch.length > 0) {
    alerts.push({ id: "watch", severity: "warning", icon: "warning", title: `${newWatch.length} ${newWatch.length === 1 ? "company" : "companies"} moved to Watch`, description: `${newWatch.slice(0, 3).map(c => c.name).join(", ")}${newWatch.length > 3 ? ` +${newWatch.length - 3} more` : ""} declined from Healthy. ${newWatch[0].driver}.`, companies: newWatch,
      actions: [{ label: "View in Group Insights", icon: "open_in_new", type: "navigate", navAction: "gi" }, { label: "Draft board talking points", icon: "auto_awesome", type: "agent", agentAction: "board_talking_points", context: newWatch }] });
  }
  if (lowRunway.length > 0) {
    alerts.push({ id: "runway", severity: "critical", icon: "local_gas_station", title: `${lowRunway.length} ${lowRunway.length === 1 ? "company has" : "companies have"} runway < 12 months`, description: `${lowRunway.map(c => `${c.name} (${c.runway.toFixed(0)}mo)`).join(", ")}. Additional funding needed within the year.`, companies: lowRunway,
      actions: [...lowRunway.slice(0, 2).map(c => ({ label: `Review ${c.name}`, icon: "open_in_new", type: "navigate", companyId: c.id })), { label: "Draft funding risk summary", icon: "auto_awesome", type: "agent", agentAction: "funding_risk", context: lowRunway }] });
  }
  if (worstNrrSector && worstNrrSector.avgDelta < -3) {
    alerts.push({ id: "sector-nrr", severity: "warning", icon: "trending_down", title: `${worstNrrSector.sector} NRR declined ${Math.abs(worstNrrSector.avgDelta).toFixed(1)}pp`, description: `Average NRR across ${worstNrrSector.count} ${worstNrrSector.sector} companies dropped — the largest sector-level retention decline.`, companies: companies.filter(c => c.sector === worstNrrSector.sector),
      actions: [{ label: `View ${worstNrrSector.sector} cohort`, icon: "open_in_new", type: "navigate", navAction: "sector", sector: worstNrrSector.sector }, { label: "Draft sector analysis", icon: "auto_awesome", type: "agent", agentAction: "sector_analysis", context: { sector: worstNrrSector.sector, delta: worstNrrSector.avgDelta } }] });
  }

  return { alerts, allHealthChanges, worsened, improved, arrMovers, positiveSignals, totalArrNow, arrChangePct, avgNrrNow, nrrChangePp, avgGrrNow, grrChangePp };
}

/* Agent action draft generator */
function generateAgentDraft(agentAction, context) {
  switch (agentAction) {
    case "escalation_memo": { const names = (context || []).map(c => c.name); return { title: "Executive Escalation Memo", content: `TO: Leadership Team\nFROM: Portfolio Intelligence\nDATE: February 2026\nRE: Urgent — ${names.length} Portfolio ${names.length === 1 ? "Company" : "Companies"} Moved to Critical\n\nSUMMARY\n${names.join(", ")} ${names.length === 1 ? "has" : "have"} moved to Critical status in Q4 2025.\n\nKEY FINDINGS\n${(context || []).map((c, i) => `${i + 1}. ${c.name}: ${c.driver}. ARR: $${c.arr.toFixed(1)}M, NRR: ${c.nrr.toFixed(0)}%, GRR: ${c.grr.toFixed(0)}%.`).join("\n")}\n\nRECOMMENDED ACTIONS\n1. Schedule emergency portfolio review within 2 weeks\n2. Request updated financial projections and revised operating plans\n3. Evaluate follow-on investment thesis\n4. Assess board-level intervention requirements` }; }
    case "board_talking_points": { const names = (context || []).map(c => c.name); return { title: "Board Discussion Points", content: `BOARD TALKING POINTS — Q4 2025\n\nCOMPANIES REQUIRING DISCUSSION\n${names.slice(0, 5).join(", ")} moved to Watch status.\n\nKEY THEMES\n• Retention headwinds across Watch companies\n• Growth deceleration patterns emerging\n• Macro environment contributing to elongated sales cycles\n\nDISCUSSION QUESTIONS\n1. Company-specific or broader portfolio trend?\n2. Operational support options to stabilize retention?\n3. Follow-on investment framework adjustments needed?\n\n${(context || []).slice(0, 3).map(c => `• ${c.name}: ${c.driver}`).join("\n")}` }; }
    case "funding_risk": { return { title: "Funding Risk Summary", content: `FUNDING RISK — Q4 2025\n\nCOMPANIES WITH RUNWAY < 12 MONTHS\n${(context || []).map(c => `• ${c.name}: ${c.runway.toFixed(0)}mo runway | ARR $${c.arr.toFixed(1)}M`).join("\n")}\n\nRECOMMENDED ACTIONS\n1. Initiate conversations about path to profitability or bridge financing\n2. Review pro-rata rights and follow-on allocation\n3. Assess co-investor willingness for bridge rounds\n4. Request 18-month projections with multiple scenarios` }; }
    case "sector_analysis": { const { sector, delta } = context || {}; return { title: `${sector} NRR Analysis`, content: `SECTOR ANALYSIS — ${(sector || "").toUpperCase()}\n\nAverage NRR declined ${Math.abs(delta || 0).toFixed(1)}pp this quarter.\n\nPOTENTIAL DRIVERS\n• Market saturation limiting expansion revenue\n• Competitive pressure compressing deal sizes\n• Customer consolidation reducing wallet share\n\nRECOMMENDED ACTIONS\n1. Convene ${sector} founders for cohort discussion\n2. Analyze NRR decline by customer segment\n3. Evaluate competitive dynamics\n4. Engage operating partners for retention support` }; }
    case "portfolio_highlights": { const names = (context || []).map(c => c.name); return { title: "Portfolio Highlights — Q4 2025", content: `POSITIVE DEVELOPMENTS\n${names.length} companies improved health status: ${names.slice(0, 5).join(", ")}.\n\nKEY WINS\n${(context || []).slice(0, 3).map((c, i) => `${i + 1}. ${c.name}: ${c.driver}`).join("\n")}\n\nLP COMMUNICATION POINTS\n• Portfolio showing resilience with improving retention and growth\n• Operational improvements translating into measurable outcomes\n• Strong performers demonstrating path to category leadership` }; }
    default: return { title: "Generated Draft", content: "Draft content generated here." };
  }
}

function PulseContent({ companies, onCompanyClick, onSectorClick }) {
  const pulse = useMemo(() => computePulseData(companies), [companies]);
  const [agentModal, setAgentModal] = useState(null);
  const [showAllHealth, setShowAllHealth] = useState(false);
  const [openAlertMenu, setOpenAlertMenu] = useState(null);
  const healthLabel = { healthy: "Healthy", at_risk: "Watch", critical: "Critical" };
  const healthColor = { healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed };
  const HEALTH_VISIBLE = 5;

  const handleAgentAction = (agentAction, context) => {
    setAgentModal({ title: "Generating...", content: "", generating: true });
    setTimeout(() => { setAgentModal({ ...generateAgentDraft(agentAction, context), generating: false }); }, 1500);
  };
  const handleNav = (action) => {
    if (action.companyId) onCompanyClick(action.companyId);
    else if (action.navAction === "sector" && action.sector) onSectorClick(action.sector);
    else if (action.navAction === "gi") onSectorClick(null);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sevStyles = {
    critical: { icon: T.ragRed, label: "urgent", bg: "rgba(160,21,22,0.06)" },
    warning: { icon: T.ragAmber, label: "attention", bg: "rgba(254,142,34,0.06)" },
  };

  /* ── Summary card data ── */
  const cards = [
    { id: "pulse-alerts", count: pulse.alerts.length, label: "Alerts", color: pulse.alerts.length > 0 ? T.ragRed : T.typeDefault, accent: pulse.alerts.length > 0 ? T.ragRed : T.ragGreen },
    { id: "pulse-health", count: pulse.allHealthChanges.length, label: "Status Changes", color: T.typeDefault, accent: pulse.allHealthChanges.length > 0 ? T.ragAmber : T.typeMuted },
    { id: "pulse-movers", count: pulse.arrMovers.length, label: "Key Movers", color: T.typeDefault, accent: T.blue04 },
    { id: "pulse-positive", count: pulse.positiveSignals.length, label: "Positive Signals", color: pulse.positiveSignals.length > 0 ? T.ragGreen : T.typeDefault, accent: T.ragGreen },
  ];

  const visibleHealth = showAllHealth ? pulse.allHealthChanges : pulse.allHealthChanges.slice(0, HEALTH_VISIBLE);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Portfolio Pulse</div>
          <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 4 }}>Proactive alerts and portfolio changes since your last data extraction.</div>
          <div style={{ fontSize: 13, color: T.typeMuted, marginTop: 4 }}>Q4 2025 vs Q3 2025 · {companies.length} companies · Generated Jan 15, 2026</div>
        </div>
        <AIBadge />
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => scrollTo(card.id)} style={{
            flex: "1 1 180px", background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12,
            padding: "16px 20px", cursor: "pointer", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = card.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.dividerLight; }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>{card.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: card.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 1: ALERTS
         ════════════════════════════════════════════════════════════════════════ */}
      <div id="pulse-alerts" style={{ marginBottom: 40, scrollMarginTop: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault }}>Alerts</span>
          <span style={{ fontSize: 12, color: T.typeMuted }}>({pulse.alerts.length})</span>
        </div>

        {pulse.alerts.length === 0 ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <MI name="check_circle" size={18} color={T.ragGreen} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 14, color: T.typeDefault, lineHeight: "22px" }}>All clear — no significant changes requiring immediate attention.</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.ragGreen, background: "rgba(21,160,21,0.08)", padding: "2px 8px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>stable</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pulse.alerts.map(alert => {
              const sev = sevStyles[alert.severity];
              const menuOpen = openAlertMenu === alert.id;
              return (
                <div key={alert.id} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <MI name={alert.icon} size={18} color={sev.icon} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, lineHeight: "22px" }}>{alert.title}</div>
                    <div style={{ fontSize: 13, color: T.typeMuted, lineHeight: "20px", marginTop: 2 }}>{alert.description}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: sev.icon, background: sev.bg, padding: "2px 8px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>{sev.label}</span>
                  {/* Actions dropdown */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button onClick={() => setOpenAlertMenu(menuOpen ? null : alert.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8,
                      border: `1px solid ${T.surfaceInverse}`, background: "transparent", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: T.surfaceInverse, fontFamily: "inherit",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      Actions <MI name="expand_more" size={14} color={T.surfaceInverse} />
                    </button>
                    {menuOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpenAlertMenu(null)} />
                        <div style={{
                          position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 100,
                          background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 8,
                          boxShadow: "0 0 2px 0 rgba(0,0,0,0.1), 0 8px 16px 0 rgba(0,0,0,0.1)",
                          minWidth: 220, overflow: "hidden",
                        }}>
                          {alert.actions.map((action, ai) => {
                            const isAgent = action.type === "agent";
                            return (
                              <div key={ai} onClick={() => { setOpenAlertMenu(null); if (isAgent) handleAgentAction(action.agentAction, action.context); else handleNav(action); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer",
                                  fontSize: 13, color: isAgent ? "#B11F62" : T.typeDefault, fontWeight: isAgent ? 600 : 400,
                                  borderBottom: ai < alert.actions.length - 1 ? `1px solid ${T.dividerLight}` : "none",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                              >
                                <MI name={action.icon} size={16} color={isAgent ? "#B11F62" : T.typeMuted} />
                                <span>{action.label}</span>
                                {isAgent && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: "#B11F62", opacity: 0.7 }}>AI</span>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 2: HEALTH STATUS CHANGES
         ════════════════════════════════════════════════════════════════════════ */}
      <div id="pulse-health" style={{ marginBottom: 40, scrollMarginTop: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault }}>Health Status Changes</span>
          <span style={{ fontSize: 12, color: T.typeMuted }}>({pulse.allHealthChanges.length})</span>
        </div>

        {pulse.allHealthChanges.length === 0 ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "24px", display: "flex", alignItems: "center", gap: 14 }}>
            <MI name="check" size={20} color={T.typeMuted} />
            <span style={{ fontSize: 13, color: T.typeMuted }}>No health status changes this quarter. All {companies.length} companies maintained their previous status.</span>
          </div>
        ) : (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 28px 100px 2.5fr 80px", padding: "10px 20px", fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px", textTransform: "uppercase", background: T.tableHeaderBg, borderBottom: `1px solid ${T.dividerLight}`, minWidth: 640 }}>
              <span>Company</span><span>Was</span><span></span><span>Now</span><span>Key Driver</span><span></span>
            </div>
            {/* Rows */}
            {visibleHealth.map((c, i) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 100px 28px 100px 2.5fr 80px", padding: "11px 20px", fontSize: 13, alignItems: "center", borderBottom: i < visibleHealth.length - 1 || pulse.allHealthChanges.length > HEALTH_VISIBLE ? `1px solid ${T.dividerLight}` : "none", minWidth: 640 }}>
                <div>
                  <span onClick={() => onCompanyClick(c.id)} style={{ fontWeight: 600, color: T.blue04, cursor: "pointer" }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: T.typeMuted, marginLeft: 8 }}>{c.sector}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor[c.prevHealth], flexShrink: 0 }} />
                  <span style={{ color: healthColor[c.prevHealth], fontWeight: 500, fontSize: 12 }}>{healthLabel[c.prevHealth]}</span>
                </div>
                <MI name="arrow_forward" size={14} color={T.typeMuted} />
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor[c.health], flexShrink: 0 }} />
                  <span style={{ color: healthColor[c.health], fontWeight: 600, fontSize: 12 }}>{healthLabel[c.health]}</span>
                </div>
                <span style={{ fontSize: 12, color: T.typeMuted }}>{c.driver}</span>
                <span onClick={() => onCompanyClick(c.id)} style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.typeDefault} onMouseLeave={e => e.currentTarget.style.color = T.typeMuted}>
                  Teardown <MI name="arrow_forward" size={11} color="currentColor" />
                </span>
              </div>
            ))}
            </div>
            {pulse.allHealthChanges.length > HEALTH_VISIBLE && (
              <button onClick={() => setShowAllHealth(!showAllHealth)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.blue04, fontFamily: "inherit" }}>
                {showAllHealth ? "Show less" : `Show all ${pulse.allHealthChanges.length} changes`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 3: KEY MOVERS
         ════════════════════════════════════════════════════════════════════════ */}
      <div id="pulse-movers" style={{ marginBottom: 40, scrollMarginTop: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault }}>Key Movers</span>
          <span style={{ fontSize: 12, color: T.typeMuted }}>({pulse.arrMovers.length})</span>
        </div>

        {pulse.arrMovers.length === 0 ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "24px", display: "flex", alignItems: "center", gap: 14 }}>
            <MI name="check" size={20} color={T.typeMuted} />
            <span style={{ fontSize: 13, color: T.typeMuted }}>No significant ARR movements this quarter.</span>
          </div>
        ) : (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px", padding: "10px 20px", fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px", textTransform: "uppercase", background: T.tableHeaderBg, borderBottom: `1px solid ${T.dividerLight}`, minWidth: 480 }}>
              <span>Company</span><span>Sector</span><span style={{ textAlign: "right" }}>ARR Change</span><span></span>
            </div>
            {pulse.arrMovers.slice(0, 10).map((c, i) => {
              const pct = c.arrDeltaPct;
              const isUp = pct > 0;
              return (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px", padding: "11px 20px", fontSize: 13, alignItems: "center", borderBottom: i < Math.min(pulse.arrMovers.length, 10) - 1 ? `1px solid ${T.dividerLight}` : "none", minWidth: 480 }}>
                  <span onClick={() => onCompanyClick(c.id)} style={{ fontWeight: 600, color: T.blue04, cursor: "pointer" }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: T.typeMuted }}>{c.sector}</span>
                  <span style={{ textAlign: "right", fontWeight: 600, color: isUp ? T.ragGreen : T.ragRed, fontSize: 13 }}>{isUp ? "+" : ""}{pct.toFixed(1)}%</span>
                  <span onClick={() => onCompanyClick(c.id)} style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.typeDefault} onMouseLeave={e => e.currentTarget.style.color = T.typeMuted}>
                    Teardown <MI name="arrow_forward" size={11} color="currentColor" />
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 4: POSITIVE SIGNALS
         ════════════════════════════════════════════════════════════════════════ */}
      <div id="pulse-positive" style={{ marginBottom: 40, scrollMarginTop: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault }}>Positive Signals</span>
          <span style={{ fontSize: 12, color: T.typeMuted }}>({pulse.positiveSignals.length})</span>
        </div>

        {pulse.positiveSignals.length === 0 ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "24px", display: "flex", alignItems: "center", gap: 14 }}>
            <MI name="info" size={20} color={T.typeMuted} />
            <span style={{ fontSize: 13, color: T.typeMuted }}>No notable positive signals this quarter.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pulse.positiveSignals.slice(0, 8).map((sig, i) => (
              <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <MI name="trending_up" size={18} color={T.ragGreen} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: T.typeDefault, lineHeight: "22px" }}>
                    <span onClick={() => onCompanyClick(sig.company.id)} style={{ fontWeight: 600, color: T.blue04, cursor: "pointer" }}>{sig.company.name}</span>
                    <span style={{ color: T.typeMuted }}> — </span>{sig.text}
                  </div>
                  <div style={{ fontSize: 12, color: T.typeMuted, marginTop: 2 }}>{sig.detail}</div>
                </div>
              </div>
            ))}
            {pulse.positiveSignals.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <button onClick={() => handleAgentAction("portfolio_highlights", pulse.improved)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  border: "1px solid #B11F62", color: "#B11F62", background: "transparent",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.surfaceVariant; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <MI name="auto_awesome" size={14} color="#B11F62" /> Draft portfolio highlights
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Disclaimer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.typeMuted, marginBottom: 24 }}>
        <SparkleIcon size={14} />
        <span>AI-generated analysis. Content may have inaccuracies. Based on portfolio data as of last extraction.</span>
      </div>

      {/* ── Agent Draft Modal ── */}
      {agentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => !agentModal.generating && setAgentModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 640, maxHeight: "80vh", background: T.surfaceDefault, borderRadius: 16,
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column",
            overflow: "hidden", position: "relative", borderTop: "2px solid #B11F62",
          }}>
            <div style={{ position: "absolute", top: -41, left: "50%", transform: "translateX(-50%)", width: 500, height: 40, filter: "blur(40px)", backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.3) 0.9%, rgba(226,46,51,0.3) 15.8%, rgba(171,72,218,0.3) 50.5%, rgba(64,105,254,0.3) 84.3%, rgba(255,255,255,0.3) 100%)" }} />
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.dividerLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SparkleIcon size={18} />
                <span style={{ fontSize: 16, fontWeight: 600, color: T.typeDefault }}>{agentModal.title}</span>
              </div>
              {!agentModal.generating && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { navigator.clipboard?.writeText(agentModal.content); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: `1px solid ${T.dividerLight}`, background: T.surfaceDefault, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.typeDefault, fontFamily: "inherit" }}>
                    <MI name="content_copy" size={14} color={T.typeMuted} /> Copy
                  </button>
                  <button onClick={() => setAgentModal(null)} style={{ display: "inline-flex", alignItems: "center", padding: "5px 7px", borderRadius: 8, border: `1px solid ${T.dividerLight}`, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit" }}>
                    <MI name="close" size={16} color={T.typeMuted} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {agentModal.generating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #E6E6E6", borderTopColor: "#B11F62", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: 14, color: T.typeMuted }}>AI Agent is generating your draft...</span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <pre style={{ fontFamily: "inherit", fontSize: 13, lineHeight: "21px", color: T.typeDefault, whiteSpace: "pre-wrap", margin: 0 }}>{agentModal.content}</pre>
              )}
            </div>
            {!agentModal.generating && (
              <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.dividerLight}`, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.typeMuted }}>
                <SparkleIcon size={12} /><span>AI-generated draft. Review and edit before sharing.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function GroupInsightsContent({ companies, filters, setFilters }) {
  const [groupBy, setGroupBy] = useState("Sector");
  const ctx = useMemo(() => getGIContext(filters, groupBy, companies), [filters, groupBy, companies]);

  return (
      <div>
        {/* Control box */}
        <div style={{ marginBottom: 32 }}>
          <FilterBar filters={filters} setFilters={setFilters} companyCount={companies.length} groupBy={groupBy} setGroupBy={setGroupBy} />
        </div>


        <div style={{ marginBottom: 48 }}><GIKPICards companies={companies} /></div>
        <div style={{ marginBottom: 48 }}><GIExecSummary companies={companies} /></div>
        <div style={{ marginBottom: 48 }}><GIKeyObservations /></div>
        <div style={{ marginBottom: 48 }}><GIRetentionGrowth companies={companies} groupBy={groupBy} /></div>
        <div style={{ marginBottom: 48 }}><GIScorecard companies={companies} /></div>
        <div style={{ marginBottom: 48 }}><GIHiddenRisks /></div>
        <div style={{ marginBottom: 48 }}><GIPortfolioInitiatives /></div>
        <div style={{ marginBottom: 48 }}><GIActionItems /></div>
      </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PEER COMPARISON TAB
   ═══════════════════════════════════════════════════════════════════════════ */

const PEER_METRICS = [
  { key: "arr", label: "ARR", fmt: v => `$${v >= 1000 ? (v/1000).toFixed(1)+"B" : v.toFixed(0)+"M"}`, higher: true },
  { key: "yoy", label: "Rev Growth", fmt: v => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`, higher: true },
  { key: "grossMargin", label: "Gross Margin", fmt: v => `${v.toFixed(0)}%`, higher: true },
  { key: "ebitdaMargin", label: "EBITDA Margin", fmt: v => `${v.toFixed(0)}%`, higher: true },
  { key: "ro40", label: "Rule of 40", fmt: v => `${v.toFixed(0)} pts`, higher: true },
  { key: "cash", label: "Cash", fmt: v => `$${v.toFixed(1)}M`, higher: true },
  { key: "nrr", label: "NRR", fmt: v => `${v.toFixed(0)}%`, higher: true },
  { key: "grr", label: "GRR", fmt: v => `${v.toFixed(0)}%`, higher: true },
  { key: "ltv_cac", label: "LTV/CAC", fmt: v => `${v.toFixed(1)}x`, higher: true },
  { key: "magic", label: "Magic Number", fmt: v => v.toFixed(2), higher: true },
  { key: "arrPerEmp", label: "ARR/Employee", fmt: v => `$${(v/1000).toFixed(0)}K`, higher: true },
];

const PEER_CHART_METRICS = [
  { key: "arr", label: "Total ARR" }, { key: "nrr", label: "NRR" }, { key: "grr", label: "GRR" },
  { key: "yoy", label: "Growth YoY" }, { key: "grossMargin", label: "Gross Margin" },
  { key: "ro40", label: "Rule of 40" }, { key: "magic", label: "Magic Number" }, { key: "arrPerEmp", label: "ARR/Employee" },
];

function PeerEmptyState({ companies, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "48px 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <MI name="compare_arrows" size={48} color={T.divider} />
        <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault, marginTop: 16 }}>Select a company to view peer comparison</div>
        <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 8, marginBottom: 24 }}>Choose a company to benchmark against its peers in your portfolio</div>
        <div style={{ position: "relative", width: 400, margin: "0 auto" }}>
          <button onClick={() => setOpen(!open)} style={{ width: "100%", height: 40, padding: "0 36px 0 16px", fontSize: 14, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, color: T.typeMuted, textAlign: "left", cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
            Select a company
            <MI name="expand_more" size={18} color={T.typeMuted} style={{ position: "absolute", right: 12, top: 11 }} />
          </button>
          {open && (
            <div style={{ position: "absolute", top: 44, left: 0, width: 400, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 8, boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 320, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 8 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 13, border: `1px solid ${T.dividerLight}`, borderRadius: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} autoFocus />
              </div>
              <div style={{ overflowY: "auto", maxHeight: 260 }}>
                {filtered.map(c => (
                  <div key={c.id} onClick={() => { onSelect(c.id); setOpen(false); setSearch(""); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[c.health]) }} />
                    <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                    <span style={{ color: T.typeMuted, fontSize: 12, marginLeft: "auto", flexShrink: 0 }}>{c.sector}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

/* Sub-tab: Overview — metrics table */
function PeerOverview({ subject, peers, median }) {
  const [sortKey, setSortKey] = useState("arr");
  const [sortAsc, setSortAsc] = useState(false);
  const toggleSort = k => { if (k === sortKey) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false); } };
  const sortedPeers = [...peers].sort((a, b) => sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
  const all = [subject, ...peers];
  const cellColor = (val, metric, subjectVal) => {
    const m = PEER_METRICS.find(x => x.key === metric.key);
    if (!m) return {};
    const better = m.higher ? val > subjectVal * 1.05 : val < subjectVal * 0.95;
    const worse = m.higher ? val < subjectVal * 0.95 : val > subjectVal * 1.05;
    if (better) return { background: "rgba(21,160,21,0.08)" };
    if (worse) return { background: "rgba(254,142,34,0.08)" };
    return {};
  };
  const th = { padding: "0 10px", height: 40, textAlign: "right", fontWeight: 600, fontSize: 11, background: "#F3F3F3", borderBottom: `1px solid ${T.divider}`, whiteSpace: "nowrap" };
  const td = { padding: "0 10px", height: 44, textAlign: "right", fontSize: 13, borderBottom: `1px solid ${T.dividerLight}`, whiteSpace: "nowrap" };
  const PSI = ({ k }) => { const a = sortKey === k; return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, opacity: a ? 1 : 0.5 }}><MI name={a ? (sortAsc ? "expand_less" : "expand_more") : "unfold_more"} size={16} color={a ? T.typeDefault : T.typeMuted} /></span>; };
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault, marginBottom: 16 }}>Performance Metrics</div>
      <div style={{ background: T.surfaceDefault, borderBottom: `1px solid ${T.dividerLight}`, borderRadius: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              <th style={{ ...th, textAlign: "center", width: 36, position: "sticky", left: 0, zIndex: 10 }}>Rank</th>
              <th style={{ ...th, textAlign: "left", minWidth: 150, position: "sticky", left: 36, zIndex: 10, borderRight: `1px solid ${T.dividerLight}` }}>Company</th>
              {PEER_METRICS.map(m => <th key={m.key} onClick={() => toggleSort(m.key)} style={{ ...th, cursor: "pointer", userSelect: "none" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>{m.label}<PSI k={m.key} /></div></th>)}
            </tr></thead>
            <tbody>
              {/* Subject row */}
              <tr style={{ background: "rgba(11,76,206,0.04)" }}>
                <td style={{ ...td, textAlign: "center", position: "sticky", left: 0, zIndex: 5, background: "rgba(11,76,206,0.04)" }}>
                  
                </td>
                <td style={{ ...td, textAlign: "left", fontWeight: 700, position: "sticky", left: 36, zIndex: 5, background: "rgba(11,76,206,0.04)", borderRight: `1px solid ${T.dividerLight}` }}>{subject.name}</td>
                {PEER_METRICS.map(m => <td key={m.key} style={{ ...td, fontWeight: 600 }}>{m.fmt(subject[m.key])}</td>)}
              </tr>
              {/* Peer rows */}
              {sortedPeers.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ ...td, textAlign: "center", position: "sticky", left: 0, zIndex: 5, background: T.surfaceDefault, fontSize: 12, color: T.typeMuted }}>{i + 1}</td>
                  <td style={{ ...td, textAlign: "left", position: "sticky", left: 36, zIndex: 5, background: T.surfaceDefault, borderRight: `1px solid ${T.dividerLight}` }}>
                    <span style={{ fontWeight: 500, color: T.ocean40, cursor: "pointer" }}>{p.name}</span>
                  </td>
                  {PEER_METRICS.map(m => <td key={m.key} style={{ ...td, ...cellColor(p[m.key], m, subject[m.key]) }}>{m.fmt(p[m.key])}</td>)}
                </tr>
              ))}
              {/* Median row */}
              <tr style={{ background: T.surfaceVariant, borderTop: `2px solid ${T.divider}` }}>
                <td style={{ ...td, textAlign: "center", position: "sticky", left: 0, zIndex: 5, background: T.surfaceVariant }} />
                <td style={{ ...td, textAlign: "left", fontWeight: 700, fontSize: 12, position: "sticky", left: 36, zIndex: 5, background: T.surfaceVariant, borderRight: `1px solid ${T.dividerLight}` }}>Peer Median</td>
                {PEER_METRICS.map(m => <td key={m.key} style={{ ...td, fontWeight: 600, fontSize: 12, background: T.surfaceVariant }}>{m.fmt(median[m.key])}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Sub-tab: Charts — percentile strips + heatmap + distribution */
function PeerCharts({ subject, peers, median }) {
  const [distMetric, setDistMetric] = useState("ltv_cac");
  const allCos = [subject, ...peers];
  // Compute percentiles for subject
  const pctData = PEER_CHART_METRICS.map(m => {
    const vals = allCos.map(c => c[m.key]).sort((a, b) => a - b);
    const rank = vals.filter(v => v <= subject[m.key]).length;
    const pct = Math.round((rank / vals.length) * 100);
    const p25 = vals[Math.floor(vals.length * 0.25)];
    const p75 = vals[Math.floor(vals.length * 0.75)];
    const color = pct >= 75 ? T.ragGreen : pct >= 25 ? T.ragAmber : T.ragRed;
    return { name: m.label, pct, p25Pct: 25, p75Pct: 75, color };
  });
  // Heatmap data
  // Divergence data: % difference from peer median per metric
  const divData = PEER_CHART_METRICS.map(m => {
    const med = median[m.key] || 0;
    const diff = med !== 0 ? ((subject[m.key] - med) / Math.abs(med)) * 100 : 0;
    const higher = m.higher !== undefined ? m.higher : true;
    const isGood = higher ? diff >= 0 : diff <= 0;
    return { name: m.label, diff: Math.round(diff), color: isGood ? T.ragGreen : T.ragRed, subVal: subject[m.key], medVal: med, fmt: m.fmt || PEER_METRICS.find(x => x.key === m.key)?.fmt || (v => v) };
  });
  const maxAbsDiff = Math.max(...divData.map(d => Math.abs(d.diff)), 10);
  // Distribution data (for box plot)
  const distM = PEER_METRICS.find(m => m.key === distMetric) || PEER_METRICS[0];
  const distVals = allCos.map(c => c[distMetric]).sort((a, b) => a - b);
  const distP25 = distVals[Math.floor(distVals.length * 0.25)];
  const distP75 = distVals[Math.floor(distVals.length * 0.75)];
  const distMed = distVals[Math.floor(distVals.length / 2)];
  const distMin = distVals[0];
  const distMax = distVals[distVals.length - 1];

  return (
    <div>
      {/* 1. Percentile Snapshot */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>Percentile Position</div>
        <div style={{ fontSize: 14, color: T.typeMuted, marginBottom: 20 }}>{`${subject.name}'s ranking against peers across key metrics`}</div>
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
          {pctData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < pctData.length - 1 ? 10 : 0 }}>
              <div style={{ width: 110, fontSize: 12, fontWeight: 500, color: T.typeDefault, textAlign: "right", flexShrink: 0 }}>{d.name}</div>
              <div style={{ flex: 1, height: 24, background: T.surfaceVariant, borderRadius: 4, position: "relative", overflow: "hidden" }}>
                {/* Vertical gridlines */}
                {[10,20,30,40,50,60,70,80,90].map(g => <div key={g} style={{ position: "absolute", left: `${g}%`, top: 0, bottom: 0, width: 1, background: T.dividerLight }} />)}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${d.pct}%`, background: d.color, borderRadius: 4, minWidth: d.pct > 0 ? 4 : 0 }} />
              </div>
            </div>
          ))}
          {/* Horizontal axis */}
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: 8, paddingLeft: 122 }}>
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
              <div key={v} style={{ flex: 1, fontSize: 10, color: T.typeMuted, textAlign: v === 0 ? "left" : v === 100 ? "right" : "center" }}>{v}%</div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: T.typeMuted, marginTop: 4 }}>Percentile Position</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.dividerLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.typeMuted }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.ragGreen }} />Top Quartile (≥75th)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.typeMuted }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.ragAmber }} />Mid Range (25th–75th)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.typeMuted }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.ragRed }} />Bottom Quartile (&lt;25th)</div>
          </div>
        </div>
      </div>

      {/* 2. Performance vs Peer Median (Divergence bars) */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>Performance vs Peer Median</div>
        <div style={{ fontSize: 14, color: T.typeMuted, marginBottom: 20 }}>Percentage difference from peer median across key performance metrics</div>
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "32px 24px 24px" }}>
          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: T.typeMuted }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.ragGreen }} />Outperforming</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: T.typeMuted }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.ragRed }} />Underperforming</span>
          </div>
          {divData.map((d, i) => {
            const barPct = Math.min(Math.abs(d.diff) / maxAbsDiff * 50, 50);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, padding: "6px 0" }}>
                <div style={{ width: 110, fontSize: 12, fontWeight: 500, color: T.typeDefault, textAlign: "left", flexShrink: 0, paddingRight: 12 }}>{d.name}</div>
                <div style={{ flex: 1, height: 24, position: "relative", borderBottom: i < divData.length - 1 ? `1px solid ${T.dividerLight}` : "none" }}>
                  {/* Center dashed line (median) */}
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 0, borderLeft: `1.5px dashed ${T.typeMuted}` }} />
                  {/* Median pill label on first row only */}
                  {i === 0 && <div style={{ position: "absolute", left: "50%", top: -24, transform: "translateX(-50%)", background: "#FFFFFF", border: `1px solid ${T.divider}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: T.typeDefault, whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>Median</div>}
                  {/* Bar */}
                  {d.diff >= 0 ? (
                    <div style={{ position: "absolute", left: "50%", top: 3, bottom: 3, width: `${barPct}%`, background: d.color, borderRadius: "0 4px 4px 0" }} />
                  ) : (
                    <div style={{ position: "absolute", right: "50%", top: 3, bottom: 3, width: `${barPct}%`, background: d.color, borderRadius: "4px 0 0 4px" }} />
                  )}
                </div>
                <div style={{ width: 56, fontSize: 12, fontWeight: 600, color: d.color, textAlign: "right", flexShrink: 0, paddingLeft: 8 }}>{d.diff > 0 ? "+" : ""}{d.diff}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LTV/CAC Distribution — YKL exact match */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>{distM.label} Distribution</div>
            <div style={{ fontSize: 14, color: T.typeMuted }}>{subject.name} compared to the peer group spread</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <span style={{ fontSize: 13, color: T.typeMuted }}>Metric:</span>
            <DSSelect value={distMetric} options={PEER_METRICS.map(m => m.key)} labels={PEER_METRICS.reduce((a, m) => ({ ...a, [m.key]: m.label }), {})} onChange={setDistMetric} />
          </div>
        </div>
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24, marginTop: 16 }}>
          {(() => {
            // Y-axis scale
            const step = distMax > 10 ? Math.ceil(distMax / 8) : 0.5;
            const axMin = 0;
            const axMax = Math.ceil(distMax * 1.15 / step) * step;
            const range = axMax - axMin || 1;
            const ticks = [];
            for (let v = axMin; v <= axMax + step * 0.01; v += step) ticks.push(Math.round(v * 100) / 100);

            const chartH = Math.max(ticks.length * 28, 220);
            const padL = 44, padR = 16, padT = 8, padB = 24;
            const plotH = chartH - padT - padB;
            const yPos = v => padT + plotH - ((v - axMin) / range) * plotH;
            const subjectVal = subject[distMetric];
            const p25y = yPos(distP25);
            const p75y = yPos(distP75);
            const medy = yPos(distMed);
            const miny = yPos(distMin);
            const maxy = yPos(distMax);

            return (
              <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Rotated Y-axis label */}
                <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 11, color: T.typeMuted }}>{distM.label}</div>
                </div>
                {/* Chart area */}
                <div style={{ flex: 1, position: "relative", height: chartH }}>
                  {/* Y-axis ticks + gridlines */}
                  {ticks.map((t, i) => (
                    <div key={i}>
                      <div style={{ position: "absolute", left: 0, top: yPos(t) - 7, width: padL - 8, textAlign: "right", fontSize: 10, color: T.typeMuted }}>{distM.fmt(t)}</div>
                      <div style={{ position: "absolute", left: padL, right: padR, top: yPos(t), height: 1, background: T.dividerLight }} />
                    </div>
                  ))}
                  {/* Whisker line */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.5)`, top: maxy, height: miny - maxy, width: 2, marginLeft: -1, background: T.ragGreen }} />
                  {/* Max cap */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.25)`, width: `calc((100% - ${padL + padR}px) * 0.5)`, top: maxy, height: 2, background: T.ragGreen }} />
                  {/* Min cap */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.25)`, width: `calc((100% - ${padL + padR}px) * 0.5)`, top: miny - 1, height: 2, background: T.ragGreen }} />
                  {/* IQR box */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.1)`, width: `calc((100% - ${padL + padR}px) * 0.8)`, top: p75y, height: Math.max(p25y - p75y, 2), background: "rgba(21,160,21,0.08)", border: `2px solid ${T.ragGreen}`, borderRadius: 4 }} />
                  {/* Median line */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.1)`, width: `calc((100% - ${padL + padR}px) * 0.8)`, top: medy - 1, height: 2, background: T.ragGreen }} />
                  {/* Subject diamond */}
                  <div style={{ position: "absolute", left: `calc(${padL}px + (100% - ${padL + padR}px) * 0.5 - 9px)`, top: yPos(subjectVal) - 9, width: 18, height: 18, background: T.blue04, borderRadius: 3, transform: "rotate(45deg)", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
                  {/* X-axis label */}
                  <div style={{ position: "absolute", left: padL, right: padR, bottom: 0, textAlign: "center", fontSize: 11, color: T.typeMuted }}>{distM.label}</div>
                </div>
              </div>
            );
          })()}
          {/* Legend — single row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.dividerLight}` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.typeMuted }}>
              <span style={{ width: 16, height: 10, background: "rgba(21,160,21,0.15)", border: `1.5px solid ${T.ragGreen}`, borderRadius: 2 }} />Peer Distribution (Min, P25, Median, P75, Max)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.typeMuted }}>
              <span style={{ width: 10, height: 10, background: T.blue04, borderRadius: 2, transform: "rotate(45deg)", display: "inline-block" }} />Subject Company ({distM.fmt(subject[distMetric])})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sub-tab: Insights — two-column qualitative */
function PeerInsights({ subject, peers }) {
  const healthDist = { healthy: 0, at_risk: 0, critical: 0 };
  peers.forEach(p => healthDist[p.health]++);
  const grades = ["A+","A","A-","B+","B","B-","C+","C"];
  const subjectGrade = subject.health === "healthy" ? "B+" : subject.health === "at_risk" ? "C+" : "C";
  const gradeColor = g => g.startsWith("A") ? T.ragGreen : g.startsWith("B") ? T.blue04 : T.ragAmber;
  const subjectLevers = ["Enterprise expansion into adjacent verticals", "AI-driven process automation to reduce opex", "Geographic expansion to high-growth markets", "Product-led growth funnel optimization"];
  const subjectRisks = subject.health === "healthy" ? [] : ["Customer concentration risk in top accounts", "Margin compression from scaling infrastructure costs", "Key talent retention in engineering"];
  const peerLevers = ["B2B marketplace consolidation plays", "Vertical SaaS specialization for regulatory moats", "Platform strategy with ecosystem partnerships"];
  const peerRisks = ["Regulatory compliance cost escalation", "Key-person dependency in leadership", "Sales cycle elongation in enterprise segment"];

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>Qualitative Insights</div>
      <div style={{ fontSize: 14, color: T.typeMuted, marginBottom: 20 }}>{`Comparing ${subject.name} against peer group patterns across health, strategy, risks, and management`}</div>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left: Subject company */}
        <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.typeDefault, marginBottom: 20 }}>{subject.name}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Health Status</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 9999, background: subject.health === "healthy" ? "rgba(21,160,21,0.1)" : subject.health === "at_risk" ? "rgba(254,142,34,0.1)" : "rgba(160,21,22,0.1)", marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[subject.health]) }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: ({ healthy: T.ragGreen, at_risk: "#D4700A", critical: T.ragRed }[subject.health]) }}>
              {{ healthy: "Healthy", at_risk: "At Risk", critical: "Critical" }[subject.health]}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Management Grade</div>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 8, background: gradeColor(subjectGrade), color: "white", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{subjectGrade}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Growth Levers</div>
          {subjectLevers.map((l, i) => <div key={i} style={{ fontSize: 13, color: T.typeDefault, lineHeight: "22px", paddingLeft: 16, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 0 }}>•</span>{l}</div>)}
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8, marginTop: 20 }}>Key Risks</div>
          {subjectRisks.length > 0 ? subjectRisks.map((r, i) => <div key={i} style={{ fontSize: 13, color: T.typeDefault, lineHeight: "22px", paddingLeft: 16, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 0 }}>•</span>{r}</div>)
            : <div style={{ fontSize: 13, color: T.typeMuted, fontStyle: "italic" }}>No key risks identified</div>}
        </div>
        {/* Right: Peer patterns */}
        <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.typeDefault, marginBottom: 20 }}>Peer Patterns</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Health Distribution</div>
          <div style={{ fontSize: 14, color: T.typeDefault, marginBottom: 20 }}>{healthDist.healthy} Healthy, {healthDist.at_risk} Watch, {healthDist.critical} Critical</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Management Grades</div>
          <div style={{ fontSize: 14, color: T.typeDefault, marginBottom: 20 }}>A: {Math.round(peers.length * 0.2)} | B: {Math.round(peers.length * 0.6)} | C: {peers.length - Math.round(peers.length * 0.2) - Math.round(peers.length * 0.6)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8 }}>Common Growth Levers</div>
          {peerLevers.map((l, i) => <div key={i} style={{ fontSize: 13, color: T.typeDefault, lineHeight: "22px", paddingLeft: 16, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 0 }}>•</span>{l}</div>)}
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 8, marginTop: 20 }}>Common Risks</div>
          {peerRisks.map((r, i) => <div key={i} style={{ fontSize: 13, color: T.typeDefault, lineHeight: "22px", paddingLeft: 16, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 0 }}>•</span>{r}</div>)}
        </div>
      </div>
    </div>
  );
}

/* Sub-tab: Narrative — AI-generated */
function PeerNarrative({ subject, peers, median }) {
  const peerCount = peers.length;
  return (
    <div>
      <AIContainer>
        <div style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <AIBadge />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault, marginBottom: 16 }}>Executive Summary</div>
          <p style={{ fontSize: 14, lineHeight: "24px", color: T.typeDefault, marginBottom: 28 }}>
            {subject.name} is currently categorized as "{subject.health === "healthy" ? "Healthy" : subject.health === "at_risk" ? "At Risk" : "Critical"}" within its {subject.sector} peer cohort of {peerCount} companies. With ${subject.arr.toFixed(0)}M in ARR ({subject.arr > median.arr ? "above" : "below"} the peer median of ${median.arr.toFixed(0)}M), the company demonstrates {subject.nrr >= 105 ? "strong" : subject.nrr >= 95 ? "moderate" : "concerning"} retention at {subject.nrr.toFixed(0)}% NRR and {subject.grr.toFixed(0)}% GRR. {subject.ebitdaMargin >= 0 ? `Positive EBITDA margins of ${subject.ebitdaMargin.toFixed(0)}% place it in a sustainable operating position.` : `An EBITDA margin of ${subject.ebitdaMargin.toFixed(0)}% signals operational challenges that require near-term intervention.`}
          </p>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault, marginBottom: 12 }}>Strengths Relative to Peers</div>
          {[
            subject.arr >= median.arr && { t: "Revenue Scale", d: `At $${subject.arr.toFixed(0)}M ARR, ${subject.name} operates ${subject.arr > median.arr * 1.2 ? "well above" : "above"} the peer median of $${median.arr.toFixed(0)}M.` },
            subject.ltv_cac >= median.ltv_cac && { t: "Unit Economics", d: `LTV/CAC of ${subject.ltv_cac.toFixed(1)}x ${subject.ltv_cac > median.ltv_cac ? "exceeds" : "matches"} the peer median of ${median.ltv_cac.toFixed(1)}x, indicating efficient customer acquisition.` },
            subject.cash >= median.cash && { t: "Cash Position", d: `$${subject.cash.toFixed(1)}M in cash provides runway above the peer median of $${median.cash.toFixed(1)}M.` },
            subject.grr >= median.grr && { t: "Gross Retention", d: `GRR of ${subject.grr.toFixed(0)}% demonstrates solid baseline retention relative to peers.` },
          ].filter(Boolean).map((s, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: "24px", color: T.typeDefault, marginBottom: 8, paddingLeft: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>•</span><strong>{s.t}:</strong> {s.d}
            </div>
          ))}
          <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault, marginTop: 28, marginBottom: 12 }}>Areas of Concern</div>
          {[
            subject.nrr < median.nrr && { t: "Retention Pressure", d: `NRR of ${subject.nrr.toFixed(0)}% falls below the peer median of ${median.nrr.toFixed(0)}%, indicating expansion revenue challenges.` },
            subject.ebitdaMargin < median.ebitdaMargin && { t: "Profitability Gap", d: `EBITDA margin of ${subject.ebitdaMargin.toFixed(0)}% lags the peer median of ${median.ebitdaMargin.toFixed(0)}%, suggesting cost structure issues.` },
            subject.yoy < median.yoy && { t: "Growth Deceleration", d: `YoY growth of ${subject.yoy.toFixed(0)}% trails the peer median of ${median.yoy.toFixed(0)}%, raising questions about market positioning.` },
            subject.grossMargin < median.grossMargin && { t: "Margin Compression", d: `Gross margin of ${subject.grossMargin.toFixed(0)}% underperforms peers at ${median.grossMargin.toFixed(0)}%, impacting long-term scalability.` },
          ].filter(Boolean).map((s, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: "24px", color: T.typeDefault, marginBottom: 8, paddingLeft: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>•</span><strong>{s.t}:</strong> {s.d}
            </div>
          ))}
          <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault, marginTop: 28, marginBottom: 12 }}>Peer Group Context</div>
          <p style={{ fontSize: 14, lineHeight: "24px", color: T.typeDefault, marginBottom: 28 }}>
            The comparison cohort consists of {peerCount} {subject.sector} companies with a median ARR of ${median.arr.toFixed(0)}M. This peer group is characterized by {median.nrr >= 105 ? "strong retention discipline" : "moderate retention performance"} with a median NRR of {median.nrr.toFixed(0)}% and {median.grossMargin >= 60 ? "healthy" : "mixed"} gross margins averaging {median.grossMargin.toFixed(0)}%. The top quartile achieves Rule of 40 scores above {Math.round(median.ro40 * 1.3)}, setting a high bar for operational excellence.
          </p>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.typeDefault, marginBottom: 12 }}>Strategic Recommendations</div>
          {[
            `Focus on retention: With NRR at ${subject.nrr.toFixed(0)}%, deploy a dedicated retention team to reduce churn and accelerate expansion revenue.`,
            `Address margin structure: ${subject.grossMargin < 60 ? "Gross margin improvement should be a priority — renegotiate vendor contracts and optimize infrastructure." : "Maintain gross margin discipline while scaling operations."}`,
            `Benchmark sales efficiency: Magic Number of ${subject.magic.toFixed(2)} ${subject.magic >= 0.7 ? "is healthy" : "suggests GTM motion needs optimization"} — evaluate CAC payback against peer benchmarks.`,
            `Strengthen competitive position: Leverage ${subject.sector} domain expertise to build defensible market position against the ${peerCount}-company peer set.`,
          ].map((r, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: "24px", color: T.typeDefault, marginBottom: 8, paddingLeft: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>•</span><strong>{r.split(":")[0]}:</strong>{r.split(":").slice(1).join(":")}
            </div>
          ))}
          <AIDisclaimer />
          <div style={{ textAlign: "center", fontSize: 12, color: T.typeMuted, marginTop: 12 }}>Based on comparison with {peerCount} peer companies</div>
        </div>
      </AIContainer>
    </div>
  );
}

/* Main Peer Comparison orchestrator */
function PeerComparisonContent({ companies, selectedCompanyId, onSelectCompany }) {
  const [subTab, setSubTab] = useState(0);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeSearch, setChangeSearch] = useState("");
  const [peerLoading, setPeerLoading] = useState(false);
  const subTabs = ["Overview", "Charts", "Insights", "Narrative"];
  const subject = companies.find(c => c.id === selectedCompanyId);

  const selectWithLoading = (id) => {
    onSelectCompany(id);
    setPeerLoading(true);
    setTimeout(() => setPeerLoading(false), 900);
  };

  if (!subject) return <div><PeerEmptyState companies={companies} onSelect={selectWithLoading} /></div>;

  if (peerLoading) {
    const Skel = ({ w, h = 14, r = 6, mb = 0 }) => (
      <div style={{ width: w, height: h, borderRadius: r, background: "#F0F1F3", marginBottom: mb, animation: "pulse 1.2s ease-in-out infinite" }} />
    );
    return (
      <div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        {/* Skeleton header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Skel w={200} h={24} mb={8} />
            <Skel w={340} h={14} mb={10} />
          </div>
          <Skel w={90} h={36} r={8} />
        </div>
        <div style={{ marginTop: 10, marginBottom: 40 }}>
          <Skel w={380} h={28} r={9999} />
        </div>
        {/* Skeleton sub-tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[80, 64, 72, 80].map((w, i) => <Skel key={i} w={w} h={40} r={10} />)}
        </div>
        {/* Skeleton table */}
        <Skel w={180} h={18} mb={16} />
        <div style={{ borderBottom: `1px solid ${T.dividerLight}` }}>
          <div style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: `1px solid ${T.dividerLight}` }}>
            {[36, 150, 80, 80, 80, 80, 80, 80].map((w, i) => <Skel key={i} w={w} h={14} />)}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: `1px solid ${T.dividerLight}` }}>
              {[36, 150, 80, 80, 80, 80, 80, 80].map((w, j) => <Skel key={j} w={w} h={12} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const peers = companies.filter(c => c.sector === subject.sector && c.id !== subject.id);
  const median = {};
  PEER_METRICS.forEach(m => {
    const vals = peers.map(c => c[m.key]).sort((a, b) => a - b);
    median[m.key] = vals.length > 0 ? vals[Math.floor(vals.length / 2)] : 0;
  });

  return (
    <div>
        {/* Company header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>{subject.name}</div>
            <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 2 }}>Peer group: {subject.sector} · {[...new Set(peers.map(p => p.stage))].join(", ")} · All Geographies · {peers.length} companies</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setChangeOpen(!changeOpen); setChangeSearch(""); }} style={{ height: 36, padding: "0 12px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8, background: "transparent", color: T.typeDefault, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = "#F3F3F3"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <MI name="swap_horiz" size={16} color={T.typeDefault} />Change
              </button>
              {changeOpen && <>
                <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setChangeOpen(false)} />
                <div style={{ position: "absolute", top: 40, right: 0, width: 360, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 8, boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 200, maxHeight: 340, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: 8 }}>
                    <input value={changeSearch} onChange={e => setChangeSearch(e.target.value)} placeholder="Search companies..." style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 13, border: `1px solid ${T.dividerLight}`, borderRadius: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} autoFocus />
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: 270 }}>
                    {companies.filter(c => c.name.toLowerCase().includes(changeSearch.toLowerCase())).map(c => (
                      <div key={c.id} onClick={() => { selectWithLoading(c.id); setChangeOpen(false); setChangeSearch(""); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", background: c.id === selectedCompanyId ? T.actionSecHover : "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                        onMouseLeave={e => e.currentTarget.style.background = c.id === selectedCompanyId ? T.actionSecHover : "transparent"}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[c.health]) }} />
                        <span style={{ fontWeight: c.id === selectedCompanyId ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                        <span style={{ color: T.typeMuted, fontSize: 12, marginLeft: "auto", flexShrink: 0 }}>{c.sector}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>

        {/* DS Info Alert */}
        <div style={{ marginTop: 10, marginBottom: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#E0F4FF", borderRadius: 9999 }}>
            <span className="material-icons-outlined" style={{ fontSize: 16, color: "#1A6FA0", lineHeight: 1, width: 16, height: 16, flexShrink: 0, display: "block" }}>info_outline</span>
            <span style={{ fontSize: 12, color: "#1A6FA0", whiteSpace: "nowrap" }}>Peer group auto-expanded to all geographies to reach minimum peer count</span>
          </span>
        </div>

        {/* Sub-tab navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {subTabs.map((t, i) => {
            const active = subTab === i;
            return (
              <button key={t} onClick={() => setSubTab(i)} style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, color: active ? T.typeInverse : T.typeDefault, background: active ? T.brandRed : T.actionSecHover, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#E6E6E6"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = T.actionSecHover; }}>{t}</button>
            );
          })}
        </div>

        {subTab === 0 && <PeerOverview subject={subject} peers={peers} median={median} />}
        {subTab === 1 && <PeerCharts subject={subject} peers={peers} median={median} />}
        {subTab === 2 && <PeerInsights subject={subject} peers={peers} />}
        {subTab === 3 && <PeerNarrative subject={subject} peers={peers} median={median} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY TEARDOWN TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function genTeardown(c) {
  const h = c.health;
  const hLabel = { healthy: "Healthy", at_risk: "At Risk", critical: "Critical" }[h];
  const hColor = { healthy: T.ragGreen, at_risk: "#D4700A", critical: T.ragRed }[h];
  const hBg = { healthy: "rgba(21,160,21,0.08)", at_risk: "rgba(254,142,34,0.08)", critical: "rgba(160,21,22,0.08)" }[h];
  const grade = h === "healthy" ? "B+" : h === "at_risk" ? "C+" : "C";
  const gradeColor = grade.startsWith("A") ? T.ragGreen : grade.startsWith("B") ? T.blue04 : T.ragAmber;
  const ro40 = Math.round((c.yoy || 0) + (c.ebitdaMargin || 0));
  const quarters = ["Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025"];
  const trajectory = quarters.map((q, i) => ({
    q, arr: Math.round(c.arr * (0.82 + i * 0.04) * 10) / 10,
    nrr: Math.round((c.nrr - 6 + i * 1.2) * 10) / 10
  }));
  const vitalSigns = [
    { cat: "IMPROVING", kpi: "EBITDA Margin", current: `${c.ebitdaMargin?.toFixed(1)}%`, qoq: `+${(Math.random()*3+1).toFixed(1)}%`, trend: "↗ Accelerating", causal: "Cost optimization and pricing discipline.", insight: "Margin expansion ahead of plan.", status: "green" },
    { cat: "DECLINING", kpi: "Total ARR", current: `$${c.arr.toFixed(0)}M`, qoq: `${(c.yoy > 0 ? "+" : "")}${(c.yoy/4).toFixed(1)}%`, trend: c.yoy > 5 ? "↗ Growing" : "↘ Declining", causal: "Market-driven volume shifts.", insight: "Monitoring trajectory closely.", status: c.yoy > 5 ? "green" : "amber" },
    { cat: "STABLE", kpi: "Gross Margin", current: `${c.grossMargin?.toFixed(0)}%`, qoq: `+${(Math.random()*2).toFixed(1)}%`, trend: "→ Stable", causal: "Mix shift toward higher-margin products.", insight: "Holding within target range.", status: "green" },
    { cat: c.nrr >= 105 ? "IMPROVING" : "DECLINING", kpi: "NRR", current: `${c.nrr.toFixed(0)}%`, qoq: `${c.nrr >= 105 ? "+" : ""}${(Math.random()*2-0.5).toFixed(1)}%`, trend: c.nrr >= 105 ? "↗ Improving" : "↘ Declining", causal: c.nrr >= 105 ? "Strong expansion revenue." : "Churn in mid-market segment.", insight: c.nrr >= 105 ? "Best-in-class retention." : "Retention program needed.", status: c.nrr >= 105 ? "green" : "red" },
    { cat: "STABLE", kpi: "Cash Runway", current: `${Math.round(c.cash / (c.arr * 0.08))} months`, qoq: "—", trend: "→ Stable", causal: "Controlled burn rate.", insight: "Adequate runway for current plan.", status: c.cash > 20 ? "green" : "amber" },
  ];
  const forecasts = [
    { q: "Q1'25", promise: `$${(c.arr*0.26).toFixed(0)}M Revenue`, delivery: `$${(c.arr*0.25).toFixed(0)}M Revenue`, gap: "Partial", why: "Lower than anticipated volume." },
    { q: "Q2'25", promise: `${(c.ebitdaMargin*0.9).toFixed(1)}% EBITDA`, delivery: `${c.ebitdaMargin.toFixed(1)}% EBITDA`, gap: "Delivered", why: "Cost cuts offset revenue miss." },
    { q: "Q3'25", promise: `$${(c.arr*0.28).toFixed(0)}M Revenue`, delivery: `$${(c.arr*0.24).toFixed(0)}M Revenue`, gap: "Missed", why: "Contract delays and seasonal softness." },
  ];
  const gapColor = { Delivered: T.ragGreen, Partial: T.ragAmber, Missed: T.ragRed, Exceeded: T.blue04 };
  const levers = [
    `Enterprise expansion into ${c.sector === "Fintech" ? "banking verticals" : c.sector === "SaaS" ? "mid-market segment" : "adjacent markets"}`,
    "AI-driven process automation to reduce operational costs",
    `Geographic expansion to ${c.geo === "AMER" ? "EMEA" : "AMER"} markets`,
    "Product-led growth funnel optimization",
  ];
  const risks = h === "healthy" ? [
    "Competitive pressure from well-funded entrants",
    "Key talent retention in engineering leadership",
  ] : [
    "Customer concentration risk in top accounts",
    "Margin compression from scaling infrastructure costs",
    "Key talent retention in engineering leadership",
  ];
  const inflections = [
    `${c.sector} regulatory changes expected in Q2 2026`,
    `Key contract renewal ($${(c.arr*0.12).toFixed(0)}M) decision in Q1`,
    "Platform migration to next-gen architecture",
  ];
  const boardQA = [
    { n: 1, q: `What is the plan to ${c.nrr < 105 ? "improve NRR beyond" : "sustain NRR at"} ${c.nrr.toFixed(0)}%?`, concern: `If retention ${c.nrr < 105 ? "continues to lag" : "slips"}, growth targets become unreachable.`, reassure: `${c.nrr < 105 ? "New retention program launching Q1" : "Current playbook is working — expansion revenue strong"}.` },
    { n: 2, q: `How will the ${c.sector} market headwinds affect FY26 targets?`, concern: "Market conditions could delay deal cycles and compress margins.", reassure: "Diversified pipeline reduces single-market exposure." },
    { n: 3, q: "What is the expected ROI timeline for recent platform investments?", concern: "Capex may not translate to near-term revenue growth.", reassure: "Early signals show 30% improvement in operational efficiency." },
  ];
  const hiddenRisks = [
    { type: "Financial", items: [`EBITDA underperforming ${(c.ebitdaMargin < 0 ? "significantly" : "slightly")} vs budget`, `Runway falls below 12 months if burn rate increases`, `Concentration risk in top 3 revenue accounts`] },
    { type: "Operational", items: ["Key-person risk in CTO and CRO roles", "VP Sales departure and talent pipeline gap", "Manual QA cycles in release process"] },
    { type: "Market", items: ["Two competitors pricing at cost to win share", `${c.sector} macro headwinds persist`, "Enterprise credit contraction in pipeline"] },
    { type: "Tech", items: ["Infrastructure scaling growing faster than revenue", "Technical debt in legacy integration layer", "Data processing bottleneck for audit compliance"] },
  ];
  return { hLabel, hColor, hBg, grade, gradeColor, ro40, trajectory, vitalSigns, forecasts, gapColor, levers, risks, inflections, boardQA, hiddenRisks,
    strategicRec: h === "healthy"
      ? `Double down on growth — ${c.name}'s strong fundamentals support accelerated investment in product expansion and geographic reach while maintaining current margin discipline.`
      : `Stabilize and restructure — prioritize retention recovery and unit economics improvement before pursuing new growth initiatives. Focus capital on proven revenue streams.`,
    sentimentAnalysis: null,
    futureOutlook: h === "healthy"
      ? `${c.name} is well-positioned for continued growth in FY26. Current trajectory projects ARR reaching $${(c.arr * 1.25).toFixed(0)}M by Q4 2026 if expansion momentum holds. Key enablers include enterprise upsell pipeline maturity and geographic diversification. Primary downside scenario involves competitive pricing pressure compressing margins by 5-8pp.`
      : null
  };
}

function TDEmptyState({ companies, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "64px 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <MI name="search" size={48} color={T.divider} />
      <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault, marginTop: 16 }}>Select a company to view detailed analysis</div>
      <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 8, marginBottom: 24 }}>Choose a company to see comprehensive teardown and insights</div>
      <div style={{ position: "relative", width: 400, margin: "0 auto" }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", height: 40, padding: "0 36px 0 16px", fontSize: 14, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, color: T.typeMuted, textAlign: "left", cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
          Select a company
          <MI name="expand_more" size={18} color={T.typeMuted} style={{ position: "absolute", right: 12, top: 11 }} />
        </button>
        {open && (
          <div style={{ position: "absolute", top: 44, left: 0, width: 400, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 8, boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 320, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 8 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 13, border: `1px solid ${T.dividerLight}`, borderRadius: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} autoFocus />
            </div>
            <div style={{ overflowY: "auto", maxHeight: 260 }}>
              {filtered.map(c => (
                <div key={c.id} onClick={() => { onSelect(c.id); setOpen(false); setSearch(""); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[c.health]) }} />
                  <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                  <span style={{ color: T.typeMuted, fontSize: 12, marginLeft: "auto", flexShrink: 0 }}>{c.sector}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeardownContent({ companies, selectedCompanyId, onSelectCompany }) {
  const subject = companies.find(c => c.id === selectedCompanyId);
  const [sections, setSections] = useState({
    health: true, trajectory: true, vitals: true,
    forecast: true, mgmt: true, strategy: true, levers: true,
    inflections: true, board: true, sentiment: true, hidden: true, outlook: true, echo: true
  });
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeSearch, setChangeSearch] = useState("");
  const [vsSortKey, setVsSortKey] = useState(null); // vital signs sort
  const [vsSortAsc, setVsSortAsc] = useState(true);
  const toggleVsSort = k => { if (k === vsSortKey) setVsSortAsc(!vsSortAsc); else { setVsSortKey(k); setVsSortAsc(true); } };
  const [fcSortKey, setFcSortKey] = useState(null); // forecast accuracy sort
  const [fcSortAsc, setFcSortAsc] = useState(true);
  const toggleFcSort = k => { if (k === fcSortKey) setFcSortAsc(!fcSortAsc); else { setFcSortKey(k); setFcSortAsc(true); } };
  const toggle = k => setSections(p => ({ ...p, [k]: !p[k] }));

  if (!subject) return <div><TDEmptyState companies={companies} onSelect={onSelectCompany} /></div>;

  const td = genTeardown(subject);

  const TDSection = ({ id, title, subtitle, children, trailing }) => (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sections[id] ? 16 : 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>{title}</div>
          {subtitle && sections[id] && <div style={{ fontSize: 14, color: T.typeMuted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {trailing}
          <button onClick={() => toggle(id)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name={sections[id] ? "expand_less" : "expand_more"} size={20} color={T.typeMuted} />
          </button>
        </div>
      </div>
      {sections[id] && children}
    </div>
  );

  return (
    <>
      {/* Company Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: T.typeDefault, lineHeight: "32px" }}>{subject.name}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, background: td.hBg }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: td.hColor }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: td.hColor }}>{td.hLabel}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: T.typeMuted }}>
            <span>{subject.stage}</span>
            <span style={{ fontSize: 16 }}>·</span>
            <span>{subject.sector}</span>
            <span style={{ fontSize: 16 }}>·</span>
            <span>{subject.geo}</span>
            <span style={{ fontSize: 16 }}>·</span>
            <span>Q4 2025</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 8, background: "transparent", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MI name="ios_share" size={20} color={T.typeDefault} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setChangeOpen(!changeOpen); setChangeSearch(""); }} style={{ height: 36, padding: "0 12px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8, background: "transparent", color: T.typeDefault, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <MI name="swap_horiz" size={16} color={T.typeDefault} />Change
            </button>
            {changeOpen && <>
              <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setChangeOpen(false)} />
              <div style={{ position: "absolute", top: 40, right: 0, width: 360, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 8, boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 200, maxHeight: 340, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: 8 }}>
                  <input value={changeSearch} onChange={e => setChangeSearch(e.target.value)} placeholder="Search companies..." style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 13, border: `1px solid ${T.dividerLight}`, borderRadius: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} autoFocus />
                </div>
                <div style={{ overflowY: "auto", maxHeight: 270 }}>
                  {companies.filter(c => c.name.toLowerCase().includes(changeSearch.toLowerCase())).map(c => (
                    <div key={c.id} onClick={() => { onSelectCompany(c.id); setChangeOpen(false); setChangeSearch(""); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", background: c.id === selectedCompanyId ? T.actionSecHover : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                      onMouseLeave={e => e.currentTarget.style.background = c.id === selectedCompanyId ? T.actionSecHover : "transparent"}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: ({ healthy: T.ragGreen, at_risk: T.ragAmber, critical: T.ragRed }[c.health]) }} />
                      <span style={{ fontWeight: c.id === selectedCompanyId ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                      <span style={{ color: T.typeMuted, fontSize: 12, marginLeft: "auto", flexShrink: 0 }}>{c.sector}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        {[
          { l: "ARR", v: `$${subject.arr.toFixed(0)}M` },
          { l: "NRR", v: `${subject.nrr.toFixed(0)}%` },
          { l: "GRR", v: `${subject.grr.toFixed(0)}%` },
          { l: "Rule of 40", v: `${td.ro40}` },
          { l: "Vital Signs", v: `${td.vitalSigns.filter(v => v.status==="green").length}↑ ${td.vitalSigns.filter(v => v.status==="amber").length}→ ${td.vitalSigns.filter(v => v.status==="red").length}↓` },
        ].map(k => (
          <div key={k.l} style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.typeDefault }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Health Summary */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sections.health ? 16 : 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault }}>Health Summary</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AIBadge />
            <button onClick={() => toggle("health")} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <MI name={sections.health ? "expand_less" : "expand_more"} size={20} color={T.typeMuted} />
            </button>
          </div>
        </div>
        {sections.health && (
          <AIContainer>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: td.hColor, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: td.hColor }}>Final Verdict: {td.hLabel}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault, marginBottom: 12 }}>
                {subject.name} is strategically positioned with {subject.arr.toFixed(0)}M ARR and {subject.nrr.toFixed(0)}% NRR. {subject.health === "healthy" ? "Strong fundamentals across key metrics." : subject.health === "at_risk" ? "Several metrics require monitoring and intervention." : "Critical structural issues demand immediate action."}
              </div>
              <div style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault }}>
                {subject.health === "healthy"
                  ? `${subject.name} demonstrates resilient performance across efficiency and retention metrics. The underlying gains position the company well for continued growth as market conditions evolve.`
                  : `${subject.name} faces headwinds in key operational areas. While revenue scale provides a buffer, retention and efficiency metrics indicate structural challenges that need addressing within the next 2-3 quarters.`}
              </div>
              {/* Probe Deeper */}
              <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginTop: 20, marginBottom: 8 }}>Areas Requiring Deeper Investigation</div>
              <div style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault }}>
                Investigate the divergence between enterprise and mid-market retention for {subject.name}. The {subject.nrr < 105 ? "below-target NRR" : "healthy NRR"} may mask segment-level weakness that requires separate strategic responses.
              </div>
              <AIDisclaimer />
            </div>
          </AIContainer>
        )}
      </div>

      {/* 6-Quarter Trajectory */}
      <TDSection id="trajectory" title="6-Quarter Trajectory" subtitle="ARR and NRR trends from board data">
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.typeMuted }}><span style={{ width: 12, height: 3, borderRadius: 2, background: T.blue04 }} />ARR ($M)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.typeMuted }}><span style={{ width: 12, height: 3, borderRadius: 2, background: T.ragGreen }} />NRR (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={td.trajectory} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <XAxis dataKey="q" tick={{ fontSize: 11, fill: T.typeMuted }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: T.typeMuted }} tickFormatter={v => `$${v}M`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: T.typeMuted }} tickFormatter={v => `${v}%`} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.dividerLight}` }} />
              <Line yAxisId="left" type="monotone" dataKey="arr" stroke={T.blue04} strokeWidth={2} dot={{ r: 4, fill: T.blue04 }} name="ARR ($M)" />
              <Line yAxisId="right" type="monotone" dataKey="nrr" stroke={T.ragGreen} strokeWidth={2} dot={{ r: 4, fill: T.ragGreen }} name="NRR (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TDSection>

      {/* Vital Signs */}
      <TDSection id="vitals" title="Vital Signs" subtitle="Key performance indicators and health trends">
        <div style={{ borderBottom: `1px solid ${T.dividerLight}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>
                {[
                  { key: "cat", label: "Category", sortable: true },
                  { key: "kpi", label: "KPI", sortable: true },
                  { key: "current", label: "Current", sortable: true },
                  { key: "qoq", label: "QoQ", sortable: true },
                  { key: "trend", label: "Trend", sortable: false },
                  { key: "causal", label: "Causal Factors", sortable: false },
                  { key: "insight", label: "Insights", sortable: false },
                  { key: "status", label: "Status", sortable: true },
                ].map(h => (
                  <th key={h.key} onClick={h.sortable ? () => toggleVsSort(h.key) : undefined} style={{ padding: "0 12px", height: 40, textAlign: "left", fontWeight: 600, fontSize: 11, background: "#F3F3F3", borderBottom: `1px solid ${T.divider}`, whiteSpace: "nowrap", letterSpacing: "0.3px", cursor: h.sortable ? "pointer" : "default", userSelect: h.sortable ? "none" : "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {h.label}
                      {h.sortable && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, opacity: vsSortKey === h.key ? 1 : 0.5 }}><MI name={vsSortKey === h.key ? (vsSortAsc ? "expand_less" : "expand_more") : "unfold_more"} size={16} color={vsSortKey === h.key ? T.typeDefault : T.typeMuted} /></span>}
                    </div>
                  </th>
                ))}
              </tr></thead>
              <tbody>{[...td.vitalSigns].sort((a, b) => {
                if (!vsSortKey) return 0;
                const va = a[vsSortKey] || "";
                const vb = b[vsSortKey] || "";
                const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
                return vsSortAsc ? cmp : -cmp;
              }).map((v, i) => {
                const statusColor = { green: T.ragGreen, amber: T.ragAmber, red: T.ragRed }[v.status];
                const catColor = { IMPROVING: T.ragGreen, DECLINING: T.ragRed, STABLE: T.ragAmber }[v.cat];
                const catBg = { IMPROVING: "rgba(21,160,21,0.08)", DECLINING: "rgba(160,21,22,0.08)", STABLE: "rgba(254,142,34,0.08)" }[v.cat];
                return (
                  <tr key={i}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, background: catBg, fontSize: 11, fontWeight: 600, color: catColor, letterSpacing: "0.3px" }}>{v.cat}</span>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, fontWeight: 600 }}>{v.kpi}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>{v.current}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>{v.qoq}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, whiteSpace: "nowrap" }}>{v.trend}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, maxWidth: 200, fontSize: 12, color: T.typeMuted }}>{v.causal}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, maxWidth: 200, fontSize: 12, color: T.typeMuted }}>{v.insight}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, textAlign: "center" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      </TDSection>

      {/* Forecast Accuracy */}
      <TDSection id="forecast" title="Forecast Accuracy" subtitle="Historical forecast vs actual analysis">
        <div style={{ borderBottom: `1px solid ${T.dividerLight}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead><tr>
              {[
                { key: "q", label: "Quarter", sortable: true },
                { key: "promise", label: "Promise", sortable: false },
                { key: "delivery", label: "Delivery", sortable: false },
                { key: "gap", label: "Gap", sortable: true },
                { key: "why", label: "Why", sortable: false },
                { key: "gap_s", label: "Status", sortable: true },
              ].map(h => (
                <th key={h.key} onClick={h.sortable ? () => toggleFcSort(h.key === "gap_s" ? "gap" : h.key) : undefined} style={{ padding: "0 12px", height: 40, textAlign: "left", fontWeight: 600, fontSize: 11, background: "#F3F3F3", borderBottom: `1px solid ${T.divider}`, whiteSpace: "nowrap", letterSpacing: "0.3px", cursor: h.sortable ? "pointer" : "default", userSelect: h.sortable ? "none" : "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {h.label}
                    {h.sortable && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, opacity: fcSortKey === (h.key === "gap_s" ? "gap" : h.key) ? 1 : 0.5 }}><MI name={fcSortKey === (h.key === "gap_s" ? "gap" : h.key) ? (fcSortAsc ? "expand_less" : "expand_more") : "unfold_more"} size={16} color={fcSortKey === (h.key === "gap_s" ? "gap" : h.key) ? T.typeDefault : T.typeMuted} /></span>}
                  </div>
                </th>
              ))}
            </tr></thead>
            <tbody>{[...td.forecasts].sort((a, b) => {
              if (!fcSortKey) return 0;
              const gapOrder = { Exceeded: 0, Delivered: 1, Partial: 2, Missed: 3 };
              if (fcSortKey === "gap") {
                const va = gapOrder[a.gap] ?? 9; const vb = gapOrder[b.gap] ?? 9;
                return fcSortAsc ? va - vb : vb - va;
              }
              const va = a[fcSortKey] || ""; const vb = b[fcSortKey] || "";
              const cmp = va.localeCompare(vb);
              return fcSortAsc ? cmp : -cmp;
            }).map((f, i) => (
              <tr key={i}>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, fontWeight: 600 }}>{f.q}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>{f.promise}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>{f.delivery}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}` }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: td.gapColor[f.gap] || T.typeMuted }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: td.gapColor[f.gap] || T.typeMuted }}>{f.gap}</span>
                  </span>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, fontSize: 12, color: T.typeMuted, maxWidth: 260 }}>{f.why}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.dividerLight}`, textAlign: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: td.gapColor[f.gap], display: "inline-block" }} />
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </TDSection>

      {/* Management Assessment */}
      <TDSection id="mgmt" title="Management Assessment" subtitle="Leadership team evaluation">
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 8, background: td.gradeColor, color: "white", fontWeight: 700, fontSize: 18 }}>{td.grade}</div>
            <span style={{ fontSize: 14, color: T.typeMuted }}>Management Grade</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault, marginBottom: 16 }}>
            {subject.health === "healthy" ? "Strong execution across key initiatives. Leadership team demonstrates effective cost control and strategic clarity. Sales pipeline management has improved significantly." : "Mixed execution — strong on cost control but weak on top-line delivery. Sales leadership transition creates near-term uncertainty. Strategic vision is sound but execution gaps persist."}
          </p>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeMuted, marginBottom: 6 }}>Strategic Recommendation</div>
          <div style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}>
            {subject.health === "healthy" ? `Accelerate — continue investing in core product and geographic expansion while maintaining margin discipline.` : `Restructure go-to-market and stabilize retention before pursuing growth investments.`}
          </div>
        </div>
      </TDSection>

      {/* Strategy Analysis */}
      <TDSection id="strategy" title="Strategy Analysis" subtitle="Strategic positioning and recommended path">
        <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.typeDefault, marginBottom: 6 }}>Strategic Recommendation</div>
          <div style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault }}>{td.strategicRec}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginBottom: 12 }}>Strategic Questions</div>
        {[
          { q: "Invest vs. Profit Priority", a: subject.health === "healthy" ? "Prioritize balanced growth — the margin profile supports continued investment while maintaining discipline." : "Prioritize profitability — stabilize unit economics before scaling further." },
          { q: "Hold, Sell, or Invest More?", a: subject.health === "healthy" ? "Invest more — strong fundamentals justify doubling down on differentiated capabilities." : "Hold and restructure — address retention and margin issues before increasing capital deployment." },
          { q: "Operational Changes Needed", a: subject.health === "healthy" ? "1. Expand enterprise sales team. 2. Accelerate platform modernization. 3. Scale customer success org." : "1. Restructure GTM for efficiency. 2. Accelerate platform modernization. 3. Deploy retention task force." },
        ].map((item, i) => (
          <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginBottom: 8 }}>{item.q}</div>
            <div style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}>{item.a}</div>
          </div>
        ))}
      </TDSection>

      {/* Future Outlook */}
      <TDSection id="outlook" title="Future Outlook" subtitle="Forward-looking analysis and projections">
        {td.futureOutlook ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault, margin: 0 }}>{td.futureOutlook}</p>
          </div>
        ) : (
          <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
            <MI name="timeline" size={36} color={T.divider} />
            <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginTop: 12 }}>No future outlook available</div>
            <div style={{ fontSize: 13, color: T.typeMuted, marginTop: 4 }}>Dynamic block analysis has not been generated for this company yet</div>
          </div>
        )}
      </TDSection>

      {/* Growth Levers & Key Risks — side by side */}
      <TDSection id="levers" title="Growth Levers & Key Risks" subtitle="Opportunities and critical factors to monitor">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginBottom: 12 }}>Growth Levers</div>
            <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "20px 24px" }}>
              {td.levers.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < td.levers.length - 1 ? 10 : 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ragGreen, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginBottom: 12 }}>Key Risks</div>
            <div style={{ flex: 1, background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "20px 24px" }}>
              {td.risks.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < td.risks.length - 1 ? 10 : 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ragRed, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TDSection>

      {/* Inflection Items */}
      <TDSection id="inflections" title="Critical Decisions Ahead" subtitle="Business inflection points requiring attention">
        <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "20px 24px" }}>
          {td.inflections.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < td.inflections.length - 1 ? 10 : 0 }}>
              <MI name="warning_amber" size={16} color={T.ragAmber} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}>{item}</span>
            </div>
          ))}
        </div>
      </TDSection>

      {/* Board Questions */}
      <TDSection id="board" title="Board Questions" subtitle="Board-ready questions and answers">
        {td.boardQA.map((qa, i) => (
          <div key={i} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.typeDefault, marginBottom: 10 }}>Q{qa.n}: {qa.q}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ragRed, marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}><span style={{ fontWeight: 600 }}>Concerning:</span> {qa.concern}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ragGreen, marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: "20px", color: T.typeDefault }}><span style={{ fontWeight: 600 }}>Reassuring:</span> {qa.reassure}</span>
            </div>
          </div>
        ))}
      </TDSection>

      {/* Sentiment Analysis */}
      <TDSection id="sentiment" title="Sentiment Analysis" subtitle="Board sentiment and confidence level">
        {td.sentimentAnalysis ? (
          <div style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontSize: 14, lineHeight: "22px", color: T.typeDefault, margin: 0 }}>{td.sentimentAnalysis}</p>
          </div>
        ) : (
          <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
            <MI name="sentiment_neutral" size={36} color={T.divider} />
            <div style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault, marginTop: 12 }}>No sentiment data</div>
            <div style={{ fontSize: 13, color: T.typeMuted, marginTop: 4 }}>Sentiment analysis has not been generated for this company yet</div>
          </div>
        )}
      </TDSection>

      {/* Hidden Risks */}
      <TDSection id="hidden" title="Hidden Risks" subtitle="Potential risks and blind spots">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {td.hiddenRisks.map((col, ci) => (
            <div key={ci} style={{ background: T.surfaceDefault, border: `1px solid ${T.dividerLight}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <MI name={ci === 0 ? "account_balance" : ci === 1 ? "settings" : ci === 2 ? "store" : "memory"} size={16} color={T.ragRed} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.ragRed }}>{col.type}</span>
              </div>
              {col.items.map((item, ii) => (
                <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.typeMuted, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, lineHeight: "18px", color: T.typeMuted }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </TDSection>

      {/* Echo Data */}
      <TDSection id="echo" title="Data Gaps" subtitle="Missing data that would improve the analysis">
        <div style={{ background: T.surfaceVariant, borderRadius: 12, padding: "16px 20px", fontSize: 13, lineHeight: "20px", color: T.typeMuted }}>
          <strong style={{ color: T.typeDefault }}>Missing data that would improve the analysis:</strong>
          <div style={{ marginTop: 8 }}>Customer-level revenue breakdown, segment-level NRR (Enterprise vs SMB), detailed competitive win/loss data, employee satisfaction and attrition metrics, {subject.sector}-specific compliance cost trajectory.</div>
        </div>
      </TDSection>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SMART DATABASE PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
const HP = 40;

// ═══ Dynamic data engine ═══
const AVAILABLE_YEARS = [2022, 2023, 2024, 2025];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Deterministic pseudo-random based on string seed
function seededRand(seed) { let h = 0; for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h + seed.charCodeAt(i)) | 0; } return ((h & 0x7fffffff) % 10000) / 10000; }

function buildMetricData(base2024, unit, est2024, tgt2024, growthRate, name) {
  const data = {};
  AVAILABLE_YEARS.forEach(yr => {
    for (let q = 1; q <= 4; q++) {
      const qi = q - 1;
      const key = `Q${q} ${yr}`;
      const r = seededRand(name + key);
      const yearDiff = yr - 2024;
      const factor = Math.pow(1 + growthRate, yearDiff);
      const jit = (v, spread) => v != null ? Math.round(v * (1 + (r - 0.5) * spread) * 100) / 100 : null;

      let actual, estimated, target;
      if (yr === 2024) {
        actual = base2024[qi]; estimated = est2024[qi]; target = tgt2024[qi];
      } else if (yr === 2025 && q > 1) {
        actual = null; estimated = jit(base2024[qi] * factor, 0.06); target = Math.round(tgt2024[qi] * factor * 100) / 100;
      } else {
        const baseV = base2024[qi] != null ? base2024[qi] : base2024.find(v => v != null);
        actual = baseV != null ? jit(baseV * factor, 0.06) : null;
        estimated = baseV != null ? jit(baseV * factor * 0.97, 0.04) : null;
        target = baseV != null ? Math.round(baseV * factor * 1.05 * 100) / 100 : null;
      }
      if (unit === "%") { [actual, estimated, target] = [actual, estimated, target].map(v => v != null ? Math.round(Math.max(-50, Math.min(150, v)) * 10) / 10 : null); }
      data[key] = { actual, estimated, target };
    }
  });
  return data;
}

const METRIC_GROUPS = [
  { name: "Revenue Metrics", metrics: [
    { name: "Annual Recurring Revenue (ARR)", unit: "USD", data: buildMetricData([2345000,2580000,2810000,3045000],"USD",[2300000,2550000,2850000,3100000],[2400000,2650000,2900000,3200000],0.12,"ARR") },
    { name: "Monthly Recurring Revenue (MRR)", unit: "USD", data: buildMetricData([195417,215000,234167,253750],"USD",[191667,212500,237500,258333],[200000,220833,241667,266667],0.12,"MRR") },
    { name: "Net Revenue Retention", unit: "%", data: buildMetricData([112.5,114.2,111.8,115.0],"%",[111.0,113.0,113.5,114.0],[115.0,115.0,115.0,115.0],0.01,"NRR") },
    { name: "Gross Revenue Retention", unit: "%", data: buildMetricData([91.2,90.8,92.1,91.5],"%",[90.0,91.0,91.5,92.0],[93.0,93.0,93.0,93.0],0.005,"GRR") },
    { name: "Total Contract Value (TCV)", unit: "USD", data: buildMetricData([4850000,5120000,5380000,5640000],"USD",[4800000,5050000,5350000,5600000],[5000000,5300000,5600000,5900000],0.10,"TCV") },
  ]},
  { name: "Profitability", metrics: [
    { name: "Gross Margin", unit: "%", data: buildMetricData([68.5,69.2,70.1,71.3],"%",[68.0,69.0,70.0,71.0],[70.0,71.0,72.0,73.0],0.02,"GM") },
    { name: "EBITDA Margin", unit: "%", data: buildMetricData([-8.2,-5.4,-2.1,1.8],"%",[-9.0,-6.0,-3.0,0.5],[-5.0,-2.0,1.0,4.0],0.3,"EBITDA") },
    { name: "Operating Expense Ratio", unit: "%", data: buildMetricData([76.7,74.6,72.2,69.5],"%",[77.0,75.0,73.0,70.0],[74.0,72.0,70.0,68.0],-0.03,"OpEx") },
    { name: "Burn Multiple", unit: "x", data: buildMetricData([2.4,1.9,1.3,0.8],"x",[2.5,2.0,1.5,1.0],[2.0,1.5,1.0,0.5],-0.15,"BurnMult") },
    { name: "Rule of 40 Score", unit: "", data: buildMetricData([28.3,33.8,38.0,43.1],"",[27.0,32.0,37.0,42.0],[30.0,35.0,40.0,45.0],0.12,"Ro40") },
  ]},
  { name: "Growth Efficiency", metrics: [
    { name: "LTV/CAC Ratio", unit: "x", data: buildMetricData([3.2,3.5,3.8,4.1],"x",[3.0,3.3,3.6,4.0],[3.5,3.8,4.0,4.5],0.08,"LTVcac") },
    { name: "CAC Payback (months)", unit: "mo", data: buildMetricData([18.5,16.2,14.8,13.1],"mo",[19.0,17.0,15.5,14.0],[16.0,14.0,12.0,11.0],-0.08,"CACpb") },
    { name: "Magic Number", unit: "", data: buildMetricData([0.62,0.71,0.85,0.94],"",[0.60,0.68,0.80,0.90],[0.70,0.80,0.90,1.00],0.10,"Magic") },
    { name: "ARR per Employee", unit: "USD", data: buildMetricData([142000,148500,156200,165800],"USD",[140000,147000,155000,163000],[150000,158000,166000,175000],0.08,"ARRemp") },
    { name: "Revenue per FTE", unit: "USD", data: buildMetricData([118000,124200,132500,138900],"USD",[116000,122000,130000,137000],[125000,132000,140000,148000],0.08,"RevFTE") },
  ]},
  { name: "Cash & Liquidity", metrics: [
    { name: "Cash Position", unit: "USD", data: buildMetricData([12500000,10800000,9650000,11200000],"USD",[12000000,10500000,9200000,10800000],[13000000,12000000,11000000,12500000],0.05,"CashPos") },
    { name: "Cash Runway (months)", unit: "mo", data: buildMetricData([18.0,21.5,26.0,34.0],"mo",[17.0,20.0,24.0,31.0],[20.0,24.0,28.0,36.0],0.15,"CashRwy") },
    { name: "Free Cash Flow", unit: "USD", data: buildMetricData([-680000,-520000,-310000,85000],"USD",[-720000,-560000,-350000,50000],[-500000,-300000,-100000,200000],0.25,"FCF") },
    { name: "Net Debt / EBITDA", unit: "x", data: (() => { const d = {}; AVAILABLE_YEARS.forEach(yr => { for (let q=1;q<=4;q++) d[`Q${q} ${yr}`] = { actual:null, estimated:null, target:null }; }); return d; })() },
  ]},
  { name: "Customer Metrics", metrics: [
    { name: "Total Customers", unit: "", data: buildMetricData([142,158,171,189],"",[140,155,168,185],[150,165,180,200],0.10,"TotCust") },
    { name: "Logo Churn Rate", unit: "%", data: buildMetricData([3.8,3.2,2.9,2.5],"%",[4.0,3.5,3.0,2.8],[3.0,2.5,2.0,1.5],-0.10,"LogoChurn") },
    { name: "Average Contract Value", unit: "USD", data: buildMetricData([16500,16330,16430,16110],"USD",[16200,16400,16500,16300],[17000,17500,18000,18500],0.03,"ACV") },
    { name: "Net New ARR", unit: "USD", data: buildMetricData([210000,235000,230000,235000],"USD",[200000,220000,225000,240000],[220000,250000,260000,270000],0.08,"NNARR") },
    { name: "Expansion Revenue %", unit: "%", data: buildMetricData([22.5,24.1,23.8,26.2],"%",[22.0,23.5,24.0,25.5],[25.0,26.0,27.0,28.0],0.05,"ExpRev") },
  ]},
];

// Generate visible period columns from filters
function getVisiblePeriods(periodType, years) {
  const sorted = [...years].sort((a, b) => a - b);
  if (!sorted.length) return [];
  if (periodType === "Yearly") return sorted.map(yr => ({ key: `Y ${yr}`, label: `${yr}`, year: yr }));
  if (periodType === "Monthly") {
    const out = [];
    sorted.forEach(yr => MONTH_NAMES.forEach((m, i) => out.push({ key: `M${i+1} ${yr}`, label: `${m} ${yr}`, year: yr })));
    return out;
  }
  // Quarterly (default / All)
  const out = [];
  sorted.forEach(yr => { for (let q=1;q<=4;q++) out.push({ key: `Q${q} ${yr}`, label: `Q${q} ${yr}`, year: yr }); });
  return out;
}

// Resolve metric data for any period key
function resolveMetricData(metric, periodKey) {
  if (metric.data[periodKey]) return metric.data[periodKey];
  // Yearly aggregation
  if (periodKey.startsWith("Y ")) {
    const yr = parseInt(periodKey.slice(2));
    const qVals = [1,2,3,4].map(q => metric.data[`Q${q} ${yr}`]).filter(Boolean);
    if (!qVals.length) return { actual:null, estimated:null, target:null };
    const agg = (field) => { const v = qVals.map(d => d[field]).filter(x => x!=null); return v.length ? (metric.unit==="USD" ? v.reduce((a,b)=>a+b,0) : v.reduce((a,b)=>a+b,0)/v.length) : null; };
    return { actual: agg("actual"), estimated: agg("estimated"), target: agg("target") };
  }
  // Monthly from quarterly
  if (periodKey.startsWith("M")) {
    const p = periodKey.match(/M(\d+) (\d+)/);
    if (!p) return { actual:null, estimated:null, target:null };
    const mo = parseInt(p[1]), yr = parseInt(p[2]), q = Math.ceil(mo/3);
    const qd = metric.data[`Q${q} ${yr}`];
    if (!qd) return { actual:null, estimated:null, target:null };
    const miq = (mo-1)%3, sp = [0.95,1.0,1.05][miq];
    const fn = metric.unit==="USD" ? (v => v!=null ? Math.round(v*sp/3) : null) : (v => v!=null ? Math.round(v*(0.97+miq*0.015)*100)/100 : null);
    return { actual: fn(qd.actual), estimated: fn(qd.estimated), target: fn(qd.target) };
  }
  return { actual:null, estimated:null, target:null };
}

// Period-over-period change
function computePoP(metric, periods, idx) {
  if (idx <= 0) return null;
  const curr = resolveMetricData(metric, periods[idx].key);
  const prev = resolveMetricData(metric, periods[idx-1].key);
  if (curr.actual==null || prev.actual==null || prev.actual===0) return null;
  return Math.round(((curr.actual-prev.actual)/Math.abs(prev.actual))*1000)/10;
}

function formatMetricValue(val, unit) {
  if (val === null || val === undefined) return "–";
  if (unit === "USD") {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD";
  }
  if (unit === "%" || unit === "x" || unit === "mo" || unit === "") {
    const s = typeof val === "number" ? val.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : val;
    return unit ? `${s}${unit === "x" ? "x" : unit === "mo" ? " mo" : unit}` : s;
  }
  return String(val);
}

function SmartDatabasePage() {
  const SHP = 48;
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("All");
  const [showPeriodDd, setShowPeriodDd] = useState(false);
  const [selectedYears, setSelectedYears] = useState([2022, 2023, 2024]);
  const [showYearDd, setShowYearDd] = useState(false);
  const [showColPanel, setShowColPanel] = useState(false);
  const [colVis, setColVis] = useState({
    actual: true, qoq: true,
    estimated: false, estVsActual: false,
    target: false, tgtVsActual: false,
  });
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const m = {};
    METRIC_GROUPS.forEach(g => { m[g.name] = true; });
    return m;
  });

  // Actions menu + Add Metric side panel
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [addMetricName, setAddMetricName] = useState("");
  const [addMetricNameOpen, setAddMetricNameOpen] = useState(false);
  const [metricSearch, setMetricSearch] = useState("");
  const [addPeriods, setAddPeriods] = useState([]);
  const [kebabOpen, setKebabOpen] = useState(null); // period id
  let nextPeriodId = useRef(1);

  // Column pinning
  const [pinnedKeys, setPinnedKeys] = useState([]); // array of period keys in pin order
  const [periodMenuOpen, setPeriodMenuOpen] = useState(null); // period key or null
  const pinPeriod = (key) => setPinnedKeys(p => p.includes(key) ? p : [...p, key]);
  const unpinPeriod = (key) => setPinnedKeys(p => p.filter(k => k !== key));

  const METRIC_OPTIONS = [
    "Annual Recurring Revenue (ARR)", "Monthly Recurring Revenue (MRR)", "Net Revenue Retention", "Gross Revenue Retention",
    "Total Contract Value (TCV)", "Annual Contract Value (ACV)", "Average Revenue Per Account (ARPA)",
    "Gross Margin", "EBITDA Margin", "Operating Expense Ratio", "Burn Multiple", "Rule of 40 Score",
    "LTV/CAC Ratio", "CAC Payback Period", "Magic Number", "ARR per Employee", "Revenue per FTE",
    "Cash Position", "Cash Runway", "Free Cash Flow", "Net Debt / EBITDA", "Working Capital",
    "Total Customers", "Logo Churn Rate", "Average Contract Value", "Net New ARR", "Expansion Revenue %",
    "Capital Expenditure", "R&D Spend as % of Revenue", "Headcount", "Net Promoter Score (NPS)",
    "Customer Satisfaction (CSAT)", "Debt Service Coverage Ratio", "Revenue per Customer",
    "Gross Dollar Retention", "Quick Ratio (SaaS)", "Payroll Costs", "Marketing Spend",
    "Sales Efficiency Ratio", "Pipeline Coverage Ratio", "Win Rate", "Average Deal Size",
    "Time to Close (days)", "Monthly Active Users (MAU)", "Daily Active Users (DAU)",
    "Activation Rate", "Feature Adoption Rate", "Support Ticket Volume", "Mean Time to Resolution",
  ];
  const UNIT_OPTIONS = ["USD", "%", "x", "mo", "count", "bps"];
  const SCENARIO_OPTIONS = ["Actuals", "Estimated", "Target", "Budget", "Forecast"];

  const addPeriod = () => {
    setAddPeriods(p => [...p, { id: nextPeriodId.current++, periodType: "", year: "2024", quarter: "Q1", month: "Jan", scenario: "Actuals", value: "", unit: "USD", rationale: "" }]);
  };
  const updatePeriod = (id, field, val) => setAddPeriods(p => p.map(pr => pr.id === id ? { ...pr, [field]: val } : pr));
  const deletePeriod = (id) => setAddPeriods(p => p.filter(pr => pr.id !== id));
  const duplicatePeriod = (id) => {
    setAddPeriods(p => {
      const src = p.find(pr => pr.id === id);
      if (!src) return p;
      const idx = p.findIndex(pr => pr.id === id);
      const dup = { ...src, id: nextPeriodId.current++ };
      const next = [...p];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  };
  const resetAddMetric = () => { setAddMetricName(""); setAddPeriods([]); setKebabOpen(null); setAddMetricNameOpen(false); setMetricSearch(""); };
  const closeAddMetric = () => { setShowAddMetric(false); resetAddMetric(); };

  // ═══ Cell Detail / Edit Panel ═══
  const [cellDetail, setCellDetail] = useState(null); // { metric, periodKey, periodLabel }
  const [cellDetailTab, setCellDetailTab] = useState("details"); // "details" | "history"
  const [cellEditing, setCellEditing] = useState(false);
  const [cellEditValue, setCellEditValue] = useState("");
  const [cellEditRationale, setCellEditRationale] = useState("");
  const [cellEditDirty, setCellEditDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [sourceDocsOpen, setSourceDocsOpen] = useState(true);

  const openCellDetail = (metric, periodKey, periodLabel) => {
    const d = resolveMetricData(metric, periodKey);
    setCellDetail({ metric, periodKey, periodLabel, data: d });
    setCellDetailTab("details");
    setCellEditing(false);
    setCellEditDirty(false);
    setSourceDocsOpen(true);
  };
  const startEditing = () => {
    const d = cellDetail.data;
    setCellEditValue(d.actual != null ? String(d.actual) : "");
    setCellEditRationale("The company's equity-to-debt ratio remained stable at 0.65 in Q3, indicating a balanced capital structure with moderate leverage. The ratio is unchanged versus prior quarters, suggesting no major equity issuances or debt refinancing activity during the period.");
    setCellEditing(true);
    setCellEditDirty(false);
  };
  const closeCellDetail = () => {
    if (cellEditing && cellEditDirty) { setShowDiscardDialog(true); return; }
    setCellDetail(null); setCellEditing(false);
  };
  const discardAndClose = () => { setShowDiscardDialog(false); setCellDetail(null); setCellEditing(false); };

  // Mock history data for any metric
  const getMockHistory = (metric, periodKey) => {
    const d = resolveMetricData(metric, periodKey);
    return [
      { value: d.actual, unit: metric.unit, date: "January 14, 2024 at 03:45 PM", user: "Anne Lee", source: "AI extracted", excerpt: `"..The company experienced a 12% upswing in revenue year on year, achieving ${formatMetricValue(d.actual, metric.unit)}..."`, rationale: "The growth is due to several activities on the field of AI", note: "Actual changed compared to previous quarter due to accounting adjustments" },
      { value: d.actual != null ? d.actual * 0.92 : null, unit: metric.unit, date: "January 14, 2024 at 03:45 PM", user: "Anne Lee", source: "AI extracted", excerpt: `"..The company experienced a 12% upswing in revenue year on year, achieving 132,450,000 USD..."`, rationale: "The growth is due to several activities on the field of AI", note: "Actual changed compared to previous quarter due to accounting adjustments" },
      { value: d.actual != null ? d.actual * 1.04 : null, unit: metric.unit, date: "January 14, 2024 at 03:45 PM", user: "Anne Lee", source: "AI extracted", excerpt: `"..The company experienced a 12% upswing in revenue year on year, achieving 132,450,000 USD..."`, rationale: "The growth is due to several activities on the field of AI", note: "Actual changed compared to previous quarter due to accounting adjustments" },
    ];
  };

  const toggleGroup = (name) => setExpandedGroups(p => ({ ...p, [name]: !p[name] }));
  const toggleCol = (key) => setColVis(p => {
    const next = { ...p, [key]: !p[key] };
    // Auto-disable variance columns when parent is off
    if (key === "estimated" && !next.estimated) next.estVsActual = false;
    if (key === "target" && !next.target) next.tgtVsActual = false;
    return next;
  });

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return METRIC_GROUPS;
    const q = search.toLowerCase();
    return METRIC_GROUPS.map(g => ({
      ...g,
      metrics: g.metrics.filter(m => m.name.toLowerCase().includes(q)),
    })).filter(g => g.metrics.length > 0);
  }, [search]);

  // Compute visible periods from filter state
  const visiblePeriods = useMemo(() => {
    const pType = period === "All" ? "Quarterly" : period;
    const yrs = selectedYears.length > 0 ? selectedYears : AVAILABLE_YEARS;
    return getVisiblePeriods(pType, yrs);
  }, [period, selectedYears]);

  // Build dynamic sub-columns based on visibility toggles
  const popLabel = period === "Yearly" ? "YoY" : period === "Monthly" ? "MoM" : "QoQ";
  const subCols = useMemo(() => {
    const cols = [];
    if (colVis.actual) cols.push({ key: "actual", label: "Actual" });
    if (colVis.qoq) cols.push({ key: "qoq", label: popLabel });
    if (colVis.estimated) cols.push({ key: "estimated", label: "Estimated" });
    if (colVis.estVsActual) cols.push({ key: "estVsActual", label: "Δ Est vs Act" });
    if (colVis.target) cols.push({ key: "target", label: "Target" });
    if (colVis.tgtVsActual) cols.push({ key: "tgtVsActual", label: "Δ Tgt vs Act" });
    return cols;
  }, [colVis, popLabel]);

  const cellW = 140;
  const metricW = 260;
  const headerH = 36;
  const rowH = 44;
  const groupRowH = 38;
  const quarterW = subCols.length * cellW;

  // Compute a cell value for metric + period index + sub-column
  const getCellValue = (m, pi, colKey) => {
    const pKey = visiblePeriods[pi]?.key;
    if (!pKey) return { val: null };
    const d = resolveMetricData(m, pKey);
    switch (colKey) {
      case "actual": return { val: d.actual, unit: m.unit };
      case "qoq": return { qoq: computePoP(m, visiblePeriods, pi) };
      case "estimated": return { val: d.estimated, unit: m.unit };
      case "estVsActual": {
        if (d.actual == null || d.estimated == null) return { val: null, unit: m.unit };
        const pct = d.estimated !== 0 ? ((d.actual - d.estimated) / Math.abs(d.estimated)) * 100 : null;
        return { variance: pct, unit: m.unit };
      }
      case "target": return { val: d.target, unit: m.unit };
      case "tgtVsActual": {
        if (d.actual == null || d.target == null) return { val: null, unit: m.unit };
        const pct = d.target !== 0 ? ((d.actual - d.target) / Math.abs(d.target)) * 100 : null;
        return { variance: pct, unit: m.unit };
      }
      default: return { val: null };
    }
  };

  // Render a single data cell
  const renderCell = (cellData, isLast, onClick) => {
    const base = { flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 10px", fontSize: 12, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", borderRight: isLast ? "none" : `1px solid ${T.dividerLight}`, cursor: onClick ? "pointer" : "default" };
    const hp = onClick ? { onMouseEnter: e => { e.currentTarget.style.background = "rgba(11,76,206,0.04)"; }, onMouseLeave: e => { e.currentTarget.style.background = "transparent"; } } : {};
    if ("qoq" in cellData) {
      const v = cellData.qoq;
      if (v === null || v === undefined) return <div style={{ ...base, color: T.typeDisabled }} onClick={onClick} {...hp}>–</div>;
      return (
        <div style={base} onClick={onClick} {...hp}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <MI name={v >= 0 ? "arrow_drop_up" : "arrow_drop_down"} size={16} color={v >= 0 ? T.ragGreen : T.ragRed} />
            <span style={{ color: v >= 0 ? T.ragGreen : T.ragRed, fontWeight: 500 }}>{Math.abs(v).toFixed(1)}%</span>
          </span>
        </div>
      );
    }
    if ("variance" in cellData) {
      const v = cellData.variance;
      if (v === null || v === undefined) return <div style={{ ...base, color: T.typeDisabled }} onClick={onClick} {...hp}>–</div>;
      return (
        <div style={base} onClick={onClick} {...hp}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <MI name={v >= 0 ? "arrow_drop_up" : "arrow_drop_down"} size={16} color={v >= 0 ? T.ragGreen : T.ragRed} />
            <span style={{ color: v >= 0 ? T.ragGreen : T.ragRed, fontWeight: 500 }}>{v >= 0 ? "+" : ""}{v.toFixed(1)}%</span>
          </span>
        </div>
      );
    }
    const v = cellData.val;
    return <div style={{ ...base, color: v !== null && v !== undefined ? T.typeDefault : T.typeDisabled }} onClick={onClick} {...hp}>{formatMetricValue(v, cellData.unit)}</div>;
  };

  // Toggle switch — Atlas Lens Size=Small: 32×16px
  const Toggle = ({ on, onChange, disabled }) => (
    <div onClick={disabled ? undefined : onChange} style={{ width: 32, height: 16, borderRadius: 8, background: on ? T.surfaceInverse : T.surfaceDefault, border: on ? "none" : `1.5px solid ${T.outlineDefault}`, cursor: disabled ? "default" : "pointer", position: "relative", transition: "all 0.15s", flexShrink: 0, boxSizing: "border-box" }}>
      <div style={{ width: on ? 12 : 8, height: on ? 12 : 8, borderRadius: 6, background: on ? T.surfaceDefault : T.surfaceInverse, position: "absolute", top: on ? 2 : 2.5, left: on ? 17 : 4, transition: "all 0.15s" }} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
      <TopBar />
      <div style={{ flex: 1, overflow: "auto", background: T.surfaceDefault }}>
        <div style={{ padding: `24px ${SHP}px 0` }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 14, color: T.typeMuted, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, height: 32 }}>
            <span style={{ cursor: "pointer" }}>Portfolio Intelligence</span>
            <MI name="chevron_right" size={16} color={T.typeMuted} />
            <span style={{ fontWeight: 600, color: T.typeDefault }}>Company Metrics</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 600, margin: "0 0 8px", color: T.typeDefault, lineHeight: "38px" }}>Company Metrics</h1>
        </div>

        {/* Master data table header */}
        <div style={{ padding: `32px ${SHP}px 0` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 48 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: T.typeDefault, lineHeight: "28px" }}>Master data table</h2>
              <p style={{ fontSize: 14, color: T.typeMuted, margin: "4px 0 0", lineHeight: "20px" }}>A collection of all validated extractions — your current trusted set of company metrics.</p>
            </div>
            <button style={{ height: 40, padding: "0 20px", background: T.surfaceInverse, color: T.typeInverse, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>Update dataset</button>
          </div>

          {/* Toolbar — single row: filters left (fill), actions right */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 24 }}>
            {/* Search */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, marginBottom: 8, letterSpacing: "0.3px", lineHeight: "16px" }}>Search</div>
              <div style={{ position: "relative" }}>
                <MI name="search" size={18} color={T.typeMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by metric" style={{ height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 12px 0 36px", fontSize: 16, fontFamily: "inherit", color: T.typeDefault, background: T.surfaceDefault, outline: "none", boxSizing: "border-box", letterSpacing: "0.2px" }} />
              </div>
            </div>
            {/* Period — single select, list with dividers */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, marginBottom: 8, letterSpacing: "0.3px", lineHeight: "16px" }}>Period</div>
              <button onClick={() => { setShowPeriodDd(p => !p); setShowYearDd(false); }} style={{ height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 36px 0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", position: "relative", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
                {period}
                <MI name={showPeriodDd ? "expand_less" : "expand_more"} size={20} color={T.typeMuted} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
              </button>
              {showPeriodDd && <>
                <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setShowPeriodDd(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, minWidth: 320, background: T.surfaceDefault, borderRadius: 8, zIndex: 200, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", padding: 24, overflow: "hidden" }}>
                  {["Yearly", "Quarterly", "Monthly"].map((opt, i, arr) => (
                    <button key={opt} onClick={() => { setPeriod(opt); setShowPeriodDd(false); }}
                      style={{ display: "flex", alignItems: "center", width: "100%", padding: "12px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", position: "relative", borderRadius: 0 }}
                      onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {opt}
                      {i < arr.length - 1 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.divider }} />}
                    </button>
                  ))}
                </div>
              </>}
            </div>
            {/* Year — multi-select with checkboxes */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, marginBottom: 8, letterSpacing: "0.3px", lineHeight: "16px" }}>Year</div>
              <button onClick={() => { setShowYearDd(p => !p); setShowPeriodDd(false); }} style={{ height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 36px 0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", position: "relative", display: "flex", alignItems: "center", boxSizing: "border-box", overflow: "hidden" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedYears.length === 0 || selectedYears.length === AVAILABLE_YEARS.length
                    ? "All"
                    : `(${selectedYears.length}) ${[...selectedYears].sort((a,b) => a-b).join(", ")}`}
                </span>
                <MI name={showYearDd ? "expand_less" : "expand_more"} size={20} color={T.typeMuted} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
              </button>
              {showYearDd && <>
                <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setShowYearDd(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, minWidth: 320, background: T.surfaceDefault, borderRadius: 8, zIndex: 200, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", padding: 24, overflow: "hidden" }}>
                  {[2022, 2023, 2024, 2025].map((yr, i, arr) => {
                    const checked = selectedYears.includes(yr);
                    return (
                      <button key={yr} onClick={() => setSelectedYears(prev => checked ? prev.filter(y => y !== yr) : [...prev, yr])}
                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", position: "relative", borderRadius: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {/* Checkbox */}
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: checked ? T.surfaceInverse : T.surfaceDefault, border: checked ? "none" : `1.5px solid ${T.outlineDefault}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "border-box" }}>
                          {checked && <MI name="check" size={14} color="#FFFFFF" />}
                        </div>
                        {yr}
                        {i < arr.length - 1 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.divider }} />}
                      </button>
                    );
                  })}
                </div>
              </>}
            </div>
            {/* Action buttons — right-aligned */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer", borderRadius: 12 }}
                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onMouseDown={e => e.currentTarget.style.background = "#E6E6E6"}
                onMouseUp={e => e.currentTarget.style.background = T.actionSecHover}>
                <MI name="filter_alt" size={20} color={T.typeDefault} />
              </button>
              {/* Columns button + panel */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowColPanel(p => !p); setShowPeriodDd(false); setShowYearDd(false); }} style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "none", background: showColPanel ? T.actionSecHover : "transparent", cursor: "pointer", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.16px" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                  onMouseLeave={e => { if (!showColPanel) e.currentTarget.style.background = "transparent"; }}
                  onMouseDown={e => e.currentTarget.style.background = "#E6E6E6"}
                  onMouseUp={e => e.currentTarget.style.background = T.actionSecHover}>
                  <MI name="view_column" size={20} color={T.typeDefault} /> Columns
                </button>
                {showColPanel && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowColPanel(false)} />
                    <div style={{ position: "absolute", top: 44, right: 0, zIndex: 100, width: 418, background: T.surfaceDefault, borderRadius: 8, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.divider}` }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px" }}>Show columns:</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {/* Actuals group */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { key: "actual", label: "Actual" },
                            { key: "qoq", label: "Actual vs. previous period" },
                          ].map((item) => (
                            <div key={item.key} style={{ display: "flex", alignItems: "center", height: 48, padding: "0 12px", position: "relative" }}>
                              <span style={{ flex: 1, fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px" }}>{item.label}</span>
                              <Toggle on={colVis[item.key]} onChange={() => toggleCol(item.key)} />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.divider }} />
                            </div>
                          ))}
                        </div>

                        {/* Estimated group */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { key: "estimated", label: "Estimated" },
                            { key: "estVsActual", label: "Estimated vs. actual", parent: "estimated" },
                          ].map((item) => (
                            <div key={item.key} style={{ display: "flex", alignItems: "center", height: 48, padding: "0 12px", position: "relative" }}>
                              <span style={{ flex: 1, fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px" }}>{item.label}</span>
                              <Toggle on={colVis[item.key]} onChange={() => toggleCol(item.key)} disabled={item.parent && !colVis[item.parent]} />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.divider }} />
                            </div>
                          ))}
                        </div>

                        {/* Target group */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { key: "target", label: "Target" },
                            { key: "tgtVsActual", label: "Target vs. actual", parent: "target" },
                          ].map((item, i) => (
                            <div key={item.key} style={{ display: "flex", alignItems: "center", height: 48, padding: "0 12px", position: "relative" }}>
                              <span style={{ flex: 1, fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px" }}>{item.label}</span>
                              <Toggle on={colVis[item.key]} onChange={() => toggleCol(item.key)} disabled={item.parent && !colVis[item.parent]} />
                              {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.divider }} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowActionsMenu(p => !p); setShowColPanel(false); setShowPeriodDd(false); setShowYearDd(false); }} style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "none", background: showActionsMenu ? "#E6E6E6" : "transparent", cursor: "pointer", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.16px" }}
                  onMouseEnter={e => { if (!showActionsMenu) e.currentTarget.style.background = T.actionSecHover; }}
                  onMouseLeave={e => { if (!showActionsMenu) e.currentTarget.style.background = "transparent"; }}>
                  <MI name="edit" size={20} color={T.typeDefault} /> Actions
                </button>
                {showActionsMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowActionsMenu(false)} />
                    <div style={{ position: "absolute", top: 44, right: 0, zIndex: 100, background: T.surfaceDefault, borderRadius: 8, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", minWidth: 220, overflow: "hidden" }}>
                      <button onClick={() => { setShowActionsMenu(false); setShowAddMetric(true); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left" }}
                        onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <MI name="add" size={20} color={T.typeDefault} /> Add metrics to table
                      </button>
                      <div style={{ height: 1, background: T.dividerLight }} />
                      <button style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left" }}
                        onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <MI name="download" size={20} color={T.typeDefault} /> Export table
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: `0 ${SHP}px 56px`, overflow: "hidden" }}>
          <div style={{ overflow: "auto", maxHeight: "calc(100vh - 340px)" }}>
            <div style={{ display: "flex", minWidth: "fit-content" }}>
              {/* Metric column (sticky) */}
              <div style={{ position: "sticky", left: 0, zIndex: 10, background: T.surfaceDefault, minWidth: metricW, width: metricW, flexShrink: 0, borderRight: `1px solid ${T.dividerLight}` }}>
                <div style={{ height: headerH, background: T.tableHeaderBg, borderBottom: `1px solid ${T.divider}` }} />
                <div style={{ height: headerH, background: T.tableHeaderBg, borderBottom: `1px solid ${T.divider}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px" }}>Metric</span>
                  <MI name="unfold_more" size={14} color={T.typeMuted} style={{ cursor: "pointer" }} />
                </div>
                {filteredGroups.map(group => (
                  <React.Fragment key={group.name}>
                    <div style={{ height: groupRowH, background: "rgba(11, 76, 206, 0.04)", borderBottom: `1px solid ${T.dividerLight}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 6, cursor: "pointer" }} onClick={() => toggleGroup(group.name)}>
                      <MI name="drag_indicator" size={14} color={T.typeMuted} />
                      <MI name={expandedGroups[group.name] ? "expand_more" : "chevron_right"} size={16} color={T.typeMuted} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.blue04 }}>{group.name}</span>
                    </div>
                    {expandedGroups[group.name] && group.metrics.map(m => (
                      <div key={m.name} style={{ height: rowH, borderBottom: `1px solid ${T.dividerLight}`, display: "flex", alignItems: "center", padding: "0 12px 0 44px", fontSize: 12, color: T.typeDefault, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.name}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {/* Dynamic period columns — in natural order, pinned ones get sticky */}
              {visiblePeriods.map((p, pi) => {
                const isPinned = pinnedKeys.includes(p.key);
                // Calculate sticky left: metricW border + sum of all pinned columns that appear BEFORE this one in natural order
                let stickyLeft = metricW + 1;
                if (isPinned) {
                  for (let i = 0; i < pi; i++) {
                    if (pinnedKeys.includes(visiblePeriods[i].key)) {
                      stickyLeft += quarterW + 5; // col width + gap
                    }
                  }
                }
                // Is this the last pinned column in natural order?
                const isLastPinned = isPinned && !visiblePeriods.slice(pi + 1).some(vp => pinnedKeys.includes(vp.key));

                return (
                  <div key={p.key} style={{
                    display: "flex", flexDirection: "column", minWidth: quarterW, width: quarterW, flexShrink: 0,
                    marginLeft: pi === 0 ? 0 : 4,
                    borderLeft: pi === 0 ? "none" : `1px solid ${T.divider}`,
                    borderRight: `1px solid ${T.divider}`,
                    ...(isPinned ? {
                      position: "sticky", left: stickyLeft, zIndex: 9,
                      background: T.surfaceDefault,
                      boxShadow: isLastPinned ? "4px 0 8px rgba(0,0,0,0.08)" : "none",
                    } : {}),
                  }}>
                    {/* Period header */}
                    <div style={{ height: headerH, background: isPinned ? "#EDF0F5" : T.tableHeaderBg, borderBottom: `1px solid ${T.divider}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", gap: 4, position: "relative" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", whiteSpace: "nowrap" }}>{p.label}</span>
                      {isPinned && <MI name="push_pin" size={14} color={T.typeMuted} />}
                      <div style={{ position: "relative" }}>
                        <button onClick={(e) => { e.stopPropagation(); setPeriodMenuOpen(periodMenuOpen === p.key ? null : p.key); }}
                          style={{ width: 20, height: 20, border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <MI name="more_vert" size={14} color={T.typeMuted} />
                        </button>
                        {periodMenuOpen === p.key && (
                          <>
                            <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setPeriodMenuOpen(null)} />
                            <div style={{ position: "absolute", top: 24, right: 0, zIndex: 51, background: T.surfaceDefault, borderRadius: 8, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", minWidth: 180, overflow: "hidden" }}>
                              <button onClick={() => { isPinned ? unpinPeriod(p.key) : pinPeriod(p.key); setPeriodMenuOpen(null); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left" }}
                                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <MI name="push_pin" size={20} color={T.typeDefault} /> {isPinned ? "Unpin column" : "Pin column"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Sub-headers */}
                    <div style={{ display: "flex", height: headerH, borderBottom: `1px solid ${T.divider}` }}>
                      {subCols.map((sc, sci) => (
                        <div key={sc.key} style={{ flex: 1, background: isPinned ? "#EDF0F5" : T.tableHeaderBg, borderRight: sci < subCols.length - 1 ? `1px solid ${T.divider}` : "none", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.2px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{sc.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Data rows */}
                    {filteredGroups.map(group => (
                      <React.Fragment key={group.name}>
                        <div style={{ height: groupRowH, background: isPinned ? "rgba(11,76,206,0.06)" : "rgba(11, 76, 206, 0.04)", borderBottom: `1px solid ${T.dividerLight}` }} />
                        {expandedGroups[group.name] && group.metrics.map(m => (
                          <div key={m.name} style={{ display: "flex", height: rowH, borderBottom: `1px solid ${T.dividerLight}`, background: isPinned ? T.surfaceDefault : "transparent" }}>
                            {subCols.map((sc, sci) => (
                              <React.Fragment key={sc.key}>{renderCell(getCellValue(m, pi, sc.key), sci === subCols.length - 1, () => openCellDetail(m, visiblePeriods[pi].key, visiblePeriods[pi].label))}</React.Fragment>
                            ))}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* ═══ Add Metric Side Panel ═══ */}
      {showAddMetric && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} onClick={closeAddMetric} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 540, background: T.surfaceDefault, zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>Add new metric</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "20px", marginTop: 4 }}>Add a new metric manually to the master database</div>
                </div>
                <button onClick={closeAddMetric} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <MI name="close" size={20} color={T.typeDefault} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              {/* Metric name + Add period */}
              <div style={{ display: "flex", gap: 32, alignItems: "flex-end", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 8 }}>Metric name</div>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setAddMetricNameOpen(p => !p)} style={{ height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 36px 0 12px", fontSize: 16, fontWeight: 400, color: addMetricName ? T.typeDefault : T.typeMuted, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left", boxSizing: "border-box" }}>
                      {addMetricName || "Choose an option"}
                      <MI name="expand_more" size={20} color={T.typeMuted} style={{ position: "absolute", right: 10, top: 10 }} />
                    </button>
                    {addMetricNameOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => { setAddMetricNameOpen(false); setMetricSearch(""); }} />
                        <div style={{ position: "absolute", top: 44, left: 0, right: 0, zIndex: 11, background: T.surfaceDefault, borderRadius: 8, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: 320 }}>
                          <div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.dividerLight}`, flexShrink: 0 }}>
                            <div style={{ position: "relative" }}>
                              <MI name="search" size={18} color={T.typeMuted} style={{ position: "absolute", left: 10, top: 9 }} />
                              <input autoFocus value={metricSearch} onChange={e => setMetricSearch(e.target.value)} placeholder="Search metrics…"
                                style={{ height: 36, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 12px 0 34px", fontSize: 14, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, fontFamily: "inherit", letterSpacing: "0.2px", boxSizing: "border-box", outline: "none" }} />
                            </div>
                          </div>
                          <div style={{ overflow: "auto", flex: 1 }}>
                            {METRIC_OPTIONS.filter(o => o.toLowerCase().includes(metricSearch.toLowerCase())).map((opt, oi, arr) => (
                              <div key={opt} onClick={() => { setAddMetricName(opt); setAddMetricNameOpen(false); setMetricSearch(""); }}
                                style={{ padding: "12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, cursor: "pointer", letterSpacing: "0.2px", lineHeight: "24px", borderBottom: oi < arr.length - 1 ? `1px solid ${T.dividerLight}` : "none" }}
                                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                {opt}
                              </div>
                            ))}
                            {METRIC_OPTIONS.filter(o => o.toLowerCase().includes(metricSearch.toLowerCase())).length === 0 && (
                              <div style={{ padding: "16px 12px", fontSize: 14, color: T.typeMuted, textAlign: "center" }}>No metrics found</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={addPeriod} style={{ height: 40, padding: "0 16px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "1px", lineHeight: "20px", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                  <MI name="add" size={18} color={T.typeDefault} /> Add period
                </button>
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 24 }}>Select a metric, then add values for each time period and scenario.</div>

              {/* Period cards */}
              {addPeriods.map((pr, pi) => {
                const FL = ({ label, children }) => (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 8 }}>{label}</div>
                    {children}
                  </div>
                );
                const selSt = { height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%236f7377' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", boxSizing: "border-box" };
                const inpSt = { height: 40, width: "100%", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, fontFamily: "inherit", letterSpacing: "0.2px", boxSizing: "border-box", outline: "none" };

                return (
                  <div key={pr.id} style={{ background: "#F3F3F3", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                    {/* Period header + kebab */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px", lineHeight: "16px" }}>Period {pi + 1}</span>
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setKebabOpen(kebabOpen === pr.id ? null : pr.id)}
                          style={{ width: 32, height: 32, border: "none", background: kebabOpen === pr.id ? "#E6E6E6" : "transparent", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { if (kebabOpen !== pr.id) e.currentTarget.style.background = T.actionSecHover; }}
                          onMouseLeave={e => { if (kebabOpen !== pr.id) e.currentTarget.style.background = "transparent"; }}>
                          <MI name="more_vert" size={20} color={T.typeDefault} />
                        </button>
                        {kebabOpen === pr.id && (
                          <>
                            <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setKebabOpen(null)} />
                            <div style={{ position: "absolute", top: 36, right: 0, zIndex: 11, background: T.surfaceDefault, borderRadius: 8, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)", minWidth: 200, overflow: "hidden" }}>
                              <button onClick={() => { duplicatePeriod(pr.id); setKebabOpen(null); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left" }}
                                onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <MI name="add" size={20} color={T.typeDefault} /> Duplicate period
                              </button>
                              <div style={{ height: 1, background: T.dividerLight }} />
                              <button onClick={() => { deletePeriod(pr.id); setKebabOpen(null); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 400, color: "#921A1D", letterSpacing: "0.2px", lineHeight: "24px", textAlign: "left" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(146,26,29,0.06)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <MI name="delete" size={20} color="#921A1D" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {/* Row 1: Period type only initially */}
                      <div style={{ display: "flex", gap: 16 }}>
                        <FL label="Period type">
                          <select value={pr.periodType} onChange={e => updatePeriod(pr.id, "periodType", e.target.value)} style={{ ...selSt, color: pr.periodType ? T.typeDefault : T.typeMuted }}>
                            <option value="" disabled>Choose an option</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </FL>
                        {pr.periodType && (
                          <FL label="Year"><select value={pr.year} onChange={e => updatePeriod(pr.id, "year", e.target.value)} style={selSt}><option>2022</option><option>2023</option><option>2024</option><option>2025</option></select></FL>
                        )}
                      </div>
                      {/* Remaining fields only show after period type is chosen */}
                      {pr.periodType && (<>
                        {/* Row 2: Quarter/Month (conditional) + Scenario */}
                        <div style={{ display: "flex", gap: 16 }}>
                          {pr.periodType === "Quarterly" && (
                            <FL label="Quarter"><select value={pr.quarter} onChange={e => updatePeriod(pr.id, "quarter", e.target.value)} style={selSt}><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></select></FL>
                          )}
                          {pr.periodType === "Monthly" && (
                            <FL label="Month"><select value={pr.month} onChange={e => updatePeriod(pr.id, "month", e.target.value)} style={selSt}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <option key={m}>{m}</option>)}</select></FL>
                          )}
                          <FL label="Scenario"><select value={pr.scenario} onChange={e => updatePeriod(pr.id, "scenario", e.target.value)} style={selSt}>{SCENARIO_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></FL>
                        </div>
                        {/* Row 3: Value + Unit */}
                        <div style={{ display: "flex", gap: 16 }}>
                          <FL label="Value"><input value={pr.value} onChange={e => updatePeriod(pr.id, "value", e.target.value)} placeholder="1,222,3333" style={inpSt} /></FL>
                          <FL label="Unit"><select value={pr.unit} onChange={e => updatePeriod(pr.id, "unit", e.target.value)} style={selSt}>{UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}</select></FL>
                        </div>
                        {/* Row 4: Rationale */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 8 }}>Rationale</div>
                          <textarea value={pr.rationale} onChange={e => updatePeriod(pr.id, "rationale", e.target.value)} placeholder="Increase led by the current investments in innovation initiatives"
                            style={{ width: "100%", minHeight: 80, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "10px 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "24px", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                        </div>
                      </>)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${T.divider}`, padding: "16px 24px", display: "flex", justifyContent: addPeriods.length > 0 ? "space-between" : "flex-end", alignItems: "center", flexShrink: 0 }}>
              {addPeriods.length > 0 ? (<>
                <button onClick={closeAddMetric} style={{ height: 40, padding: "0 20px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: T.typeDefault, letterSpacing: "1px" }}>Cancel</button>
                <button onClick={closeAddMetric} style={{ height: 40, padding: "0 20px", border: "none", borderRadius: 8, background: T.surfaceInverse, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: T.surfaceDefault, letterSpacing: "1px", opacity: addMetricName && addPeriods.some(p => p.periodType && p.value) ? 1 : 0.4 }}>Add metric</button>
              </>) : (
                <button onClick={closeAddMetric} style={{ height: 40, padding: "0 20px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: T.typeDefault, letterSpacing: "1px" }}>Close</button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ Cell Detail / Edit Side Panel ═══ */}
      {cellDetail && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} onClick={closeCellDetail} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: T.surfaceDefault, zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: T.typeDefault, lineHeight: "28px" }}>{cellDetail.metric.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.2px", lineHeight: "20px", marginTop: 2 }}>Actual – {cellDetail.periodLabel}</div>
                </div>
                <button onClick={closeCellDetail} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <MI name="close" size={20} color={T.typeDefault} />
                </button>
              </div>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.divider}`, marginTop: 16 }}>
                {["Details", "History"].map(tab => (
                  <button key={tab} onClick={() => setCellDetailTab(tab.toLowerCase())} style={{ padding: "10px 20px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: cellDetailTab === tab.toLowerCase() ? T.typeDefault : T.typeMuted, letterSpacing: "0.2px", borderBottom: cellDetailTab === tab.toLowerCase() ? "2px solid #C8102E" : "2px solid transparent", marginBottom: -1 }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {/* ── Details Tab ── */}
              {cellDetailTab === "details" && (<>
                {/* Edit / Editing toggle */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  {!cellEditing ? (
                    <button onClick={startEditing} style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.2px" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.actionSecHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <MI name="edit" size={16} color={T.typeDefault} /> Edit details
                    </button>
                  ) : (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 8, background: T.surfaceInverse }}>
                      <MI name="edit" size={16} color={T.surfaceDefault} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.surfaceDefault, letterSpacing: "0.2px" }}>Editing</span>
                    </div>
                  )}
                </div>

                {/* Value section */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 8 }}>Value</div>
                  {cellEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input value={cellEditValue} onChange={e => { setCellEditValue(e.target.value); setCellEditDirty(true); }}
                        style={{ flex: 1, height: 40, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "0 12px", fontSize: 16, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                      <span style={{ fontSize: 14, fontWeight: 400, color: T.typeMuted }}>{cellDetail.metric.unit}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 600, color: T.typeDefault }}>{formatMetricValue(cellDetail.data.actual, cellDetail.metric.unit)}</span>
                      {(() => {
                        const periods = getVisiblePeriods(period === "All" ? "Quarterly" : period, selectedYears.length > 0 ? selectedYears : AVAILABLE_YEARS);
                        const idx = periods.findIndex(p => p.key === cellDetail.periodKey);
                        const pop = idx > 0 ? computePoP(cellDetail.metric, periods, idx) : null;
                        if (pop == null) return null;
                        return (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 14 }}>
                            <MI name={pop >= 0 ? "arrow_drop_up" : "arrow_drop_down"} size={16} color={pop >= 0 ? T.ragGreen : T.ragRed} />
                            <span style={{ color: pop >= 0 ? T.ragGreen : T.ragRed, fontWeight: 500 }}>{Math.abs(pop).toFixed(1)}%</span>
                            <span style={{ color: T.typeMuted, marginLeft: 4 }}>{popLabel}</span>
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Data Origin */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px", marginBottom: 8 }}>Data Origin</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: T.typeDefault }}>AI extracted</span>
                    <MI name="info" size={16} color={T.typeMuted} style={{ cursor: "pointer" }} />
                  </div>
                </div>

                {/* Rationale */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", lineHeight: "16px" }}>Rationale</span>
                    {!cellEditing && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: T.typeMuted }}><MI name="auto_awesome" size={14} color={T.typeMuted} /> Generated by AI</span>}
                  </div>
                  {cellEditing ? (
                    <textarea value={cellEditRationale} onChange={e => { setCellEditRationale(e.target.value); setCellEditDirty(true); }}
                      style={{ width: "100%", minHeight: 140, border: `1px solid ${T.outlineDefault}`, borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 400, color: T.typeDefault, background: T.surfaceDefault, fontFamily: "inherit", letterSpacing: "0.2px", lineHeight: "22px", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                  ) : (
                    <p style={{ fontSize: 14, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "22px", margin: 0 }}>
                      The company's equity-to-debt ratio remained stable at 0.65 in Q3, indicating a balanced capital structure with moderate leverage. The ratio is unchanged versus prior quarters, suggesting no major equity issuances or debt refinancing activity during the period. The consistent level likely reflects steady operating performance and no material shifts in financing strategy.
                    </p>
                  )}
                </div>

                {/* Source Documents */}
                <div style={{ background: "#F3F3F3", borderRadius: 8, overflow: "hidden" }}>
                  <button onClick={() => setSourceDocsOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.2px", textAlign: "left" }}>
                    <MI name={sourceDocsOpen ? "expand_less" : "expand_more"} size={20} color={T.typeDefault} />
                    Source documents (2)
                  </button>
                  {sourceDocsOpen && (
                    <div style={{ padding: "0 16px 16px" }}>
                      {/* Doc 1 */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <MI name="description" size={20} color={T.typeMuted} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault }}>Strategy_2025.pptx</span>
                        </div>
                        {[{ page: 9, text: `"Q1 2025 actual revenue totaled $2.345M, driven primarily by core enterprise contracts."` },
                          { page: 18, text: `"$2.345M, driven primarily by core enterprise contracts."` }].map((ex, i) => (
                          <div key={i} style={{ marginLeft: 28, marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.3px", marginBottom: 4 }}>(Actuals Q1 2025) [Page {ex.page}]</div>
                            <div style={{ background: "#E8E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, fontWeight: 400, color: T.typeDefault, lineHeight: "18px", letterSpacing: "0.2px" }}>{ex.text}</div>
                          </div>
                        ))}
                      </div>
                      {/* Doc 2 */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <MI name="description" size={20} color={T.typeMuted} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.typeDefault }}>Financial report q1 2025_2025.pptx</span>
                        </div>
                        {[{ page: 9, text: `"Q1 2025 actual revenue totaled $2.345M, driven primarily by core enterprise contracts."` }].map((ex, i) => (
                          <div key={i} style={{ marginLeft: 28, marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.3px", marginBottom: 4 }}>(Actuals Q1 2025) [Page {ex.page}]</div>
                            <div style={{ background: "#E8E8E8", borderRadius: 6, padding: "8px 12px", fontSize: 13, fontWeight: 400, color: T.typeDefault, lineHeight: "18px", letterSpacing: "0.2px" }}>{ex.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* ── History Tab ── */}
              {cellDetailTab === "history" && (() => {
                const history = getMockHistory(cellDetail.metric, cellDetail.periodKey);
                const HistoryEntry = ({ h, isCurrent }) => (
                  <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid ${T.dividerLight}` }}>
                    {isCurrent && <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", marginBottom: 8 }}>Current value</div>}
                    <div style={{ fontSize: 20, fontWeight: 600, color: T.typeDefault, marginBottom: 12 }}>{formatMetricValue(h.value, h.unit)}</div>
                    {[
                      { label: "Added to master table:", val: h.date },
                      { label: "Added by:", val: h.user },
                      { label: "Source:", val: h.source },
                      { label: "Excerpt:", val: h.excerpt },
                      { label: "AI rationale:", val: h.rationale },
                      { label: "Note:", val: h.note },
                    ].map((row, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.typeMuted, letterSpacing: "0.3px", lineHeight: "16px" }}>{row.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 400, color: T.typeDefault, letterSpacing: "0.2px", lineHeight: "20px" }}>{row.val}</div>
                      </div>
                    ))}
                  </div>
                );
                return (
                  <>
                    <HistoryEntry h={history[0]} isCurrent={true} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.3px", marginBottom: 16 }}>Previous value(s)</div>
                    {history.slice(1).map((h, i) => <HistoryEntry key={i} h={h} isCurrent={false} />)}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${T.divider}`, padding: "16px 24px", display: "flex", justifyContent: cellEditing ? "space-between" : "flex-end", alignItems: "center", flexShrink: 0 }}>
              {cellEditing ? (<>
                <button onClick={closeCellDetail} style={{ height: 40, padding: "0 20px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: T.typeDefault, letterSpacing: "1px" }}>Cancel</button>
                <button onClick={() => { setCellDetail(null); setCellEditing(false); }} style={{ height: 40, padding: "0 20px", border: "none", borderRadius: 8, background: cellEditDirty ? T.surfaceInverse : T.divider, cursor: cellEditDirty ? "pointer" : "default", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: cellEditDirty ? T.surfaceDefault : T.typeMuted, letterSpacing: "1px" }}>Save changes</button>
              </>) : (
                <button onClick={() => setCellDetail(null)} style={{ height: 40, padding: "0 20px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: T.typeDefault, letterSpacing: "1px" }}>Close</button>
              )}
            </div>
          </div>

          {/* Discard changes dialog */}
          {showDiscardDialog && (
            <>
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }} />
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 301, background: T.surfaceDefault, borderRadius: 12, padding: "24px", width: 400, boxShadow: "0 0 2px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: T.typeDefault, marginBottom: 8 }}>Discard changes?</div>
                <p style={{ fontSize: 14, fontWeight: 400, color: T.typeMuted, letterSpacing: "0.2px", lineHeight: "20px", margin: "0 0 24px" }}>You have unsaved changes. Are you sure you want to discard them?</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button onClick={() => setShowDiscardDialog(false)} style={{ height: 40, padding: "0 20px", border: `1px solid ${T.outlineDefault}`, borderRadius: 8, background: T.surfaceDefault, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: T.typeDefault, letterSpacing: "0.5px" }}>Keep editing</button>
                  <button onClick={discardAndClose} style={{ height: 40, padding: "0 20px", border: "none", borderRadius: 8, background: "#C8102E", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "0.5px" }}>Discard</button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP — Unified with Tab Switching
   ═══════════════════════════════════════════════════════════════════════════ */
const TABS = ["Pulse", "Group Insights", "Peer Comparison", "Company Teardown"];

export default function App() {
  const [activePage, setActivePage] = useState("portfolio");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [filters, setFilters] = useState({ stage: "All", sector: "All", geo: "All", time: "Q4 2025" });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiNewChat, setAiNewChat] = useState(0);
  const [pendingAsk, setPendingAsk] = useState(null);
  const onAskAI = (context) => { setAiOpen(true); setPendingAsk({ ...context, _ts: Date.now() }); };
  const switchTab = (i) => {
    setActiveTab(i);
  };
  const companies = useMemo(() => ALL_COMPANIES.filter(c =>
    (filters.stage === "All" || c.stage === filters.stage) &&
    (filters.sector === "All" || c.sector === filters.sector) &&
    (filters.geo === "All" || c.geo === filters.geo)
  ), [filters]);

  // Global AI context — reads current tab to provide relevant suggestions on fresh chat
  const selectedCompany = ALL_COMPANIES.find(c => c.id === selectedCompanyId) || null;
  const aiCtx = useMemo(() => {
    if (activeTab === 0) return getPulseContext();
    if (activeTab === 1) return getGIContext(filters, "Sector", companies);
    if (activeTab === 2) return getPeerContext(selectedCompany, companies.slice(0, 5));
    if (activeTab === 3) return getTeardownContext(selectedCompany);
    return getPulseContext();
  }, [activeTab, filters, companies, selectedCompany]);

  const goToTeardown = (companyId) => { setSelectedCompanyId(companyId); setActiveTab(3); setTimeout(() => { const tabBar = document.getElementById("pi-tab-bar"); if (tabBar) tabBar.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50); };
  const goToGIFiltered = (sector) => { setFilters(f => ({ ...f, sector })); setActiveTab(1); setTimeout(() => { const tabBar = document.getElementById("pi-tab-bar"); if (tabBar) tabBar.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50); };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", height: "100vh", overflow: "hidden", background: T.surfaceVariant }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined');
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes aiDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }`}</style>

      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      {activePage === "smartdb" ? (
        <SmartDatabasePage />
      ) : (
      <>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar />
        {/* Below header: content + AI panel side by side */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div data-scroll-root style={{ flex: 1, overflow: "auto", minWidth: 0, transition: "flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>

          <div style={{ background: T.surfaceDefault }}>
            {/* Breadcrumb */}
            <div style={{ padding: `24px ${HP}px 0` }}>
              <div style={{ fontSize: 14, color: T.typeMuted, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ cursor: "pointer" }}>Portfolio Intelligence</span>
                <MI name="chevron_right" size={16} color={T.typeMuted} />
                <span style={{ fontWeight: 600, color: T.typeDefault }}>Insights Dashboard</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0, color: T.typeDefault, lineHeight: "38px" }}>
                    Insights Dashboard
                  </h1>
                  <div style={{ fontSize: 12, color: T.typeMuted, marginTop: 4 }}>Updated: 17-Feb-2026 &middot; {ALL_COMPANIES.length} companies</div>
                </div>
                <AIAnalystTrigger onClick={() => { if (aiOpen) { setAiOpen(false); } else { setAiOpen(true); setAiNewChat(c => c + 1); } }} isOpen={aiOpen} />
              </div>
            </div>

            {/* Tabs */}
            <div id="pi-tab-bar" style={{ padding: `24px ${HP}px 0 ${HP}px` }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.divider}`, background: T.surfaceDefault }}>
                {TABS.map((tab, i) => {
                  const active = i === activeTab;
                  return (
                    <button key={tab} onClick={() => switchTab(i)} style={{
                      position: "relative", height: 44, padding: "0 24px",
                      fontSize: 16, fontWeight: active ? 600 : 400, color: active ? T.typeDefault : T.typeMuted,
                      background: "transparent", border: "none",
                      cursor: active ? "default" : "pointer",
                      letterSpacing: "0.2px", fontFamily: "inherit", lineHeight: "24px",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {tab}
                      {active && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: T.brandRed, borderRadius: "2px 2px 0 0" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ position: "relative", padding: `32px ${HP}px 56px ${HP}px`, background: T.surfaceDefault, minHeight: "calc(100vh - 60px - 44px - 200px)", flex: 1 }}>
              {activeTab === 0 && <PulseContent companies={ALL_COMPANIES} onCompanyClick={goToTeardown} onSectorClick={goToGIFiltered} />}
              {activeTab === 1 && <GroupInsightsContent companies={companies} filters={filters} setFilters={setFilters} />}
              {activeTab === 2 && <PeerComparisonContent companies={ALL_COMPANIES} selectedCompanyId={selectedCompanyId} onSelectCompany={setSelectedCompanyId} />}
              {activeTab === 3 && <TeardownContent companies={ALL_COMPANIES} selectedCompanyId={selectedCompanyId} onSelectCompany={setSelectedCompanyId} />}
          </div>

        </div>

        {/* AI Analyst — pushes content, sits below header */}
        <TabAIPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} ctx={aiCtx} pendingAsk={pendingAsk} onPendingHandled={() => setPendingAsk(null)} newChatSignal={aiNewChat} />
        </div>
      </div>
      </>
      )}

    </div>
  );
}
