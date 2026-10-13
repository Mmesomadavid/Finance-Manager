import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
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
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

/* ---------------------------------- config ---------------------------------- */

type Method = "phone" | "email";
type Step = "details" | "verify" | "passcode" | "confirm" | "done";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const ease = [0.22, 1, 0.36, 1] as const;

const COUNTRIES = [
  { code: "NG", name: "Nigeria", dial: "234", flag: "🇳🇬", length: 10 },
  { code: "GH", name: "Ghana", dial: "233", flag: "🇬🇭", length: 9 },
  { code: "KE", name: "Kenya", dial: "254", flag: "🇰🇪", length: 9 },
  { code: "ZA", name: "South Africa", dial: "27", flag: "🇿🇦", length: 9 },
  { code: "GB", name: "United Kingdom", dial: "44", flag: "🇬🇧", length: 10 },
  { code: "US", name: "United States", dial: "1", flag: "🇺🇸", length: 10 },
] as const;

type Country = (typeof COUNTRIES)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

/* --------------------------------- helpers ---------------------------------- */

const getDomainSuggestion = (email: string) => {
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!local || !domain) return null;
  const fix = DOMAIN_FIXES[domain];
  return fix ? `${local}@${fix}` : null;
};

const formatLocalPhone = (digits: string) =>
  [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
    .filter(Boolean)
    .join(" ");

const getPasscodeIssue = (value: string) => {
  if (/^(\d)\1+$/.test(value)) return "Avoid repeating a single digit.";
  if ("0123456789".includes(value) || "9876543210".includes(value))
    return "Avoid simple sequences like 123456.";
  return null;
};

/* -------------------------------- CodeInput --------------------------------- */
/* One real input sits invisibly over the boxes, so paste, autofill (SMS codes)
   and mobile keyboards all work without juggling multiple fields. */

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  masked?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  oneTime?: boolean;
};

const CodeInput = ({
  value,
  onChange,
  label,
  masked = false,
  invalid = false,
  disabled = false,
  oneTime = false,
}: CodeInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        autoFocus
        value={value}
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        autoComplete={oneTime ? "one-time-code" : "off"}
        aria-label={label}
        aria-invalid={invalid}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />

      <div className="flex gap-2" aria-hidden="true">
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const char = value[index];
          const isActive =
            focused && index === Math.min(value.length, CODE_LENGTH - 1);

          return (
            <div
              key={index}
              className={`flex h-12 flex-1 items-center justify-center rounded-md border bg-background text-lg font-medium tabular-nums transition-all ${
                invalid
                  ? "border-destructive"
                  : isActive
                    ? "border-foreground ring-2 ring-foreground/10"
                    : char
                      ? "border-foreground/40"
                      : "border-border"
              }`}
            >
              {char ? (
                masked ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                ) : (
                  char
                )
              ) : isActive ? (
                <span className="h-5 w-px animate-pulse bg-foreground" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------- Signup ---------------------------------- */

const Signup = () => {
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<Method>("phone");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const [code, setCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);

  const [resendIn, setResendIn] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [loading, setLoading] = useState(false);

  /* Derived */
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const isPhoneValid =
    phone.length === country.length &&
    (country.code !== "NG" || /^[789]/.test(phone));
  const contactValid = method === "phone" ? isPhoneValid : isEmailValid;
  const nameValid = fullName.trim().length >= 2;
  const suggestion = useMemo(() => getDomainSuggestion(email), [email]);
  const firstName = fullName.trim().split(" ")[0];

  const maskedContact =
    method === "phone"
      ? `+${country.dial} ${phone.slice(0, 3)} ••• ${phone.slice(-2)}`
      : `${email.trim()[0] ?? ""}•••@${email.split("@")[1] ?? ""}`;

  const progress =
    step === "details" ? 0 : step === "verify" ? 1 : step === "done" ? 3 : 2;

  /* Resend countdown */
  useEffect(() => {
    if (step !== "verify" || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendIn]);

  /* Cursor spotlight */
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

  /* Smart phone entry: understands +234…, 234…, and a leading 0 */
  const applyPhoneInput = (raw: string) => {
    let digits = raw.replace(/\D/g, "");
    let next: Country = country;

    if (raw.trim().startsWith("+")) {
      const match = [...COUNTRIES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find((c) => digits.startsWith(c.dial));
      if (match) {
        next = match;
        digits = digits.slice(match.dial.length);
      }
    } else if (digits.startsWith(country.dial) && digits.length > country.length) {
      digits = digits.slice(country.dial.length);
    }

    setCountry(next);
    setPhone(digits.replace(/^0+/, "").slice(0, next.length));
  };

  const changeCountry = (code: string) => {
    const next = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
    setCountry(next);
    setPhone((current) => current.slice(0, next.length));
  };

  /* ------------------------------ API actions ------------------------------ */

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    setTouched(true);
    if (!nameValid || !contactValid || loading) return;

    setLoading(true);
    setError(null);
    try {
      // TODO: Request a verification code from your backend.
      console.log("send code", { fullName, method, email, phone: `+${country.dial}${phone}` });
      setCode("");
      setResendIn(RESEND_SECONDS);
      setStep("verify");
    } catch {
      fail("We couldn't send a code. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setCode("");
    setError(null);
    try {
      // TODO: Request a fresh verification code.
      setResendIn(RESEND_SECONDS);
      setNotice(`New code sent to ${maskedContact}`);
      window.setTimeout(() => setNotice(null), 4000);
    } catch {
      fail("We couldn't resend the code. Try again shortly.");
    }
  };

  const verifyCode = async (value: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: Verify the code with your backend.
      console.log("verify", value);
      setPasscode("");
      setConfirm("");
      setStep("passcode");
    } catch {
      setCode("");
      fail("That code isn't right. Check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (finalPasscode: string) => {
    if (loading) return;
    setLoading(true);
    try {
      // TODO: Create the account with your backend (never log the passcode in production).
      console.log("create account", { fullName, method, passcode: finalPasscode });
      setStep("done");
    } catch {
      setConfirm("");
      fail("We couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Integrate Google OAuth, then send new users to the passcode step.
    console.log("Google authentication requested");
  };

  /* ---------------------------- code step handlers ---------------------------- */

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError(null);
    if (value.length === CODE_LENGTH) void verifyCode(value);
  };

  const handlePasscodeChange = (value: string) => {
    setPasscode(value);
    setError(null);
    if (value.length !== CODE_LENGTH) return;

    const issue = getPasscodeIssue(value);
    if (issue) {
      fail(issue);
      window.setTimeout(() => setPasscode(""), 450);
      return;
    }
    window.setTimeout(() => setStep("confirm"), 180);
  };

  const handleConfirmChange = (value: string) => {
    setConfirm(value);
    setError(null);
    if (value.length !== CODE_LENGTH) return;

    if (value !== passcode) {
      fail("Passcodes don't match. Try again.");
      window.setTimeout(() => setConfirm(""), 450);
      return;
    }
    void createAccount(value);
  };

  const backToDetails = () => {
    setStep("details");
    setCode("");
    setError(null);
    setNotice(null);
  };

  const restartPasscode = () => {
    setPasscode("");
    setConfirm("");
    setError(null);
    setStep("passcode");
  };

  /* --------------------------------- UI bits --------------------------------- */

  const slide = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -16 },
    transition: { duration: 0.22, ease },
  };

  const shake = {
    animate:
      shakeKey > 0 && !reduceMotion ? { x: [0, -8, 8, -5, 5, 0] } : undefined,
    transition: { duration: 0.4 },
  };

  const copy: Record<Step, { title: string; body: string }> = {
    details: {
      title: "Create your account",
      body: "Start tracking your spending in under a minute.",
    },
    verify: {
      title: method === "phone" ? "Check your messages" : "Check your inbox",
      body: `We sent a 6-digit code to ${maskedContact}.`,
    },
    passcode: {
      title: "Create a passcode",
      body: "You'll use this 6-digit passcode to unlock ExpenseFlow.",
    },
    confirm: {
      title: "Confirm your passcode",
      body: "Enter it once more to make sure it's right.",
    },
    done: {
      title: `Welcome, ${firstName || "friend"}`,
      body: "Your account is ready.",
    },
  };

  const ErrorLine = () => (
    <div aria-live="polite" className="min-h-[18px]">
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle size={13} className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );

  const BackButton = ({ onClick, children }: { onClick: () => void; children: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mt-5 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft size={13} />
      {children}
    </button>
  );

  /* ---------------------------------- steps ---------------------------------- */

  const renderStep = () => {
    switch (step) {
      case "details":
        return (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="h-10 w-full gap-2.5 font-medium"
            >
              <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.72 5.99c4.51-4.16 7.06-10.29 7.06-17.64Z" />
                <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.94 23.94 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.72-5.99c-2.14 1.44-4.89 2.3-8.19 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
              </svg>
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={sendCode} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px] font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  autoFocus
                  autoComplete="name"
                  placeholder="Ada Okafor"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-10 focus-visible:ring-foreground/15"
                />
              </div>

              {/* Method switch */}
              <div
                role="tablist"
                aria-label="Sign up with"
                className="grid grid-cols-2 rounded-lg bg-muted p-1"
              >
                {(["phone", "email"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={method === item}
                    onClick={() => {
                      setMethod(item);
                      setTouched(false);
                    }}
                    className={`relative flex h-8 items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      method === item
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {method === item && (
                      <motion.span
                        layoutId="method-pill"
                        transition={{ duration: reduceMotion ? 0 : 0.25, ease }}
                        className="absolute inset-0 rounded-md bg-background shadow-sm"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {item === "phone" ? <Smartphone size={14} /> : <Mail size={14} />}
                      {item === "phone" ? "Phone" : "Email"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={method === "phone" ? "phone" : "email"}
                  className="text-[13px] font-medium"
                >
                  {method === "phone" ? "Phone number" : "Email"}
                </Label>

                {method === "phone" ? (
                  <div
                    className={`flex h-10 items-center rounded-md border bg-background transition-colors focus-within:ring-2 ${
                      touched && phone && !isPhoneValid
                        ? "border-destructive focus-within:ring-destructive/30"
                        : "border-input focus-within:ring-foreground/15"
                    }`}
                  >
                    <div className="relative flex h-full items-center gap-1.5 border-r border-border pl-3 pr-2 text-sm">
                      <span aria-hidden="true">{country.flag}</span>
                      <span className="tabular-nums text-muted-foreground">
                        +{country.dial}
                      </span>
                      <ChevronDown size={13} className="text-muted-foreground" />
                      <select
                        aria-label="Country code"
                        value={country.code}
                        onChange={(event) => changeCountry(event.target.value)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} (+{c.dial})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder={country.code === "NG" ? "803 123 4567" : "Phone number"}
                      value={formatLocalPhone(phone)}
                      onChange={(event) => applyPhoneInput(event.target.value)}
                      onBlur={() => setTouched(true)}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-none placeholder:text-muted-foreground"
                    />
                    {isPhoneValid && (
                      <Check size={16} strokeWidth={2.5} className="mr-3 text-emerald-500" />
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched(true)}
                      aria-invalid={touched && !!email && !isEmailValid}
                      className={`h-10 pr-9 ${
                        touched && email && !isEmailValid
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : "focus-visible:ring-foreground/15"
                      }`}
                    />
                    {isEmailValid && (
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    )}
                  </div>
                )}

                <div aria-live="polite" className="min-h-[18px]">
                  {method === "email" && suggestion ? (
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
                  ) : touched && method === "phone" && phone && !isPhoneValid ? (
                    <p className="text-xs text-destructive">
                      Enter a valid {country.name} number, like{" "}
                      {country.code === "NG" ? "803 123 4567" : "a mobile number"}.
                    </p>
                  ) : touched && method === "email" && email && !isEmailValid ? (
                    <p className="text-xs text-destructive">
                      Enter a valid email address, like name@company.com.
                    </p>
                  ) : null}
                </div>
              </div>

              <ErrorLine />

              <Button
                type="submit"
                disabled={!nameValid || !contactValid || loading}
                className="h-10 w-full gap-2 font-medium"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Sending code" : "Send verification code"}
              </Button>
            </form>
          </>
        );

      case "verify":
        return (
          <div>
            <motion.div {...shake} key={shakeKey}>
              <CodeInput
                value={code}
                onChange={handleCodeChange}
                label="6-digit verification code"
                invalid={!!error}
                disabled={loading}
                oneTime
              />
            </motion.div>

            <div className="mt-3 min-h-[36px] space-y-1">
              <ErrorLine />
              {notice && !error && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <Check size={13} /> {notice}
                </p>
              )}
            </div>

            <div className="mt-2 flex h-5 items-center justify-center text-xs text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> Verifying
                </span>
              ) : resendIn > 0 ? (
                <span className="tabular-nums">
                  Resend code in 0:{String(resendIn).padStart(2, "0")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <BackButton onClick={backToDetails}>
              {method === "phone" ? "Use a different number" : "Use a different email"}
            </BackButton>
          </div>
        );

      case "passcode":
      case "confirm": {
        const isConfirm = step === "confirm";
        return (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-[13px] font-medium">
                {isConfirm ? "Confirm passcode" : "New passcode"}
              </Label>
              <button
                type="button"
                onClick={() => setShowPasscode((v) => !v)}
                aria-pressed={showPasscode}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPasscode ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPasscode ? "Hide" : "Show"}
              </button>
            </div>

            <motion.div {...shake} key={`${step}-${shakeKey}`}>
              <CodeInput
                value={isConfirm ? confirm : passcode}
                onChange={isConfirm ? handleConfirmChange : handlePasscodeChange}
                label={isConfirm ? "Confirm 6-digit passcode" : "6-digit passcode"}
                masked={!showPasscode}
                invalid={!!error}
                disabled={loading}
              />
            </motion.div>

            <div className="mt-3 min-h-[18px]">
              {error ? (
                <ErrorLine />
              ) : loading ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 size={13} className="animate-spin" /> Creating your account
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isConfirm
                    ? "It will unlock the app on this device."
                    : "Pick digits you'll remember but others can't guess."}
                </p>
              )}
            </div>

            {isConfirm && <BackButton onClick={restartPasscode}>Choose a different passcode</BackButton>}
          </div>
        );
      }

      case "done":
        return (
          <div className="flex flex-col items-center py-2 text-center">
            <motion.div
              initial={{ scale: reduceMotion ? 1 : 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
            >
              <Check size={24} strokeWidth={2.5} />
            </motion.div>
            <Link
              to="/dashboard"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Go to dashboard
            </Link>
          </div>
        );
    }
  };

  /* ---------------------------------- render ---------------------------------- */

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground antialiased">
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
                {copy[step].title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{copy[step].body}</p>
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
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              style={{ background: spotlight }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}

          <div className="relative">
            {/* Progress */}
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={Math.min(progress + 1, 3)}
              aria-label="Sign-up progress"
              className="mb-6 grid grid-cols-3 gap-1.5"
            >
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={false}
                    animate={{ width: progress > index ? "100%" : "0%" }}
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
                    className="h-full rounded-full bg-foreground"
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} {...slide}>
                {renderStep()}
              </motion.div>
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
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>

          <p className="text-xs leading-5">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-4 transition-colors hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Signup;