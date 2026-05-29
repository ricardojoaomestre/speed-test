import { auth, signOut } from '@/auth';
import { ProtectedNav } from '@/app/(protected)/components/protected-nav';
import { Button } from '@/components/ui/button';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    const headersList = await headers();
    const pathname =
      headersList.get('x-pathname') ??
      headersList.get('next-url')?.split('?')[0] ??
      '/dashboard';
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-6">
          <ProtectedNav />
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
