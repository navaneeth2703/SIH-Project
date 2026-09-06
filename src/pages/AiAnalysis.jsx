import { PageHeader, Card, CardContent, Badge } from '../components/ui';

export default function AiAnalysis() {
  return (
    <div>
      <PageHeader
        title="AI Analysis"
        description="Explainable natural language understanding, root-cause categorization, and institutional match recommendations."
        badge={<Badge variant="AI">Route: /analysis</Badge>}
      />

      <Card variant="standard">
        <CardContent>
          <p className="text-sm text-slate-500">
            Route active: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/analysis</code>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder view for AI Analysis and partner matching. Reusable design system foundation and application shell are active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
