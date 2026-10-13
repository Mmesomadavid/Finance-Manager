import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Download,
  KeyRound,
  Laptop,
  LogOut,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  ConfirmDialog,
  Field,
  PageHeader,
} from "../../components/dashboard/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

/* ------------------------------- shared styles ---------------------------- */

const purpleButton =
  "rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed]";

const tabsListClass = "h-auto rounded-xl bg-[#f5f3f8] p-1";

const tabsTriggerClass =
  "rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#14121a] data-[state=active]:shadow-sm";

/* ------------------------------- layout bits ------------------------------ */

const SettingRow = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 py-4">
    <div className="min-w-0 max-w-md">
      <p className="text-sm font-medium text-[#14121a]">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-[#8e8a97]">
        {description}
      </p>
    </div>

    {children}
  </div>
);

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="mb-1">
    <h2 className="text-sm font-semibold text-[#14121a]">{title}</h2>

    {description && (
      <p className="mt-0.5 text-xs text-[#8e8a97]">{description}</p>
    )}
  </div>
);

/* ---------------------------------- profile ------------------------------- */

const countries = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

type Profile = {
  name: string;
  email: string;
  phone: string;
  country: string;
};

const initialProfile: Profile = {
  name: "Ada Okafor",
  email: "ada@example.com",
  phone: "+234 803 123 4567",
  country: "NG",
};

const ProfileTab = () => {
  const [saved, setSaved] = useState<Profile>(initialProfile);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  useEffect(() => {
    return () => {
      if (avatar) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [avatar]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Record<string, string> = {};

    if (profile.name.trim().length < 2) {
      next.name = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(profile.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setSaving(true);

    try {
      // TODO: Send the updated profile to your backend.
      await new Promise<void>((resolve) => setTimeout(resolve, 600));

      setSaved({ ...profile, email: profile.email.trim() });
      setProfile((current) => ({
        ...current,
        email: current.email.trim(),
      }));

      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update your profile");
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = <K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));

    if (key === "name" || key === "email") {
      setErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  return (
    <Card>
      <form onSubmit={save}>
        <SectionTitle
          title="Profile"
          description="How you appear across ExpenseFlow."
        />

        <div className="flex items-center gap-4 py-5">
          <Avatar className="h-16 w-16">
            {avatar && <AvatarImage src={avatar} alt="Profile avatar" />}

            <AvatarFallback className="bg-[#fde047] text-lg font-bold text-[#5b4a00]">
              {profile.name.trim().charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                  toast.error("Your profile photo must be 2 MB or smaller");
                  event.target.value = "";
                  return;
                }

                setAvatar(URL.createObjectURL(file));
                event.target.value = "";
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={14} className="mr-2" />
              Change photo
            </Button>

            <p className="mt-1.5 text-xs text-[#8e8a97]">
              JPG, PNG or WebP, up to 2 MB.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="s-name" error={errors.name}>
            <Input
              id="s-name"
              autoComplete="name"
              value={profile.name}
              onChange={(event) =>
                updateProfile("name", event.target.value)
              }
            />
          </Field>

          <Field label="Email" htmlFor="s-email" error={errors.email}>
            <Input
              id="s-email"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(event) =>
                updateProfile("email", event.target.value)
              }
            />
          </Field>

          <Field label="Phone" htmlFor="s-phone">
            <Input
              id="s-phone"
              type="tel"
              autoComplete="tel"
              value={profile.phone}
              onChange={(event) =>
                updateProfile("phone", event.target.value)
              }
            />
          </Field>

          <Field label="Country">
            <Select
              value={profile.country}
              onValueChange={(value) =>
                updateProfile("country", value ?? profile.country)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>

              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#f0eef4] pt-4">
          <p
            className={`text-xs ${
              dirty ? "text-amber-600" : "text-[#8e8a97]"
            }`}
          >
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!dirty || saving}
              onClick={() => {
                setProfile(saved);
                setErrors({});
              }}
            >
              Discard
            </Button>

            <Button
              type="submit"
              className={purpleButton}
              disabled={!dirty || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

/* --------------------------------- security ------------------------------- */

const getPasscodeIssue = (value: string): string | null => {
  if (/^(\d)\1+$/.test(value)) {
    return "Avoid repeating a single digit.";
  }

  if (
    value === "123456" ||
    value === "234567" ||
    value === "345678" ||
    value === "456789" ||
    value === "987654" ||
    value === "876543" ||
    value === "765432" ||
    value === "654321"
  ) {
    return "Avoid simple sequences like 123456.";
  }

  return null;
};

const PasscodeDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [values, setValues] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const digits =
    (key: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [key]: event.target.value.replace(/\D/g, "").slice(0, 6),
      }));

      setErrors((current) => ({ ...current, [key]: "" }));
    };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (values.current.length !== 6) {
      nextErrors.current = "Enter your current 6-digit passcode.";
    }

    if (values.next.length !== 6) {
      nextErrors.next = "Your new passcode must be 6 digits.";
    } else if (values.next === values.current) {
      nextErrors.next = "Choose a different passcode.";
    } else {
      const issue = getPasscodeIssue(values.next);

      if (issue) {
        nextErrors.next = issue;
      }
    }

    if (values.confirm !== values.next) {
      nextErrors.confirm = "Passcodes don't match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: Send to your backend and verify the current passcode server-side.
    toast.success("Passcode change submitted");
    onOpenChange(false);
  };

  const fields = [
    {
      key: "current",
      label: "Current passcode",
      autoComplete: "current-password",
    },
    {
      key: "next",
      label: "New passcode",
      autoComplete: "new-password",
    },
    {
      key: "confirm",
      label: "Confirm new passcode",
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change passcode</DialogTitle>
          <DialogDescription>
            You'll use the new passcode to unlock ExpenseFlow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {fields.map((field, index) => (
            <Field
              key={field.key}
              label={field.label}
              htmlFor={`pc-${field.key}`}
              error={errors[field.key]}
            >
              <Input
                id={`pc-${field.key}`}
                type="password"
                inputMode="numeric"
                autoComplete={field.autoComplete}
                autoFocus={index === 0}
                placeholder="••••••"
                maxLength={6}
                className="tracking-[0.4em]"
                value={values[field.key]}
                onChange={digits(field.key)}
              />
            </Field>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className={purpleButton}>
              Update passcode
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

type Session = {
  id: string;
  device: string;
  place: string;
  last: string;
  current?: boolean;
  mobile?: boolean;
};

const initialSessions: Session[] = [
  {
    id: "s1",
    device: "Chrome on Windows",
    place: "Lagos, NG",
    last: "Active now",
    current: true,
  },
  {
    id: "s2",
    device: "ExpenseFlow for Android",
    place: "Lagos, NG",
    last: "2 hours ago",
    mobile: true,
  },
  {
    id: "s3",
    device: "Safari on iPhone",
    place: "Abuja, NG",
    last: "Yesterday",
    mobile: true,
  },
];

type SecurityConfirm =
  | { kind: "2fa" | "session" | "all" | "delete"; id?: string }
  | null;

const SecurityTab = () => {
  const navigate = useNavigate();

  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [confirm, setConfirm] = useState<SecurityConfirm>(null);

  const session = sessions.find((item) => item.id === confirm?.id);

  const confirmationCopy: Record<
    NonNullable<SecurityConfirm>["kind"],
    {
      title: string;
      body: string;
      label: string;
      text?: string;
    }
  > = {
    "2fa": {
      title: "Turn off two-step verification?",
      body: "Your account will only be protected by your passcode. We recommend keeping this on.",
      label: "Turn off",
    },
    session: {
      title: `Sign out ${session?.device ?? "this device"}?`,
      body: "That device will need to sign in again.",
      label: "Sign out",
    },
    all: {
      title: "Sign out of all other devices?",
      body: "You'll stay signed in here. Every other device will be signed out.",
      label: "Sign out everywhere",
    },
    delete: {
      title: "Delete your account?",
      body: "This permanently deletes your account, transactions and budgets. This can't be undone.",
      label: "Delete account",
      text: "DELETE",
    },
  };

  const handleTwoFactor = (enabled: boolean) => {
    if (enabled) {
      setTwoFactor(true);
      toast.success("Two-step verification enabled");
    } else {
      setConfirm({ kind: "2fa" });
    }
  };

  const runConfirm = () => {
    if (!confirm) return;

    if (confirm.kind === "2fa") {
      setTwoFactor(false);
      toast("Two-step verification disabled");
    } else if (confirm.kind === "session") {
      setSessions((current) =>
        current.filter((item) => item.id !== confirm.id),
      );
      toast.success("Device signed out");
    } else if (confirm.kind === "all") {
      setSessions((current) => current.filter((item) => item.current));
      toast.success("Signed out of all other devices");
    } else {
      // TODO: Call your delete-account endpoint and clear the session.
      toast.success("Account deletion must be completed by the server");
      navigate("/auth/login");
    }

    setConfirm(null);
  };

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Sign-in & security" />

        <div className="divide-y divide-[#f0eef4]">
          <SettingRow
            title="Passcode"
            description="Your 6-digit passcode unlocks the app on every device."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasscodeOpen(true)}
            >
              <KeyRound size={14} className="mr-2" />
              Change
            </Button>
          </SettingRow>

          <SettingRow
            title="Two-step verification"
            description="Get a code by SMS or email when you sign in on a new device."
          >
            <Switch
              aria-label="Two-step verification"
              checked={twoFactor}
              onCheckedChange={handleTwoFactor}
            />
          </SettingRow>

          <SettingRow
            title="Biometric unlock"
            description="Use Face ID or your fingerprint instead of typing the passcode."
          >
            <Switch
              aria-label="Biometric unlock"
              checked={biometric}
              onCheckedChange={setBiometric}
            />
          </SettingRow>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <SectionTitle
            title="Active sessions"
            description="Devices currently signed in to your account."
          />

          <Button
            variant="outline"
            size="sm"
            disabled={sessions.filter((item) => !item.current).length === 0}
            onClick={() => setConfirm({ kind: "all" })}
          >
            Sign out others
          </Button>
        </div>

        <ul className="mt-2 divide-y divide-[#f0eef4]">
          {sessions.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 py-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f3f6] text-[#6f6a78]">
                {item.mobile ? (
                  <Smartphone size={18} />
                ) : (
                  <Laptop size={18} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-[#14121a]">
                  {item.device}

                  {item.current && (
                    <Badge className="rounded-md bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50">
                      This device
                    </Badge>
                  )}
                </p>

                <p className="text-xs text-[#8e8a97]">
                  {item.place} · {item.last}
                </p>
              </div>

              {!item.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Sign out ${item.device}`}
                  onClick={() =>
                    setConfirm({ kind: "session", id: item.id })
                  }
                >
                  <LogOut size={14} className="mr-1.5" />
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border border-red-100">
        <SectionTitle title="Danger zone" />

        <div className="divide-y divide-[#f0eef4]">
          <SettingRow
            title="Export your data"
            description="Download everything we store about you as a ZIP file."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success(
                  "Export requested. Connect this action to your backend to generate a download.",
                )
              }
            >
              <Download size={14} className="mr-2" />
              Request export
            </Button>
          </SettingRow>

          <SettingRow
            title="Delete account"
            description="Permanently remove your account and all of its data."
          >
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => setConfirm({ kind: "delete" })}
            >
              <Trash2 size={14} className="mr-2" />
              Delete account
            </Button>
          </SettingRow>
        </div>
      </Card>

      {passcodeOpen && (
        <PasscodeDialog
          key="passcode-dialog"
          open={passcodeOpen}
          onOpenChange={setPasscodeOpen}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        destructive
        title={confirm ? confirmationCopy[confirm.kind].title : ""}
        description={confirm ? confirmationCopy[confirm.kind].body : ""}
        confirmLabel={
          confirm ? confirmationCopy[confirm.kind].label : "Confirm"
        }
        requireText={
          confirm ? confirmationCopy[confirm.kind].text : undefined
        }
        onConfirm={runConfirm}
      />
    </div>
  );
};

/* ------------------------------ notifications ----------------------------- */

const channels = ["push", "email", "sms"] as const;

type Channel = (typeof channels)[number];

const notificationRows = [
  {
    id: "reminders",
    title: "Payment reminders",
    body: "Before a subscription or bill is due.",
  },
  {
    id: "budgets",
    title: "Budget alerts",
    body: "When you near or pass a budget limit.",
  },
  {
    id: "large",
    title: "Large transactions",
    body: "Any single payment over $500.",
  },
  {
    id: "weekly",
    title: "Weekly summary",
    body: "A recap of your spending every Monday.",
  },
  {
    id: "product",
    title: "Product updates",
    body: "New features and tips.",
  },
];

const initialPrefs: Record<string, Record<Channel, boolean>> = {
  reminders: { push: true, email: true, sms: false },
  budgets: { push: true, email: false, sms: false },
  large: { push: true, email: true, sms: true },
  weekly: { push: false, email: true, sms: false },
  product: { push: false, email: false, sms: false },
};

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(initialPrefs);

  const toggle = (
    row: string,
    channel: Channel,
    enabled: boolean,
  ) => {
    setPrefs((current) => ({
      ...current,
      [row]: {
        ...current[row],
        [channel]: enabled,
      },
    }));

    toast.success("Notification settings updated", {
      id: "notifications",
    });
  };

  return (
    <Card>
      <SectionTitle
        title="Notifications"
        description="Choose how you'd like to hear about each thing."
      />

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[460px]">
          <div className="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-2 border-b border-[#f0eef4] pb-2 text-xs font-medium text-[#8e8a97]">
            <span />

            {channels.map((channel) => (
              <span
                key={channel}
                className="text-center capitalize"
              >
                {channel === "sms" ? "SMS" : channel}
              </span>
            ))}
          </div>

          {notificationRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-2 border-b border-[#f0eef4] py-3.5 last:border-0"
            >
              <div className="min-w-0 pr-2">
                <p className="text-sm font-medium text-[#14121a]">
                  {row.title}
                </p>

                <p className="mt-0.5 text-xs text-[#8e8a97]">
                  {row.body}
                </p>
              </div>

              {channels.map((channel) => (
                <div key={channel} className="flex justify-center">
                  <Switch
                    aria-label={`${row.title} by ${channel}`}
                    checked={prefs[row.id][channel]}
                    onCheckedChange={(enabled) =>
                      toggle(row.id, channel, enabled)
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/* -------------------------------- preferences ----------------------------- */

const PreferencesTab = () => {
  const [prefs, setPrefs] = useState({
    currency: "USD",
    language: "en",
    dateFormat: "dmy",
    hideBalances: false,
    compact: false,
  });

  const update = <K extends keyof typeof prefs>(
    key: K,
    value: (typeof prefs)[K],
  ) => {
    setPrefs((current) => ({
      ...current,
      [key]: value,
    }));

    toast.success("Preferences updated", { id: "prefs" });
  };

  const selectClass = "w-[170px]";

  return (
    <Card>
      <SectionTitle
        title="Preferences"
        description="Changes save automatically."
      />

      <div className="divide-y divide-[#f0eef4]">
        <SettingRow
          title="Currency"
          description="Used to display balances and totals."
        >
          <Select
            value={prefs.currency}
            onValueChange={(value) =>
              update("currency", value ?? prefs.currency)
            }
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="USD">US Dollar (USD)</SelectItem>
              <SelectItem value="NGN">Naira (NGN)</SelectItem>
              <SelectItem value="GBP">Pound (GBP)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Language"
          description="The language used across the app."
        >
          <Select
            value={prefs.language}
            onValueChange={(value) =>
              update("language", value ?? prefs.language)
            }
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Date format"
          description="How dates appear in tables and charts."
        >
          <Select
            value={prefs.dateFormat}
            onValueChange={(value) =>
              update("dateFormat", value ?? prefs.dateFormat)
            }
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="dmy">13 Oct 2026</SelectItem>
              <SelectItem value="mdy">Oct 13, 2026</SelectItem>
              <SelectItem value="iso">2026-10-13</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Hide balances by default"
          description="Mask amounts until you tap to reveal them."
        >
          <Switch
            aria-label="Hide balances by default"
            checked={prefs.hideBalances}
            onCheckedChange={(enabled) =>
              update("hideBalances", enabled)
            }
          />
        </SettingRow>

        <SettingRow
          title="Compact numbers"
          description="Show 12.4k instead of 12,400 in charts and cards."
        >
          <Switch
            aria-label="Compact numbers"
            checked={prefs.compact}
            onCheckedChange={(enabled) =>
              update("compact", enabled)
            }
          />
        </SettingRow>
      </div>
    </Card>
  );
};

/* ---------------------------------- page ---------------------------------- */

export default function DashboardSettings() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Manage your profile, security and how ExpenseFlow behaves."
      />

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList
          className={`${tabsListClass} max-w-full overflow-x-auto`}
        >
          <TabsTrigger
            value="profile"
            className={tabsTriggerClass}
          >
            Profile
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className={tabsTriggerClass}
          >
            Security
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className={tabsTriggerClass}
          >
            Notifications
          </TabsTrigger>

          <TabsTrigger
            value="preferences"
            className={tabsTriggerClass}
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        <div className="max-w-3xl">
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <PreferencesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
