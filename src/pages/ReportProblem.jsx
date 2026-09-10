import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '../components/ui';
import { persistProblemReport } from '../services/supabase';

const CATEGORIES = [
  'Water & Environment',
  'Public Health & Sanitation',
  'Rural Infrastructure & Roads',
  'Agriculture & Irrigation',
  'Education & Skill Development',
  'Renewable Energy & Power',
  'Waste Management & Recycling',
  'Civic Governance & Safety',
  'Other Societal Challenge',
];

const DEMO_SAMPLE = {
  title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
  category: 'Water & Environment',
  description:
    'Residents in several villages near the Baghmara mining belt report discolored groundwater and unusual odor from local tube-wells. The issue may be affecting drinking water and agriculture.',
  location: 'Baghmara, Dhanbad, Jharkhand',
};

const NEXT_STEPS = [
  {
    num: '01',
    title: 'UNDERSTAND',
    desc: 'AI analyzes the problem, classifies it, estimates severity and identifies required expertise.',
    color: 'text-violet-700 bg-violet-50 border-violet-200',
  },
  {
    num: '02',
    title: 'MATCH',
    desc: 'The platform identifies suitable university and industry partners.',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  {
    num: '03',
    title: 'COLLABORATE',
    desc: 'Selected partners can turn the challenge into a structured project.',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
  {
    num: '04',
    title: 'IMPACT',
    desc: 'Progress and measurable outcomes are tracked.',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
];

const EXAMPLES = [
  {
    label: 'Groundwater contamination',
    category: 'Water & Environment',
    title: 'Contaminated borehole drinking water with metallic odor',
    desc: 'Local community water supply shows high turbidity and sulfur smell after monsoon runoff.',
  },
  {
    label: 'Rural healthcare access',
    category: 'Public Health & Sanitation',
    title: 'Absence of cold-chain vaccine storage at rural primary health sub-center',
    desc: 'Frequent grid power outages compromise essential medicine and neonatal vaccine potency.',
  },
  {
    label: 'Irrigation problems',
    category: 'Agriculture & Irrigation',
    title: 'Canal siltation preventing tail-end crop irrigation for smallholders',
    desc: 'Unlined feeder canal has silted up, depriving 140 downstream farm holdings of scheduled water.',
  },
];

export default function ReportProblem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: DEMO_SAMPLE.title,
    category: DEMO_SAMPLE.category,
    description: DEMO_SAMPLE.description,
    location: DEMO_SAMPLE.location,
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [draftMessage, setDraftMessage] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
  };

  const handleUseLocation = () => {
    setLocationMessage(null);
    if (!navigator.geolocation) {
      setLocationMessage({
        type: 'warning',
        text: 'Geolocation is not supported by your browser. Please enter your location manually.',
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        const locationStr = `Lat: ${lat}, Long: ${lng} (Detected Location)`;
        handleInputChange('location', locationStr);
        setLocationMessage({
          type: 'success',
          text: `Coordinates captured: ${lat}, ${lng}`,
        });
      },
      () => {
        setLocating(false);
        setLocationMessage({
          type: 'warning',
          text: 'Location access was unavailable or denied. Please enter your location manually.',
        });
      },
      { timeout: 7000 }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Problem title is required.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Problem description is required.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyzeProblem = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Save submitted problem data so next view (/ai-analysis) can display it
    try {
      const submission = {
        ...formData,
        fileName: evidenceFile ? evidenceFile.name : null,
        submittedAt: new Date().toISOString(),
      };

      // Persist to Supabase if configured
      try {
        const { data } = await persistProblemReport(submission);
        if (data && data.id) {
          submission.id = data.id;
        }
      } catch {
        // Non-blocking
      }

      sessionStorage.setItem('samadhan_current_problem', JSON.stringify(submission));
      sessionStorage.removeItem('samadhan_current_analysis');
      sessionStorage.removeItem('samadhan_selected_partner');
      sessionStorage.removeItem('samadhan_project_stage');
      sessionStorage.removeItem('samadhan_project_stage_idx');
    } catch {
      // ignore storage errors
    }

    // Navigate to /ai-analysis as required
    navigate('/ai-analysis');
  };

  const handleSaveDraft = () => {
    try {
      const payload = {
        ...formData,
        fileName: evidenceFile ? evidenceFile.name : null,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('samadhan_setu_draft_problem', JSON.stringify(payload));
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDraftMessage(`✓ Draft saved locally at ${timeString}`);
    } catch {
      setDraftMessage('✓ Draft saved in browser memory.');
    }

    // Auto-dismiss draft message after 5 seconds
    setTimeout(() => {
      setDraftMessage(null);
    }, 5000);
  };

  const handleResetDemoSample = () => {
    setFormData({ ...DEMO_SAMPLE });
    setEvidenceFile(null);
    setErrors({});
    setDraftMessage(null);
    setLocationMessage(null);
  };

  const handleApplyExample = (example) => {
    setFormData({
      title: example.title,
      category: example.category,
      description: example.desc,
      location: 'Local District / Community Area',
    });
    setErrors({});
  };

  return (
    <div className="space-y-8">
      {/* 1. Breadcrumb & 2. Page Heading */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Report a Problem' },
        ]}
        badge={<Badge variant="neutral">Citizen Problem Intake</Badge>}
        title="Report a Problem"
        description="Citizens can submit societal challenges which will be analyzed by explainable AI and connected to capable university researchers and industry partners."
      />

      {/* Role Context Indicator: Citizen Workspace */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-xs shadow-2xs">
            CTZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                Citizen Workspace
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                CITIZEN — REPORT &amp; TRACK
              </span>
            </div>
            <p className="text-xs text-blue-800 mt-0.5">
              Report a community problem and follow its progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-blue-200/80 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Role</span>
            <span className="font-bold text-slate-900">Citizen</span>
          </div>
          <div className="h-6 w-px bg-blue-200/70" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Contribution</span>
            <span className="text-slate-700 font-medium">Report and track societal challenges.</span>
          </div>
        </div>
      </div>

      {/* 3. Submission & Resolution Lifecycle Card */}
      <Card variant="standard" className="p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Submission &amp; Resolution Lifecycle
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 01 Describe - Visually Active */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/80 border border-indigo-200/80 ring-2 ring-indigo-500/20">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-900 text-white text-xs font-bold shadow-xs">
              01
            </span>
            <div>
              <p className="text-xs font-bold text-indigo-950">Describe</p>
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Active Step</p>
            </div>
          </div>

          {/* 02 AI Analysis */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-300 text-slate-400 text-xs font-bold">
              02
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-700">AI Analysis</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Upcoming</p>
            </div>
          </div>

          {/* 03 Find Partners */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-300 text-slate-400 text-xs font-bold">
              03
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Find Partners</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Upcoming</p>
            </div>
          </div>

          {/* 04 Track Impact */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-300 text-slate-400 text-xs font-bold">
              04
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Track Impact</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Upcoming</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Problem Description Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card variant="standard">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle as="h2">Problem Description Form</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Fields marked with an asterisk (<span className="text-rose-500 font-bold">*</span>) are required.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDemoSample}
                className="text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-md border border-indigo-200 transition-colors"
              >
                Reset Demo Sample
              </button>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleAnalyzeProblem} noValidate className="space-y-6">
                {/* Problem Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="problem-title" className="block text-sm font-medium text-slate-900">
                      Problem Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">Concise summary</span>
                  </div>
                  <input
                    id="problem-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Severe groundwater discoloration & odor near Baghmara tube-wells"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.title
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <span>⚠</span> {errors.title}
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="problem-category" className="block text-sm font-medium text-slate-900 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="problem-category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Select the domain closest to the challenge. AI will refine domain tags upon submission.
                  </p>
                </div>

                {/* Problem Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="problem-description" className="block text-sm font-medium text-slate-900">
                      Problem Description <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">Context, evidence &amp; impact</span>
                  </div>
                  <textarea
                    id="problem-description"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what is happening, who is affected, how long it has been occurring, and any past efforts to resolve it..."
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors leading-relaxed ${
                      errors.description
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <span>⚠</span> {errors.description}
                    </p>
                  )}
                </div>

                {/* Location with "Use my location" button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="problem-location" className="block text-sm font-medium text-slate-900">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 disabled:opacity-50 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {locating ? 'Locating...' : 'Use my location'}
                    </button>
                  </div>
                  <input
                    id="problem-location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Baghmara, Dhanbad, Jharkhand"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.location
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                    }`}
                  />
                  {locationMessage && (
                    <p
                      className={`mt-1.5 text-xs flex items-center gap-1 ${
                        locationMessage.type === 'success' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <span>{locationMessage.type === 'success' ? '✓' : 'ℹ'}</span> {locationMessage.text}
                    </p>
                  )}
                  {errors.location && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <span>⚠</span> {errors.location}
                    </p>
                  )}
                </div>

                {/* Evidence Upload Dropzone */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Evidence Upload (Optional)
                  </label>
                  <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 p-5 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="evidence-file-input"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />

                    {evidenceFile ? (
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 max-w-md mx-auto">
                        <div className="flex items-center gap-2.5 truncate">
                          <svg className="h-5 w-5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <div className="text-left truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {evidenceFile.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {(evidenceFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-slate-400 hover:text-rose-600 text-xs font-semibold px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="evidence-file-input" className="cursor-pointer block">
                        <svg
                          className="mx-auto h-8 w-8 text-slate-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                          />
                        </svg>
                        <p className="text-xs font-medium text-slate-700">
                          <span className="text-indigo-600 font-semibold hover:underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Photos, site records, test reports, or documents (PNG, JPG, PDF up to 15MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-2.5">
                  <svg className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">Privacy Notice:</span> Submissions are reviewed to protect personal identity. Only problem context and community-level location are shared with verified academic and industry partners.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-indigo-900 hover:bg-indigo-800"
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Analyze My Problem
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto"
                  >
                    Save as Draft
                  </Button>

                  {draftMessage && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fade-in">
                      {draftMessage}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Information Panels */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Card 1: What happens next? */}
          <Card variant="standard">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1">
                Resolution Roadmap
              </div>
              <CardTitle as="h3">What happens next?</CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {NEXT_STEPS.map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${step.color}`}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                      {step.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 2: Not sure what to report? */}
          <Card variant="standard" className="border-indigo-100 bg-indigo-50/30">
            <CardHeader className="pb-2">
              <CardTitle as="h3" className="text-base flex items-center gap-2">
                <span className="text-indigo-600">💡</span> Not sure what to report?
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Any recurring community challenge that requires specialized expertise or multi-stakeholder collaboration:
              </p>
            </CardHeader>

            <CardContent className="pt-1 pb-4">
              <ul className="space-y-2.5">
                {EXAMPLES.map((ex) => (
                  <li key={ex.label} className="text-xs">
                    <button
                      type="button"
                      onClick={() => handleApplyExample(ex)}
                      className="text-left w-full p-2.5 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-900">
                          • {ex.label}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Use Example →
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {ex.title}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: Dark Card: "Your problem can become a project." */}
          <div className="rounded-xl bg-slate-900 text-white p-6 shadow-sm border border-slate-800">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] font-semibold text-indigo-300 uppercase tracking-wide mb-3">
              Action-Oriented Platform
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Your problem can become a project.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Samadhan Setu doesn&apos;t stop at collecting complaints. We help route challenges toward people capable of solving them.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Open to Universities &amp; Industry</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                SIH 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
