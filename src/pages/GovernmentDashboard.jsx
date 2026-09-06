import { PageHeader, Card, CardContent, Badge } from '../components/ui';

export default function GovernmentDashboard() {
  return (
    <div>
      <PageHeader
        title="Government Dashboard"
        description="Administrative portal for civic authorities to monitor challenges, pilot approvals, and city-wide impact metrics."
        badge={<Badge variant="success">Route: /government</Badge>}
      />

      <Card variant="standard">
        <CardContent>
          <p className="text-sm text-slate-500">
            Route active: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/government</code>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder view for government authority oversight. Reusable design system foundation and application shell are active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
