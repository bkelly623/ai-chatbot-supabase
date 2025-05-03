import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Project Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
