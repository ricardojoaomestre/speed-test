import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function PlayPage() {
  async function registerUser(formData: FormData) {
    "use server";

    const rawFormData = {
      username: formData.get("name"),
    };

    console.log(rawFormData);
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
