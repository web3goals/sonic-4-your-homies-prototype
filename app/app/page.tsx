import { Button } from "@/components/ui/button";
import { BotIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="container py-16 lg:px-80">
      <div className="flex flex-col items-center">
        <Image
          src="/images/cover.png"
          alt="Cover"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tighter max-w-[680px] mt-4">
        Help your homies join the Sonic ecosystem with personalized AI agents
      </h1>
      <p className="font-medium tracking-tight text-muted-foreground max-w-[680px] mt-2">
        A platform for creating personalized AI agents integrated with the Sonic
        ecosystem for your homies and other not-techie users
      </p>
      <Link href="/agents/new">
        <Button className="mt-4">
          <BotIcon /> Create agent
        </Button>
      </Link>
    </main>
  );
}
