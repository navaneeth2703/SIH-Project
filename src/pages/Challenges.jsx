import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../components/ui";
import {
  getActiveRole,
  PLATFORM_ROLES,
} from "../services/roleState";

const CHALLENGES = [
  {
    id: "bistupur-traffic",
    title: "Severe Traffic Congestion and Lack of Public Bus Connectivity",
    location: "Bistupur, Jamshedpur, Jharkhand",
    category: "Traffic & Transport",
    domain: "traffic",
    severity: "MEDIUM",
    stage: "Field Testing",
    submittedBy: "Citizen Collective, Bistupur Ward",
    description:
      "Illustrative prototype scenario showing how recurring peak-hour congestion could affect commuters across key transit corridors in Bistupur, where limited public bus connectivity increases private vehicular load.",
    collaborators: [
      { name: "NIT Jamshedpur", type: "Research" },
      { name: "Tata Motors", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Urban Mobility", "Public Transit", "Emissions"],
  },
  {
    id: "baghmara-groundwater",
    title: "Severe Groundwater Discoloration & Odor near Baghmara Tube-wells",
    location: "Baghmara, Dhanbad, Jharkhand",
    category: "Water & Environment",
    domain: "water",
    severity: "HIGH",
    stage: "Pilot",
    submittedBy: "Gram Sabha, Baghmara Block",
    description:
      "Illustrative prototype scenario showing groundwater quality concerns near mining-affected areas in Baghmara, where community tube-wells require testing and accessible safe drinking water alternatives.",
    collaborators: [
      { name: "IIT (ISM) Dhanbad", type: "Research" },
      { name: "MECON Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Drinking Water", "Environmental Health", "Rural Infrastructure"],
  },
  {
    id: "hazaribagh-diagnostic",
    title: "Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters",
    location: "Sadar Block, Hazaribagh, Jharkhand",
    category: "Public Health & Sanitation",
    domain: "health",
    severity: "HIGH",
    stage: "Proposal",
    submittedBy: "ASHA Worker Network, Hazaribagh",
    description:
      "Illustrative prototype scenario showing diagnostic access and cold-chain challenges in remote clusters of Sadar Block, where travel distance and power continuity affect primary healthcare delivery.",
    collaborators: [
      { name: "RIMS Ranchi", type: "Research" },
      { name: "Apollo Hospitals Enterprise Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Healthcare Access", "Cold Chain", "Rural Health"],
  },
  {
    id: "bokaro-irrigation",
    title: "Crop Irrigation Water Scarcity during Non-Monsoon Cycles",
    location: "Petarwar Cluster, Bokaro, Jharkhand",
    category: "Agriculture & Irrigation",
    domain: "agriculture",
    severity: "MEDIUM",
    stage: "Adopted",
    submittedBy: "Farmer Cooperative Society, Petarwar",
    description:
      "Illustrative prototype scenario showing irrigation constraints affecting smallholder farming in Petarwar cluster during non-monsoon cycles, highlighting the need for dependable micro-irrigation.",
    collaborators: [
      { name: "Birsa Agricultural University", type: "Research" },
      { name: "National Seeds Corporation Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Smallholder Farming", "Irrigation", "Food Security"],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Challenges" },
  { key: "traffic", label: "Traffic & Transport" },
  { key: "water", label: "Water & Environment" },
  { key: "health", label: "Public Health" },
  { key: "agriculture", label: "Agriculture" },
];

const SEVERITIES = [
  { key: "all", label: "All Severities" },
  { key: "HIGH", label: "High Priority" },
  { key: "MEDIUM", label: "Medium Priority" },
];

const SEVERITY_META = {
  HIGH: {
    label: "High Priority",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
    accentText: "text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  MEDIUM: {
    label: "Medium Priority",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
};

const STAGE_META = {
  Proposal: "bg-slate-100 text-slate-600 border-slate-200",
  Pilot: "bg-blue-50 text-blue-700 border-blue-200",
  "Field Testing": "bg-violet-50 text-violet-700 border-violet-200",
  Scale: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Adopted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const COLLAB_TYPE_STYLE = {
  Research: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Industry: "bg-teal-50 text-teal-700 border-teal-200",
};

function ChallengeCard({ challenge, onViewLifecycle, activeRole }) {
  const sev = SEVERITY_META[challenge.severity] || SEVERITY_META.MEDIUM;
  const stageClass = STAGE_META[challenge.stage] || STAGE_META.Proposal;

  const roleMeta = activeRole ? PLATFORM_ROLES[activeRole] : null;
  const perspectiveQuestion = roleMeta?.perspectiveQuestion
    ? roleMeta.perspectiveQuestion(challenge.domain)
    : null;

  return (
    <Card
      variant="elevated"
      className="flex flex-col group transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className={`h-1 w-full rounded-t-xl ${sev.bar}`} />

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            {challenge.category}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${sev.accentBg} ${sev.accentBorder} ${sev.accentText}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
            {sev.label}
          </span>
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${stageClass}`}
          >
            {challenge.stage}
          </span>
        </div>

        <CardTitle as="h2" className="text-base leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
          {challenge.title}
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{challenge.location}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {challenge.description}
        </p>

        {/* Quiet role-aware perspective note */}
        {roleMeta && perspectiveQuestion && (
          <div
            className={`px-3 py-2 rounded-lg text-xs border font-medium ${
              activeRole === "university"
                ? "bg-violet-50/70 border-violet-200/80 text-violet-950"
                : activeRole === "industry"
                ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
                : activeRole === "government"
                ? "bg-purple-50/70 border-purple-200/80 text-purple-950"
                : "bg-blue-50/70 border-blue-200/80 text-blue-950"
            }`}
          >
            <span className="font-bold">
              {activeRole === "university"
                ? "Research Focus"
                : activeRole === "industry"
                ? "Implementation Focus"
                : activeRole === "government"
                ? "Review Focus"
                : "Citizen Tracking"}
              :
            </span>{" "}
            <span className="italic">&ldquo;{perspectiveQuestion}&rdquo;</span>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Potential Collaborators <span className="ml-1 font-normal normal-case text-slate-400">(illustrative match)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {challenge.collaborators.map((c) => (
              <span
                key={c.name}
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${COLLAB_TYPE_STYLE[c.type] || COLLAB_TYPE_STYLE.Research}`}
              >
                {c.name}
                <span className="ml-1 opacity-60">· {c.type}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {challenge.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 leading-tight">
            <span className="block font-medium text-slate-500">{challenge.submittedBy}</span>
            <span>Demo challenge • Illustrative record</span>
          </div>
          <button
            onClick={() => onViewLifecycle(challenge.id)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white border border-transparent hover:bg-slate-800 active:bg-slate-950 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer shrink-0"
          >
            View Challenge →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Challenges() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSeverity, setActiveSeverity] = useState("all");
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());

  useEffect(() => {
    const handleRoleChange = () => {
      setActiveRoleState(getActiveRole());
    };
    window.addEventListener("samadhan_active_role_change", handleRoleChange);
    window.addEventListener("storage", handleRoleChange);
    return () => {
      window.removeEventListener("samadhan_active_role_change", handleRoleChange);
      window.removeEventListener("storage", handleRoleChange);
    };
  }, []);

  const filtered = useMemo(() => {
    return CHALLENGES.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "all" || c.domain === activeCategory;
      const matchesSeverity = activeSeverity === "all" || c.severity === activeSeverity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [search, activeCategory, activeSeverity]);

  function handleViewLifecycle(challengeId) {
    navigate("/project-lifecycle", { state: { challengeId } });
  }

  const highCount = CHALLENGES.filter((c) => c.severity === "HIGH").length;

  function clearFilters() {
    setSearch("");
    setActiveCategory("all");
    setActiveSeverity("all");
  }

  const isFiltered = activeCategory !== "all" || activeSeverity !== "all" || search;
  const currentRoleMeta = activeRole ? PLATFORM_ROLES[activeRole] : null;

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Short Explanation */}
      <PageHeader
        title="Explore Societal Challenges"
        description="Citizen and community submissions aggregated by Samadhan Setu. Each challenge has been categorised, severity-rated, and matched to potential institutional collaborators."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Demo Dataset
          </span>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Challenges" },
        ]}
      />

      {/* 2. Role Context (Compact & Quiet) */}
      {currentRoleMeta && (
        <div
          className={`rounded-xl border px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs ${
            activeRole === "university"
              ? "bg-violet-50/70 border-violet-200/80 text-violet-950"
              : activeRole === "industry"
              ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
              : activeRole === "government"
              ? "bg-purple-50/70 border-purple-200/80 text-purple-950"
              : "bg-blue-50/70 border-blue-200/80 text-blue-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 px-1.5 items-center justify-center rounded text-[10px] font-bold tracking-wide uppercase ${
                activeRole === "university"
                  ? "bg-violet-900 text-white"
                  : activeRole === "industry"
                  ? "bg-teal-900 text-white"
                  : activeRole === "government"
                  ? "bg-purple-900 text-white"
                  : "bg-blue-900 text-white"
              }`}
            >
              {currentRoleMeta.name}
            </span>
            <span className="font-bold">{currentRoleMeta.shortPerspective}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline">{currentRoleMeta.bannerDesc}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            {currentRoleMeta.actionTag}
          </span>
        </div>
      )}

      {/* 3. Search / Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              type="search"
              id="challenge-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or tag..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center mr-1">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeCategory === cat.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-slate-300 self-center mx-1">|</span>
          <span className="text-xs text-slate-400 self-center mr-1">Severity:</span>
          {SEVERITIES.map((sev) => (
            <button
              key={sev.key}
              onClick={() => setActiveSeverity(sev.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeSeverity === sev.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
        <p>
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{CHALLENGES.length}</span> challenges
          <span className="text-slate-400 mx-1.5">•</span>
          <span>{highCount} High Priority</span>
          <span className="text-slate-400 mx-1.5">•</span>
          <span>10 Matched Institutions</span>
          {isFiltered && (
            <button onClick={clearFilters} className="ml-3 text-indigo-600 hover:underline cursor-pointer">
              Clear filters
            </button>
          )}
        </p>
        <p className="text-slate-400 italic">
          Illustrative demo records · Samadhan Setu SIH Prototype
        </p>
      </div>

      {/* 4. Challenge Cards (One Clear Action: "View Challenge →") */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onViewLifecycle={handleViewLifecycle}
              activeRole={activeRole}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="h-10 w-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <p className="text-base font-semibold text-slate-700 mb-1">No challenges match your filters</p>
          <p className="text-xs text-slate-400 mb-4">Try adjusting your search or clearing the active filters.</p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* 5. Prototype Disclaimer */}
      <div className="border-t border-slate-200 pt-5 pb-2">
        <p className="text-xs text-slate-400 text-center leading-relaxed max-w-2xl mx-auto">
          All challenge records and institutional capability matches shown here are{" "}
          <strong className="font-medium text-slate-500">illustrative demonstration data</strong>{" "}
          created for the Smart India Hackathon 2026 prototype. Collaborator associations are
          potential matches based on publicly documented institutional capabilities &mdash; not confirmed
          partnerships or official endorsements.
        </p>
      </div>
    </div>
  );
}
