"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, ArrowRight, Check } from "lucide-react";
import { api } from "./ui";
export function AuthForm({
  signup = false,
  token,
}: {
  signup?: boolean;
  token?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand" href="/">
          <UtensilsCrossed size={25} />
          gather.
        </Link>
        <div>
          <span className="auth-small">A place for your menu.</span>
          <h1>
            Good food deserves
            <br />a beautiful introduction.
          </h1>
          <p>
            From your kitchen to their screen. A menu that’s always fresh,
            always yours.
          </p>
          <ul>
            <li>
              <Check size={18} />
              Update dishes and prices in moments
            </li>
            <li>
              <Check size={18} />
              Share one simple link with every guest
            </li>
            <li>
              <Check size={18} />
              Keep your whole team at the same table
            </li>
          </ul>
        </div>
        <span className="auth-bottom">
          Made for the people who bring people together.
        </span>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="restaurant-mark">
            <UtensilsCrossed size={23} />
          </div>
          <h2>{signup ? "Your next chapter starts here." : "Welcome back."}</h2>
          <p>
            {token
              ? "Sign in or create an account with your invited email."
              : signup
                ? "Set up your restaurant’s menu in a few simple steps."
                : "Let’s see what’s on the menu today."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(e.currentTarget);
              try {
                await api(`/api/auth/${signup ? "signup" : "login"}`, {
                  email: form.get("email"),
                  password: form.get("password"),
                  ...(signup
                    ? {
                        name: form.get("name"),
                        ...(token
                          ? { inviteToken: token }
                          : { restaurant: form.get("restaurant") }),
                      }
                    : {}),
                });
                router.push(
                  token && !signup ? `/invite/${token}` : "/dashboard",
                );
                router.refresh();
              } catch (error) {
                setError((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {signup && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  required
                  maxLength={100}
                />
              </label>
            )}
            {signup && !token && (
              <label>
                Restaurant name
                <input
                  name="restaurant"
                  autoComplete="organization"
                  placeholder="The Olive Table"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@restaurant.com"
                required
                maxLength={254}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                minLength={signup ? 12 : 1}
                maxLength={72}
                placeholder={
                  signup ? "At least 12 characters" : "Your password"
                }
                required
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              {busy
                ? "One moment…"
                : signup
                  ? "Create your account"
                  : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New to Gather?"}{" "}
            <Link
              href={`${signup ? "/login" : "/signup"}${token ? `?invite=${token}` : ""}`}
            >
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
