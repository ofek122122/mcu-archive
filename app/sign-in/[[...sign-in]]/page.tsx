import { SignIn } from "@clerk/nextjs";

/**
 * Standalone sign-in route.
 *
 * The header and prompts open Clerk in a modal, so most people never land here
 * — but Clerk redirects to this path from email links (verification, password
 * reset), so it has to exist.
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <SignIn />
    </main>
  );
}
