export default function GovernmentDashboard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-4 border border-emerald-100">
        <span>Route: /government</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Government Dashboard
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Placeholder view for government authority overview and challenge oversight.
      </p>
    </div>
  );
}
