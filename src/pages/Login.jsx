import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { getActiveRole, setActiveRole } from "../services/roleState";

// ─── Preset Demo Roles for Instant Prototype Sign-In ────────────────────────
const DEMO_ROLES = [
  {
    id: "citizen",
    name: "Citizen",
    tagline: "Report & Track",
    email: "citizen.demo@samadhansetu.in",
    redirectTo: "/report",
    description: "Report community problems and follow progress.",
    nodeColor: "indigo",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "university",
    name: "University",
    tagline: "Research & Validate",
    email: "research.demo@samadhansetu.in",
    redirectTo: "/challenges",
    description: "Discover challenges aligned with research and technical capabilities.",
    nodeColor: "violet",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "industry",
    name: "Industry",
    tagline: "Implement & Scale",
    email: "industry.demo@samadhansetu.in",
    redirectTo: "/challenges",
    description: "Find implementation opportunities and deployment capabilities.",
    nodeColor: "teal",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    id: "government",
    name: "Government",
    tagline: "Review & Govern",
    email: "admin.gov@samadhansetu.in",
    redirectTo: "/government",
    description: "Prioritize challenges, review evidence, and guide progression.",
    nodeColor: "purple",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export default function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(() => getActiveRole() || "government");
  const [email, setEmail] = useState(() => {
    const role = DEMO_ROLES.find((r) => r.id === (getActiveRole() || "government"));
    return role ? role.email : DEMO_ROLES[3].email;
  });
  const [password, setPassword] = useState("demo-access-2026");
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  // Quick-fill credentials for demo and store active role in session
  function handleSelectRole(roleId) {
    const role = DEMO_ROLES.find((r) => r.id === roleId);
    if (!role) return;
    setSelectedRole(roleId);
    setEmail(role.email);
    setPassword("demo-access-2026");
    setLoginFeedback(null);
    setActiveRole(roleId);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!email) {
      setLoginFeedback({ type: "error", message: "Please enter an email address." });
      return;
    }

    setIsSubmitting(true);
    setLoginFeedback(null);

    // Simulate instant prototype authentication
    setTimeout(() => {
      setIsSubmitting(false);
      const activeRoleObj = DEMO_ROLES.find((r) => r.id === selectedRole) || DEMO_ROLES[3];
      setActiveRole(activeRoleObj.id);
      setLoginFeedback({
        type: "success",
        message: `Authenticated as ${activeRoleObj.name}. Directing to workspace...`,
      });

      setTimeout(() => {
        navigate(activeRoleObj.redirectTo);
      }, 700);
    }, 450);
  }

  // Subtle interactive parallax for the Setu visual
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 35;
    const y = (e.clientY - rect.top - rect.height / 2) / 35;
    setMousePos({ x, y });
  }

  function handleMouseLeave() {
    setMousePos({ x: 0, y: 0 });
  }

  const activeFocus = hoveredNode || selectedRole;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* ── Top Framing Header ────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          The Civic Innovation Bridge
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Sign In to Samadhan Setu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          A unified portal connecting citizens, universities, industry partners, and government administrators to solve societal challenges.
        </p>
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* ── Left Column: Login Form ─────────────────────────────────────── */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Form Heading */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Platform Access</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a demonstration role or enter prototype credentials.
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19h16" />
                    <path d="M6 19v-4a6 6 0 0 1 12 0v4" />
                    <path d="M12 9V3" />
                    <circle cx="12" cy="3" r="1.5" />
                  </svg>
                </div>
              </div>

              {/* Quick Demo Role Selector */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Fast Demo Role Presets
                  </label>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Click to auto-fill
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {DEMO_ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRole(role.id)}
                        onMouseEnter={() => setHoveredNode(role.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`text-left p-2 rounded-lg border transition-all text-xs cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <span className="font-semibold block leading-tight truncate">
                          {role.name}
                        </span>
                        <span
                          className={`text-[10px] block leading-tight truncate mt-0.5 ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {role.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
                {/* Email input */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Institutional or Civic Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginFeedback(null);
                    }}
                    placeholder="e.g. admin.gov@samadhansetu.in"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition"
                    required
                  />
                </div>

                {/* Password input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Demo key active
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginFeedback(null);
                      }}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Feedback Toast */}
                {loginFeedback && (
                  <div
                    className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 ${
                      loginFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    <span className="font-semibold">{loginFeedback.message}</span>
                  </div>
                )}

                {/* Sign In Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    "Sign In to Platform →"
                  )}
                </Button>
              </form>
            </div>

            {/* Prototype Disclaimer */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
              Smart India Hackathon 2026 demonstration portal. Simulated roles provide pre-configured workspace views without requiring live external auth tokens.
            </div>
          </div>
        </div>

        {/* ── Right Column: Setu Interactive Network Visual ───────────────── */}
        <div className="lg:col-span-6 flex flex-col">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Visual Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 z-10">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase block">
                  The Setu Connection Engine
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Four Platform Roles • One Coordinated Bridge
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium shadow-2xs">
                Interactive Map
              </span>
            </div>

            {/* SVG Network Visual */}
            <div className="relative py-4 my-auto flex items-center justify-center">
              <svg
                viewBox="0 0 460 380"
                className="w-full max-w-[440px] h-auto transition-transform duration-300 ease-out select-none"
                style={{
                  transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
                }}
              >
                <defs>
                  {/* Subtle linear gradients for connection lines */}
                  <linearGradient id="grad-citizen" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="grad-univ" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="grad-industry" x1="100%" y1="50%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="grad-gov" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Connection Lines from Center (230, 190) */}

                {/* 1. Citizen Line: Top (230, 75) -> Center (230, 190) */}
                <line
                  x1="230"
                  y1="75"
                  x2="230"
                  y2="190"
                  stroke={activeFocus === "citizen" ? "url(#grad-citizen)" : "#cbd5e1"}
                  strokeWidth={activeFocus === "citizen" ? "2.5" : "1.5"}
                  strokeDasharray={activeFocus === "citizen" ? "4 3" : "none"}
                  className="transition-all duration-300"
                />

                {/* 2. University Line: Left (85, 190) -> Center (230, 190) */}
                <line
                  x1="85"
                  y1="190"
                  x2="230"
                  y2="190"
                  stroke={activeFocus === "university" ? "url(#grad-univ)" : "#cbd5e1"}
                  strokeWidth={activeFocus === "university" ? "2.5" : "1.5"}
                  strokeDasharray={activeFocus === "university" ? "4 3" : "none"}
                  className="transition-all duration-300"
                />

                {/* 3. Industry Line: Right (375, 190) -> Center (230, 190) */}
                <line
                  x1="375"
                  y1="190"
                  x2="230"
                  y2="190"
                  stroke={activeFocus === "industry" ? "url(#grad-industry)" : "#cbd5e1"}
                  strokeWidth={activeFocus === "industry" ? "2.5" : "1.5"}
                  strokeDasharray={activeFocus === "industry" ? "4 3" : "none"}
                  className="transition-all duration-300"
                />

                {/* 4. Government Line: Bottom (230, 305) -> Center (230, 190) */}
                <line
                  x1="230"
                  y1="305"
                  x2="230"
                  y2="190"
                  stroke={activeFocus === "government" ? "url(#grad-gov)" : "#cbd5e1"}
                  strokeWidth={activeFocus === "government" ? "2.5" : "1.5"}
                  strokeDasharray={activeFocus === "government" ? "4 3" : "none"}
                  className="transition-all duration-300"
                />

                {/* Center Node: Samadhan Setu Hub (230, 190) */}
                <g className="cursor-default">
                  {/* Subtle ambient pulse ring */}
                  <circle
                    cx="230"
                    cy="190"
                    r="44"
                    fill="none"
                    stroke="#4338ca"
                    strokeOpacity="0.12"
                    strokeWidth="4"
                  />
                  <circle
                    cx="230"
                    cy="190"
                    r="36"
                    className="fill-slate-900 stroke-indigo-400"
                    strokeWidth="2"
                  />
                  {/* Setu Bridge Icon in Center */}
                  <path
                    d="M216 195h28 M220 195v-7a10 10 0 0 1 20 0v7 M230 178v-8 M230 168a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                    stroke="#ffffff"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x="230"
                    y="208"
                    textAnchor="middle"
                    className="text-[9px] font-extrabold fill-slate-200 tracking-wide"
                  >
                    SETU
                  </text>
                </g>

                {/* Node 1: Citizen (Top) */}
                <g
                  onMouseEnter={() => setHoveredNode("citizen")}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleSelectRole("citizen")}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <rect
                    x="160"
                    y="25"
                    width="140"
                    height="44"
                    rx="10"
                    className={
                      activeFocus === "citizen"
                        ? "fill-blue-50 stroke-blue-500"
                        : "fill-white stroke-slate-200"
                    }
                    strokeWidth={activeFocus === "citizen" ? "2" : "1"}
                  />
                  <circle cx="180" cy="47" r="8" className="fill-blue-500" />
                  <text x="180" y="50" textAnchor="middle" className="text-[9px] fill-white font-bold">1</text>
                  <text x="196" y="42" className="text-[11px] font-bold fill-slate-900">Citizen</text>
                  <text x="196" y="55" className="text-[9px] font-medium fill-slate-500">Report & Track</text>
                </g>

                {/* Node 2: University / Research (Left) */}
                <g
                  onMouseEnter={() => setHoveredNode("university")}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleSelectRole("university")}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <rect
                    x="15"
                    y="168"
                    width="140"
                    height="44"
                    rx="10"
                    className={
                      activeFocus === "university"
                        ? "fill-violet-50 stroke-violet-500"
                        : "fill-white stroke-slate-200"
                    }
                    strokeWidth={activeFocus === "university" ? "2" : "1"}
                  />
                  <circle cx="35" cy="190" r="8" className="fill-violet-500" />
                  <text x="35" y="193" textAnchor="middle" className="text-[9px] fill-white font-bold">2</text>
                  <text x="51" y="185" className="text-[11px] font-bold fill-slate-900">University</text>
                  <text x="51" y="198" className="text-[9px] font-medium fill-slate-500">Research & Validate</text>
                </g>

                {/* Node 3: Industry (Right) */}
                <g
                  onMouseEnter={() => setHoveredNode("industry")}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleSelectRole("industry")}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <rect
                    x="305"
                    y="168"
                    width="140"
                    height="44"
                    rx="10"
                    className={
                      activeFocus === "industry"
                        ? "fill-teal-50 stroke-teal-500"
                        : "fill-white stroke-slate-200"
                    }
                    strokeWidth={activeFocus === "industry" ? "2" : "1"}
                  />
                  <circle cx="325" cy="190" r="8" className="fill-teal-500" />
                  <text x="325" y="193" textAnchor="middle" className="text-[9px] fill-white font-bold">3</text>
                  <text x="341" y="185" className="text-[11px] font-bold fill-slate-900">Industry</text>
                  <text x="341" y="198" className="text-[9px] font-medium fill-slate-500">Implement & Scale</text>
                </g>

                {/* Node 4: Government (Bottom) */}
                <g
                  onMouseEnter={() => setHoveredNode("government")}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleSelectRole("government")}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <rect
                    x="160"
                    y="310"
                    width="140"
                    height="44"
                    rx="10"
                    className={
                      activeFocus === "government"
                        ? "fill-purple-50 stroke-purple-500"
                        : "fill-white stroke-slate-200"
                    }
                    strokeWidth={activeFocus === "government" ? "2" : "1"}
                  />
                  <circle cx="180" cy="332" r="8" className="fill-purple-500" />
                  <text x="180" y="335" textAnchor="middle" className="text-[9px] fill-white font-bold">4</text>
                  <text x="196" y="327" className="text-[11px] font-bold fill-slate-900">Government</text>
                  <text x="196" y="340" className="text-[9px] font-medium fill-slate-500">Review & Govern</text>
                </g>
              </svg>
            </div>

            {/* Active Node Detail Pill */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Role Perspective:
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    DEMO_ROLES.find((r) => r.id === activeFocus)?.badgeBg || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {DEMO_ROLES.find((r) => r.id === activeFocus)?.name}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {DEMO_ROLES.find((r) => r.id === activeFocus)?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Product Journey Strip ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
              The Mission of Samadhan Setu
            </span>
            <p className="text-xs font-semibold text-slate-800">
              Problem → Match → Collaborate → Solve → Measure Impact
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap justify-center">
            <span>Don&apos;t have an account?</span>
            <Button
              to="/report"
              variant="secondary"
              size="sm"
              className="text-xs py-1 px-2.5"
            >
              Report a Problem Anonymously →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
