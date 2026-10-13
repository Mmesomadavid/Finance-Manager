import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Wallet,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

/* ---------------------------------- helpers --------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "icloud.co": "icloud.com",
};

const getDomainSuggestion = (email: string) => {
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!local || !domain) return null;
  const fix = DOMAIN_FIXES[domain];
  return fix ? `${local}@${fix}` : null;
};

const safeStorage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable (private mode, etc.) */
    }
  },
};

type Step = "email" | "password";

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------- component -------------------------------- */

const Login = () => {
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(
    () => safeStorage.get("expenseflow:last-email") ?? "",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [lastMethod] = useState(() => safeStorage.get("expenseflow:last-method"));

  const isLoading = status === "loading";
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const suggestion = useMemo(() => getDomainSuggestion(email), [email]);
  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;

  /* Cursor spotlight on the card */
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mouseX}px ${mouseY}px, hsl(var(--foreground) / 0.055), transparent 70%)`;

  const handleCardMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const fail = (message: string) => {
    setError(message);
    setShakeKey((key) => key + 1);
  };

  /* Step 1: email */
  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    if (!isEmailValid) return;
    setError(null);
    setStep("password");
  };

  /* Step 2: password */
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || isLoading) return;

    setError(null);
    setStatus("loading");

    try {
      // TODO: Connect to your backend authentication API.
      // await api.auth.login({ email, password, staySignedIn });
      console.log({ email, password, staySignedIn });

      safeStorage.set("expenseflow:last-email", email.trim());
      safeStorage.set("expenseflow:last-method", "email");
      setStatus("success");
      // TODO: navigate("/dashboard");
    } catch {
      setStatus("idle");
      fail("That email and password don't match. Check them and try again.");
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Integrate Google OAuth with your authentication backend.
    safeStorage.set("expenseflow:last-method", "google");
    console.log("Google authentication requested");
  };

  const goBack = () => {
    setStep("email");
    setPassword("");
    setError(null);
    setShowPassword(false);
    setCapsLock(false);
    setStatus("idle");
  };

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  const slide = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -16 },
    transition: { duration: 0.22, ease },
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground antialiased">
      {/* Grid backdrop, fades out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,hsl(var(--border)/0.6)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,black,transparent)]"
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Brand + heading */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <Link
            to="/"
            aria-label="ExpenseFlow home"
            className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Wallet size={22} strokeWidth={2} />
          </Link>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...slide}>
              <h1 className="text-2xl font-semibold tracking-tight">
                {step === "email" ? "Log in to ExpenseFlow" : "Enter your password"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === "email"
                  ? "See where your money went and where it's going."
                  : "Signing in as"}{" "}
                {step === "password" && (
                  <span className="font-medium text-foreground">{email}</span>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
          onMouseMove={handleCardMove}
          className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        >
          {/* Cursor spotlight */}
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              style={{ background: spotlight }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}

          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {step === "email" ? (
                <motion.div key="email-step" {...slide}>
                  <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[13px] font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoFocus
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="you@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          aria-invalid={showEmailError}
                          aria-describedby="email-hint"
                          className={`h-10 pr-9 transition-colors ${
                            showEmailError
                              ? "border-destructive focus-visible:ring-destructive/30"
                              : "focus-visible:ring-foreground/15"
                          }`}
                        />
                        <AnimatePresence>
                          {isEmailValid && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.6 }}
                              transition={{ duration: 0.18 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                            >
                              <Check size={16} strokeWidth={2.5} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <div id="email-hint" aria-live="polite" className="min-h-[18px]">
                        {suggestion ? (
                          <button
                            type="button"
                            onClick={() => setEmail(suggestion)}
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Did you mean{" "}
                            <span className="font-medium text-foreground underline underline-offset-2">
                              {suggestion}
                            </span>
                            ?
                          </button>
                        ) : showEmailError ? (
                          <p className="text-xs text-destructive">
                            Enter a valid email address, like name@company.com.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-10 w-full font-medium"
                      disabled={email.length > 0 && !isEmailValid && emailTouched}
                    >
                      Continue with email
                    </Button>
                  </form>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="relative h-10 w-full gap-2.5 font-medium"
                  >
                    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.72 5.99c4.51-4.16 7.06-10.29 7.06-17.64Z" />
                      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.94 23.94 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.72-5.99c-2.14 1.44-4.89 2.3-8.19 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
                    </svg>
                    Continue with Google
                    {lastMethod === "google" && (
                      <span className="absolute right-3 rounded-full bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                        Last used
                      </span>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="password-step" {...slide}>
                  <motion.form
                    key={shakeKey}
                    onSubmit={handlePasswordSubmit}
                    animate={
                      shakeKey > 0 && !reduceMotion
                        ? { x: [0, -8, 8, -5, 5, 0] }
                        : undefined
                    }
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-[13px] font-medium">
                          Password
                        </Label>
                        <Link
                          to="/auth/forgot-password"
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoFocus
                          autoComplete="current-password"
                          placeholder="Your password"
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            if (error) setError(null);
                          }}
                          onKeyDown={trackCapsLock}
                          onKeyUp={trackCapsLock}
                          onBlur={() => setCapsLock(false)}
                          aria-invalid={!!error}
                          aria-describedby="password-hint"
                          className={`h-10 pr-10 transition-colors ${
                            error
                              ? "border-destructive focus-visible:ring-destructive/30"
                              : "focus-visible:ring-foreground/15"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((previous) => !previous)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <div id="password-hint" aria-live="polite" className="min-h-[18px]">
                        <AnimatePresence mode="wait" initial={false}>
                          {error ? (
                            <motion.p
                              key="error"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-start gap-1.5 text-xs text-destructive"
                            >
                              <AlertCircle size={13} className="mt-px shrink-0" />
                              {error}
                            </motion.p>
                          ) : capsLock ? (
                            <motion.p
                              key="caps"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-amber-500"
                            >
                              Caps Lock is on.
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    <label
                      htmlFor="stay"
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <input
                        id="stay"
                        type="checkbox"
                        checked={staySignedIn}
                        onChange={(event) => setStaySignedIn(event.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-border accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      Stay signed in on this device
                    </label>

                    <Button
                      type="submit"
                      disabled={!password || isLoading || status === "success"}
                      className="h-10 w-full gap-2 font-medium"
                    >
                      {status === "loading" && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {status === "success" && <Check size={16} strokeWidth={2.5} />}
                      {status === "loading"
                        ? "Signing in"
                        : status === "success"
                          ? "Signed in"
                          : "Sign in"}
                    </Button>

                    <button
                      type="button"
                      onClick={goBack}
                      className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowLeft size={13} />
                      Use a different email
                    </button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Below the card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 space-y-4 text-center text-sm text-muted-foreground"
        >
          <p>
            New to ExpenseFlow?{" "}
            <Link
              to="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="text-xs leading-5">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;