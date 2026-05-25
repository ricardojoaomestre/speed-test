import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { users } from '@/db/schema';

export default function PlayPage() {
  async function registerUser(formData: FormData) {
    'use server';

    const name = formData.get('name');
    if (typeof name !== 'string' || !name.trim()) {
      return;
    }

    await db.insert(users).values({ name: name.trim() });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form action={registerUser}>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="name">Tell me your name</FieldLabel>
            <Input name="name" type="text" placeholder="Enter your name" />
          </Field>
          <Button type="submit">Start</Button>
        </div>
      </form>
    </div>
  );
}
