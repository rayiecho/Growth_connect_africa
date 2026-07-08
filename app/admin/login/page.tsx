"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl border border-brand-line p-8 shadow-sm"
      >
        <span className="brand-eyebrow-line" />
        <h1 className="text-xl font-bold text-brand-charcoal mb-6">
          LaunchPadX Admin
        </h1>

        <Field label="Email">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="flex items-center justify-between mt-6 text-sm">
          <a href="https://growthconnect.africa/" className="text-brand-slate hover:text-brand-green transition-colors">Back to Home</a>
          <a href="https://lpx.growthconnect.africa/apply" className="text-brand-slate hover:text-brand-green transition-colors">Application Form</a>
        </div>
      </form>
    </main>
  );
}
