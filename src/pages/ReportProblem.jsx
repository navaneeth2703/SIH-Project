import { PageHeader, Card, CardContent, Badge } from '../components/ui';

export default function ReportProblem() {
  return (
    <div>
      <PageHeader
        title="Report a Problem"
        description="Submit citizen challenges with structured context for AI-driven categorization and partner matching."
        badge={<Badge variant="neutral">Route: /report</Badge>}
      />

      <Card variant="standard">
        <CardContent>
          <p className="text-sm text-slate-500">
            Route active: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/report</code>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder view for reporting a societal challenge. Reusable design system foundation and application shell are active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
