import { Card, CardContent, Button } from '../components/ui';

export default function NotFound() {
  return (
    <Card variant="standard" className="text-center py-12">
      <CardContent>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-4">
          Error 404
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          The requested page does not exist or has been moved to another route.
        </p>
        <div className="mt-6">
          <Button to="/" variant="primary">
            Return to Landing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
