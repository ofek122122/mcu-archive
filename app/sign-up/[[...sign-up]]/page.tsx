import { SignUp } from "@clerk/nextjs";

/** Standalone sign-up route — see the note in the sign-in page. */
export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <SignUp />
    </main>
  );
}
