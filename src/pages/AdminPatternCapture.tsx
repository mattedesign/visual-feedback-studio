import { PatternCapture } from '@/components/admin/PatternCapture';

export default function AdminPatternCapture() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Visual Pattern Library Admin</h1>
        <p className="text-muted-foreground mt-2">
          Capture real UI screenshots from company websites for the Figmant visual mentor system.
        </p>
      </div>
      
      <PatternCapture />
    </div>
  );
}