import { PageHeader, Card, CardContent, Badge } from '../components/ui';

export default function Project() {
  return (
    <div>
      <PageHeader
        title="Project"
        description="Collaborative problem-solving lifecycle tracking across universities, industry partners, and civic stakeholders."
        badge={<Badge variant="neutral">Route: /project</Badge>}
      />

      <Card variant="standard">
        <CardContent>
          <p className="text-sm text-slate-500">
            Route active: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/project</code>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder view for project lifecycle monitoring. Reusable design system foundation and application shell are active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
