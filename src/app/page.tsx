import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-4">
        <h1>Hello world</h1>
        <Button asChild>
          <Link href="/play">Start</Link>
        </Button>
      </div>
    </div>
  );
}
