import { SettingsNav } from '@/app/(protected)/settings/components/settings-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row lg:gap-10">
      <aside className="lg:w-48 lg:shrink-0">
        <div className="mb-3">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Application configuration
          </p>
        </div>
        <SettingsNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
