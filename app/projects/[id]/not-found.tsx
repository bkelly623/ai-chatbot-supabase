import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Image
        src="/images/not-found.svg"
        alt="Project not found"
        width={300}
        height={300}
        className="mb-8"
      />
      <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t find the project you&apos;re looking for. It may have been deleted or you don&apos;t have permission to view it.
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
