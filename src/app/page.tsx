import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-4">
        {session?.user ? (
          <>
            <p className="text-center text-muted-foreground">
              Signed in as {session.user.name ?? session.user.email}
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
