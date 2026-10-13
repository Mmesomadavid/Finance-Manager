
import { useMemo, useState, type FormEvent } from "react";
import {
  CirclePause,
  CirclePlay,
  PiggyBank,
  Pencil,
  Plus,
  Sparkles,
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
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

/* ---------------------------------- data ----------------------------------- */

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  alertAt: number;
  paused: boolean;
};

const allCategories = [
  "Housing",
  "Food & groceries",
  "Transport",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Health",
  "Education",
  "Travel",
];

const seed: Budget[] = [
  {
    id: "b1",
    category: "Housing",
    limit: 1300,
    spent: 1195.11,
    alertAt: 90,
    paused: false,
  },
  {
    id: "b2",
    category: "Food & groceries",
    limit: 900,
    spent: 368.28,
    alertAt: 80,
    paused: false,
  },
  {
    id: "b3",
    category: "Transport",
    limit: 600,
    spent: 212.19,
    alertAt: 80,
    paused: false,
  },
  {
    id: "b4",
    category: "Entertainment",
    limit: 250,
    spent: 281.4,
    alertAt: 80,
    paused: false,
  },
  {
    id: "b5",
    category: "Utilities",
    limit: 300,
    spent: 148,
    alertAt: 80,
    paused: false,
  },
  {
    id: "b6",
    category: "Shopping",
    limit: 400,
    spent: 96,
    alertAt: 70,
    paused: false,
  },
];

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  
const darkPill =
  "rounded-full bg-[#17141f] px-4 text-white hover:bg-[#302a3b]";

const purpleButton =
  "rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed]";


const tabsListClass = "h-auto rounded-xl bg-[#f5f3f8] p-1";

const tabsTriggerClass =
  "rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#14121a] data-[state=active]:shadow-sm";


/* ----------------------------- monthly metrics ----------------------------- */

const now = new Date();

const daysInMonth = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  0,
).getDate();

const PACE = now.getDate() / daysInMonth;
const daysLeft = daysInMonth - now.getDate();

const monthLabel = now.toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

type Status = "over" | "near" | "watch" | "ok";

const statusOf = (budget: Budget): Status => {
  const ratio = budget.spent / budget.limit;

  if (ratio >= 1) return "over";
  if (ratio * 100 >= budget.alertAt) return "near";
  if (budget.spent / PACE > budget.limit) return "watch";

  return "ok";
};

const statusMeta: Record<
  Status,
  { label: string; badge: string; bar: string }
> = {
  over: {
    label: "Over budget",
    badge: "bg-red-50 text-red-700",
    bar: "bg-red-500",
  },
  near: {
    label: "Near limit",
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  watch: {
    label: "Trending over",
    badge: "bg-orange-50 text-orange-700",
    bar: "bg-orange-400",
  },
  ok: {
    label: "On track",
    badge: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
};

const alertOptions = ["50", "70", "80", "90"];

/* ------------------------------- progress bar ------------------------------ */

const Bar = ({
  ratio,
  barClass,
  className = "h-2.5",
}: {
  ratio: number;
  barClass: string;
  className?: string;
}) => (
  <div
    className={`relative w-full rounded-full bg-[#f0eef4] ${className}`}
  >
    <div
      className={`h-full rounded-full transition-all duration-700 ${barClass}`}
      style={{
        width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`,
      }}
    />

    <span
      title="Where you'd be if spending were even across the month"
      className="absolute -top-1 h-[calc(100%+8px)] w-0.5 rounded-full bg-[#14121a]/40"
      style={{ left: `${PACE * 100}%` }}
    />
  </div>
);

/* ------------------------------ budget dialog ------------------------------ */

type FormState =
  | { mode: "add" }
  | { mode: "edit"; budget: Budget }
  | null;

type BudgetFormValues = {
  category: string;
  limit: number;
  alertAt: number;
};

type BudgetDialogProps = {
  state: FormState;
  usedCategories: string[];
  onClose: () => void;
  onSave: (values: BudgetFormValues, id?: string) => void;
};

const BudgetDialog = ({
  state,
  usedCategories,
  onClose,
  onSave,
}: BudgetDialogProps) => {
  const available = allCategories.filter(
    (category) => !usedCategories.includes(category),
  );

  const [category, setCategory] = useState(() =>
    state?.mode === "edit"
      ? state.budget.category
      : available[0] ?? "",
  );

  const [limit, setLimit] = useState(() =>
    state?.mode === "edit"
      ? String(state.budget.limit)
      : "",
  );

  const [alertAt, setAlertAt] = useState(() =>
    state?.mode === "edit"
      ? String(state.budget.alertAt)
      : "80",
  );

  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = Number(limit);

    if (!category) {
      setError("Pick a category.");
      return;
    }

    if (!limit.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Enter a monthly limit greater than zero.");
      return;
    }

    onSave(
      {
        category,
        limit: value,
        alertAt: Number(alertAt),
      },
      state?.mode === "edit" ? state.budget.id : undefined,
    );
  };

  return (
    <Dialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "edit" ? "Edit budget" : "Create budget"}
          </DialogTitle>

          <DialogDescription>
            Set a monthly limit and we'll warn you before you reach it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Category">
            {state?.mode === "edit" ? (
              <p className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                {category}
              </p>
            ) : (
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value ?? "");
                  setError("");
                }}
                disabled={!available.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No categories left" />
                </SelectTrigger>

                <SelectContent>
                  {available.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly limit" htmlFor="budget-limit">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8e8a97]">
                  $
                </span>

                <Input
                  id="budget-limit"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  autoFocus
                  placeholder="500"
                  className="pl-6"
                  value={limit}
                  onChange={(event) => {
                    setLimit(event.target.value);
                    setError("");
                  }}
                />
              </div>
            </Field>

            <Field label="Alert me at">
              <Select
                value={alertAt}
                onValueChange={(value) => {
                  setAlertAt(value ?? "80");
                  setError("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {alertOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}% spent
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className={purpleButton}
              disabled={state?.mode === "add" && !available.length}
            >
              {state?.mode === "edit" ? "Save changes" : "Create budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------------------------- page ----------------------------------- */

export default function DashboardBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>(seed);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState<FormState>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const active = budgets.filter((budget) => !budget.paused);

  const totalLimit = active.reduce(
    (sum, budget) => sum + budget.limit,
    0,
  );

  const totalSpent = active.reduce(
    (sum, budget) => sum + budget.spent,
    0,
  );

  const overall = totalLimit ? totalSpent / totalLimit : 0;

  const attention = active.filter((budget) =>
    ["over", "near", "watch"].includes(statusOf(budget)),
  );

  const visible = useMemo(
    () =>
      budgets.filter((budget) => {
        if (tab === "attention") {
          return !budget.paused && statusOf(budget) !== "ok";
        }

        if (tab === "ok") {
          return !budget.paused && statusOf(budget) === "ok";
        }

        return true;
      }),
    [budgets, tab],
  );

  const save = (values: BudgetFormValues, id?: string) => {
    if (id) {
      setBudgets((list) =>
        list.map((budget) =>
          budget.id === id
            ? { ...budget, ...values }
            : budget,
        ),
      );

      toast.success("Budget updated");
    } else {
      setBudgets((list) => [
        ...list,
        {
          ...values,
          id: `b${Date.now()}`,
          spent: 0,
          paused: false,
        },
      ]);

      toast.success(`${values.category} budget created`);
    }

    setForm(null);
  };

  const togglePause = (budget: Budget) => {
    setBudgets((list) =>
      list.map((item) =>
        item.id === budget.id
          ? { ...item, paused: !item.paused }
          : item,
      ),
    );

    toast(
      budget.paused
        ? `${budget.category} budget resumed`
        : `${budget.category} budget paused`,
    );
  };

  const remove = (id: string) => {
    const index = budgets.findIndex((budget) => budget.id === id);
    const removed = budgets[index];

    if (!removed) return;

    setBudgets((list) => list.filter((budget) => budget.id !== id));
    setDeleteId(null);

    toast(`${removed.category} budget deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          setBudgets((list) => {
            if (list.some((budget) => budget.id === removed.id)) {
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

  const menuFor = (budget: Budget): MenuAction[] => [
    {
      label: "Edit budget",
      icon: Pencil,
      onSelect: () =>
        setForm({ mode: "edit", budget }),
    },
    {
      label: budget.paused ? "Resume tracking" : "Pause tracking",
      icon: budget.paused ? CirclePlay : CirclePause,
      onSelect: () => togglePause(budget),
    },
    {
      label: "Delete",
      icon: Trash2,
      destructive: true,
      separatorBefore: true,
      onSelect: () => setDeleteId(budget.id),
    },
  ];

  const toDelete = budgets.find(
    (budget) => budget.id === deleteId,
  );

  const usedCategories = budgets
    .filter(
      (budget) =>
        budget.id !==
        (form?.mode === "edit" ? form.budget.id : ""),
    )
    .map((budget) => budget.category);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Budgets"
        description={`${monthLabel} · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        actions={
          <Button
            className={darkPill}
            onClick={() => setForm({ mode: "add" })}
          >
            <Plus size={15} />
            Create budget
          </Button>
        }
      />

      {/* Overview */}
      <Card>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-[13px] text-[#9a96a3]">
              Budgeted
            </p>

            <Money
              value={totalLimit}
              className="mt-1 block text-2xl font-semibold tracking-tight text-[#14121a]"
            />
          </div>

          <div>
            <p className="text-[13px] text-[#9a96a3]">
              Spent
            </p>

            <Money
              value={totalSpent}
              className="mt-1 block text-2xl font-semibold tracking-tight text-[#14121a]"
            />
          </div>

          <div>
            <p className="text-[13px] text-[#9a96a3]">
              {totalLimit - totalSpent >= 0
                ? "Remaining"
                : "Over by"}
            </p>

            <Money
              value={Math.abs(totalLimit - totalSpent)}
              className={`mt-1 block text-2xl font-semibold tracking-tight ${
                totalLimit - totalSpent >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            />
          </div>
        </div>

        <div className="mt-5">
          <Bar
            ratio={overall}
            barClass={
              overall >= 1
                ? "bg-red-500"
                : "bg-[#8b5cf6]"
            }
            className="h-3"
          />

          <div className="mt-2 flex justify-between text-[11px] text-[#8e8a97]">
            <span>
              {Math.round(overall * 100)}% of budget used
            </span>

            <span>
              {Math.round(PACE * 100)}% of the month gone
            </span>
          </div>
        </div>
      </Card>

      {/* Attention banner */}
      {attention.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f1ecff] px-5 py-4">
          <div className="flex items-start gap-3">
            <Sparkles
              size={18}
              className="mt-0.5 shrink-0 text-[#7c4ff0]"
            />

            <div>
              <p className="text-sm font-semibold text-[#2b1a5c]">
                {attention.length} budget
                {attention.length === 1 ? " needs" : "s need"} attention
              </p>

              <p className="mt-0.5 text-xs text-[#6a5a9c]">
                {attention
                  .map((budget) => budget.category)
                  .join(", ")}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full bg-white"
            onClick={() => setTab("attention")}
          >
            Review
          </Button>
        </div>
      )}

      {/* Filters */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={tabsListClass}>
          <TabsTrigger
            value="all"
            className={tabsTriggerClass}
          >
            All
          </TabsTrigger>

          <TabsTrigger
            value="attention"
            className={tabsTriggerClass}
          >
            Needs attention
          </TabsTrigger>

          <TabsTrigger
            value="ok"
            className={tabsTriggerClass}
          >
            On track
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Budget list */}
      {visible.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title={
            tab === "all"
              ? "No budgets yet"
              : "Nothing in this view"
          }
          body={
            tab === "all"
              ? "Create a budget to see how your spending stacks up."
              : "Everything looks different here. Switch tabs to see other budgets."
          }
          action={
            tab === "all" ? (
              <Button
                className={darkPill}
                onClick={() => setForm({ mode: "add" })}
              >
                Create budget
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((budget) => {
            const status = statusOf(budget);
            const meta = statusMeta[status];
            const ratio = budget.spent / budget.limit;
            const projected = budget.spent / PACE;
            const left = budget.limit - budget.spent;

            return (
              <Card
                key={budget.id}
                className={budget.paused ? "opacity-60" : ""}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#14121a]">
                      {budget.category}
                    </p>

                    <Badge
                      variant="secondary"
                      className={`mt-1.5 rounded-md text-[10px] font-semibold ${
                        budget.paused
                          ? "bg-slate-100 text-slate-600"
                          : meta.badge
                      }`}
                    >
                      {budget.paused ? "Paused" : meta.label}
                    </Badge>
                  </div>

                  <ActionMenu
                    label={`${budget.category} budget options`}
                    title={`${budget.category} budget`}
                    actions={menuFor(budget)}
                  />
                </div>

                <div className="mt-5 flex items-baseline justify-between">
                  <Money
                    value={budget.spent}
                    className="text-xl font-semibold tracking-tight text-[#14121a]"
                  />

                  <span className="text-xs text-[#8e8a97]">
                    of ${formatMoney(budget.limit)}
                  </span>
                </div>

                <div className="mt-3">
                  <Bar
                    ratio={ratio}
                    barClass={
                      budget.paused
                        ? "bg-slate-300"
                        : meta.bar
                    }
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-[#8e8a97]">
                  {budget.paused
                    ? "Tracking is paused for this budget."
                    : status === "over"
                      ? `You're $${formatMoney(-left)} over your limit.`
                      : projected > budget.limit
                        ? `$${formatMoney(left)} left. At this pace you'll end ~$${formatMoney(projected - budget.limit)} over.`
                        : `$${formatMoney(left)} left. On pace for about $${formatMoney(projected)}.`}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/edit dialog */}
      <BudgetDialog
        key={
          form?.mode === "edit"
            ? form.budget.id
            : form?.mode ?? "closed"
        }
        state={form}
        usedCategories={usedCategories}
        onClose={() => setForm(null)}
        onSave={save}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        destructive
        title={`Delete ${toDelete?.category ?? ""} budget?`}
        description="Your transactions stay untouched, but you'll stop getting alerts for this category. You can undo right after."
        confirmLabel="Delete budget"
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
      />
    </div>
  );
}
