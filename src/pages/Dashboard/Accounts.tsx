
import { useMemo, useState, type FormEvent } from "react";
import {
  CreditCard,
  Eye,
  Landmark,
  Pencil,
  Plus,
  Snowflake,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  ActionMenu,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Money,
  PageHeader,
  type MenuAction,
} from "../../components/dashboard/shared";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

/* ---------------------------------- styles --------------------------------- */

const tabsListClass = "h-auto rounded-xl bg-[#f5f3f8] p-1";

const tabsTriggerClass =
  "rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#14121a] data-[state=active]:shadow-sm";

/* ---------------------------------- types ---------------------------------- */

type Kind = "bank" | "card";

type Account = {
  id: string;
  name: string;
  kind: Kind;
  brand: string;
  last4: string;
  balance: number;
  frozen: boolean;
  primary: boolean;
};

type ConnectValues = {
  name: string;
  kind: Kind;
  brand: string;
  last4: string;
  balance: string;
};

/* ---------------------------------- data ----------------------------------- */

const brands = ["Visa", "Mastercard", "Verve"];

const gradients: Record<string, string> = {
  Visa: "from-[#4f2fd0] to-[#7c5cf0]",
  Mastercard: "from-[#1f2937] to-[#4b5563]",
  Verve: "from-[#0f766e] to-[#2dd4bf]",
};

const initialAccounts: Account[] = [
  {
    id: "a1",
    name: "USD Account",
    kind: "bank",
    brand: "Visa",
    last4: "1990",
    balance: 28390.2,
    frozen: false,
    primary: true,
  },
  {
    id: "a2",
    name: "Everyday Account",
    kind: "bank",
    brand: "Mastercard",
    last4: "8742",
    balance: 8420.5,
    frozen: false,
    primary: false,
  },
  {
    id: "a3",
    name: "Savings Account",
    kind: "bank",
    brand: "Verve",
    last4: "3361",
    balance: 3250,
    frozen: false,
    primary: false,
  },
  {
    id: "a4",
    name: "Business Debit",
    kind: "card",
    brand: "Visa",
    last4: "4417",
    balance: 14569,
    frozen: false,
    primary: false,
  },
  {
    id: "a5",
    name: "Travel Card",
    kind: "card",
    brand: "Mastercard",
    last4: "9026",
    balance: 1280.75,
    frozen: true,
    primary: false,
  },
];

const sampleActivity = [
  { label: "Netflix Subscription", date: "Today", amount: -15.99 },
  { label: "Salary deposit", date: "Oct 10", amount: 4200 },
  { label: "Groceries", date: "Oct 9", amount: -86.4 },
  { label: "Transfer to Savings", date: "Oct 7", amount: -500 },
];

const blankConnect: ConnectValues = {
  name: "",
  kind: "bank",
  brand: "Visa",
  last4: "",
  balance: "",
};

const purpleButton =
  "rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed]";

const darkPill =
  "rounded-full bg-[#17141f] px-4 text-white hover:bg-[#302a3b]";

const kindLabel = (kind: Kind) =>
  kind === "bank" ? "Bank account" : "Card";

/* ------------------------------- card visual ------------------------------- */

const CardFace = ({
  account,
  className = "",
}: {
  account: Account;
  className?: string;
}) => (
  <div
    className={`relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white ${
      gradients[account.brand] ?? gradients.Visa
    } ${account.frozen ? "grayscale" : ""} ${className}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wide">
        {account.brand}
      </span>
      {account.kind === "bank" ? (
        <Landmark size={16} />
      ) : (
        <CreditCard size={16} />
      )}
    </div>

    <div className="flex items-end justify-between">
      <span className="text-sm tracking-[0.2em]">
        •••• {account.last4}
      </span>

      {account.frozen && (
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
          <Snowflake size={11} />
          Frozen
        </span>
      )}
    </div>

    <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
  </div>
);

/* ------------------------------ connect dialog ----------------------------- */

const ConnectDialog = ({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: Omit<Account, "id" | "frozen" | "primary">) => void;
}) => {
  const [form, setForm] = useState<ConnectValues>(blankConnect);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm(blankConnect);
      setErrors({});
    }

    onOpenChange(nextOpen);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Give this account a name.";
    }

    if (!/^\d{4}$/.test(form.last4)) {
      nextErrors.last4 = "Enter the last 4 digits.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onCreate({
      name: form.name.trim(),
      kind: form.kind,
      brand: form.brand,
      last4: form.last4,
      balance: Number(form.balance) || 0,
    });

    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect account</DialogTitle>
          <DialogDescription>
            Add a bank account or card to track it alongside the rest.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Account name"
            htmlFor="acc-name"
            error={errors.name}
          >
            <Input
              id="acc-name"
              autoFocus
              placeholder="e.g. Salary account"
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                value={form.kind}
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    kind: (value ?? "bank") as Kind,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="bank">Bank account</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Network">
              <Select
                value={form.brand}
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    brand: value ?? "Visa",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose network" />
                </SelectTrigger>

                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Last 4 digits"
              htmlFor="acc-last4"
              error={errors.last4}
            >
              <Input
                id="acc-last4"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={form.last4}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    last4: event.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </Field>

            <Field label="Current balance" htmlFor="acc-balance">
              <Input
                id="acc-balance"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.balance}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    balance: event.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className={purpleButton}>
              Connect account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ------------------------------- rename dialog ----------------------------- */

const RenameDialog = ({
  account,
  onClose,
  onSave,
}: {
  account: Account | null;
  onClose: () => void;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState(account?.name ?? "");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    onSave(trimmedName);
  };

  return (
    <Dialog
      open={!!account}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename account</DialogTitle>
          <DialogDescription>
            This name is only visible to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Account name" htmlFor="rename" error={error}>
            <Input
              id="rename"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" className={purpleButton}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------------------------- page ----------------------------------- */

export default function DashboardAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [tab, setTab] = useState("all");
  const [connectOpen, setConnectOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: "freeze" | "remove";
    id: string;
  } | null>(null);

  const byId = (id: string | null): Account | null =>
    accounts.find((account) => account.id === id) ?? null;

  const patch = (id: string, changes: Partial<Account>) => {
    setAccounts((list) =>
      list.map((account) =>
        account.id === id ? { ...account, ...changes } : account,
      ),
    );
  };

  const visible = useMemo(
    () =>
      accounts.filter(
        (account) => tab === "all" || account.kind === tab,
      ),
    [accounts, tab],
  );

  const total = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  const frozenCount = accounts.filter(
    (account) => account.frozen,
  ).length;

  const makePrimary = (id: string) => {
    const account = byId(id);

    setAccounts((list) =>
      list.map((item) => ({
        ...item,
        primary: item.id === id,
      })),
    );

    if (account) {
      toast.success(`${account.name} is now your primary account`);
    }
  };

  const unfreeze = (id: string) => {
    const account = byId(id);

    patch(id, { frozen: false });

    if (account) {
      toast.success(`${account.name} is active again`);
    }
  };

  const removeAccount = (id: string) => {
    const index = accounts.findIndex((account) => account.id === id);
    const removed = accounts[index];

    if (!removed) return;

    setAccounts((list) => list.filter((account) => account.id !== id));
    setDetailId(null);

    toast(`${removed.name} removed`, {
      action: {
        label: "Undo",
        onClick: () => {
          setAccounts((list) => {
            if (list.some((account) => account.id === removed.id)) {
              return list;
            }

            const next = [...list];
            next.splice(Math.min(index, next.length), 0, removed);
            return next;
          });
        },
      },
    });
  };

  const menuFor = (account: Account): MenuAction[] => [
    {
      label: "View details",
      icon: Eye,
      onSelect: () => setDetailId(account.id),
    },
    {
      label: "Rename",
      icon: Pencil,
      onSelect: () => setRenameId(account.id),
    },
    {
      label: "Set as primary",
      icon: Star,
      disabled: account.primary,
      onSelect: () => makePrimary(account.id),
    },
    {
      label: account.frozen ? "Unfreeze" : "Freeze",
      icon: Snowflake,
      separatorBefore: true,
      onSelect: () =>
        account.frozen
          ? unfreeze(account.id)
          : setConfirm({ kind: "freeze", id: account.id }),
    },
    {
      label: "Remove",
      icon: Trash2,
      destructive: true,
      disabled: account.primary,
      onSelect: () =>
        setConfirm({ kind: "remove", id: account.id }),
    },
  ];

  const target = byId(confirm?.id ?? null);
  const detail = byId(detailId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounts"
        description="Every bank account and card in one place."
        actions={
          <Button
            className={darkPill}
            onClick={() => setConnectOpen(true)}
          >
            <Plus size={15} />
            Connect account
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-[13px] text-[#9a96a3]">Total balance</p>
          <Money
            value={total}
            className="mt-2 block text-2xl font-semibold tracking-tight text-[#14121a]"
          />
        </Card>

        <Card>
          <p className="text-[13px] text-[#9a96a3]">Connected</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#14121a]">
            {accounts.length}
          </p>
        </Card>

        <Card>
          <p className="text-[13px] text-[#9a96a3]">Frozen</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#14121a]">
            {frozenCount}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={tabsListClass}>
          <TabsTrigger value="all" className={tabsTriggerClass}>
            All
          </TabsTrigger>

          <TabsTrigger value="bank" className={tabsTriggerClass}>
            Bank accounts
          </TabsTrigger>

          <TabsTrigger value="card" className={tabsTriggerClass}>
            Cards
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Account cards */}
      {visible.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nothing here yet"
          body="Connect an account or card and it will show up in this list."
          action={
            <Button
              className={darkPill}
              onClick={() => setConnectOpen(true)}
            >
              Connect account
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(20,16,40,0.04)] transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setDetailId(account.id)}
                aria-label={`Open ${account.name}`}
                className="block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40"
              >
                <CardFace account={account} className="h-36" />
              </button>

              <div className="flex items-start justify-between gap-2 px-1 pb-1 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#14121a]">
                    {account.name}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-[#8e8a97]">
                      {kindLabel(account.kind)}
                    </span>

                    {account.primary && (
                      <Badge className="rounded-md bg-[#f1ecff] px-1.5 text-[10px] font-semibold text-[#7c4ff0] hover:bg-[#f1ecff]">
                        Primary
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Money
                    value={account.balance}
                    className="text-[15px] font-semibold text-[#14121a]"
                  />

                  <ActionMenu
                    label={`${account.name} options`}
                    title={account.name}
                    actions={menuFor(account)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect account */}
      <ConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onCreate={(values) => {
          setAccounts((list) => [
            ...list,
            {
              ...values,
              id: `a${Date.now()}`,
              frozen: false,
              primary: false,
            },
          ]);

          toast.success(`${values.name} connected`);
        }}
      />

      {/* Rename account */}
      <RenameDialog
        key={renameId ?? "closed"}
        account={byId(renameId)}
        onClose={() => setRenameId(null)}
        onSave={(name) => {
          if (renameId) {
            patch(renameId, { name });
          }

          setRenameId(null);
          toast.success("Account renamed");
        }}
      />

      {/* Freeze / remove confirmation */}
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        destructive
        title={
          confirm?.kind === "freeze"
            ? `Freeze ${target?.name ?? "account"}?`
            : `Remove ${target?.name ?? "account"}?`
        }
        description={
          confirm?.kind === "freeze"
            ? "Payments and transfers from this account will be blocked until you unfreeze it. You can do that any time."
            : "It will be disconnected from ExpenseFlow and its history will no longer appear in your totals. You can undo this right after."
        }
        confirmLabel={
          confirm?.kind === "freeze"
            ? "Freeze account"
            : "Remove account"
        }
        onConfirm={() => {
          if (!confirm) return;

          if (confirm.kind === "freeze") {
            patch(confirm.id, { frozen: true });
            toast.success(`${target?.name ?? "Account"} frozen`);
          } else {
            removeAccount(confirm.id);
          }

          setConfirm(null);
        }}
      />

      {/* Account details */}
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>
                  {detail.brand} •••• {detail.last4}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                <CardFace account={detail} className="h-44" />

                <dl className="divide-y divide-[#f0eef4] rounded-xl border border-[#f0eef4] text-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-[#8e8a97]">Balance</dt>
                    <dd className="text-[#14121a]">
                      <Money
                        value={detail.balance}
                        className="font-semibold"
                      />
                    </dd>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-[#8e8a97]">Type</dt>
                    <dd className="text-[#14121a]">
                      {kindLabel(detail.kind)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-[#8e8a97]">Status</dt>
                    <dd className="text-[#14121a]">
                      {detail.frozen ? "Frozen" : "Active"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-[#8e8a97]">Primary</dt>
                    <dd className="text-[#14121a]">
                      {detail.primary ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#14121a]">
                    Recent activity
                  </h3>

                  <ul className="space-y-1">
                    {sampleActivity.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-[#faf8fc]"
                      >
                        <div>
                          <p className="font-medium text-[#14121a]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[#8e8a97]">
                            {item.date}
                          </p>
                        </div>

                        <Money
                          value={item.amount}
                          signed
                          className={
                            item.amount > 0
                              ? "font-semibold text-emerald-600"
                              : "font-semibold text-[#14121a]"
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRenameId(detail.id)}
                  >
                    <Pencil size={14} className="mr-2" />
                    Rename
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      detail.frozen
                        ? unfreeze(detail.id)
                        : setConfirm({
                            kind: "freeze",
                            id: detail.id,
                          })
                    }
                  >
                    <Snowflake size={14} className="mr-2" />
                    {detail.frozen ? "Unfreeze" : "Freeze"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
