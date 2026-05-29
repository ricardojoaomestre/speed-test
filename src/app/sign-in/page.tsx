import { auth, signIn } from '@/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl ?? '/dashboard');
  }

  const redirectTo = callbackUrl ?? '/dashboard';

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Continue with your Google account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Sign in failed. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <form
        action={async () => {
          'use server';
          await signIn('google', { redirectTo });
        }}
      >
        <Button type="submit">Sign in with Google</Button>
      </form>
    </div>
  );
}
