
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Tag,
  Trash2,
  X,
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
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

/* ---------------------------------- styles --------------------------------- */

const darkPill =
  "rounded-full bg-[#17141f] px-4 text-white hover:bg-[#302a3b]";

const purpleButton =
  "rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed]";

const outlinePill =
  "rounded-full border border-[#e8e5ee] bg-white px-4 text-[#383342] hover:bg-[#f7f5fa]";

const tabsListClass = "h-auto rounded-xl bg-[#f5f3f8] p-1";

const tabsTriggerClass =
  "rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#14121a] data-[state=active]:shadow-sm";

/* ---------------------------------- helpers -------------------------------- */

type TxnType = "income" | "expense";

type Txn = {
  id: string;
  description: string;
  category: string;
  account: string;
  date: string;
  amount: number;
  type: TxnType;
};

const expenseCategories = [
  "Food & groceries",
  "Housing",
  "Transport",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Health",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Other income",
];

const allCategories = [...expenseCategories, ...incomeCategories];

const accountNames = [
  "USD Account",
  "Everyday Account",
  "Savings Account",
];

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const tones: Record<string, string> = {
  "Food & groceries": "bg-emerald-50 text-emerald-700",
  Housing: "bg-violet-50 text-violet-700",
  Transport: "bg-amber-50 text-amber-700",
  Entertainment: "bg-rose-50 text-rose-700",
  Utilities: "bg-cyan-50 text-cyan-700",
  Shopping: "bg-pink-50 text-pink-700",
  Health: "bg-teal-50 text-teal-700",
  Salary: "bg-emerald-50 text-emerald-700",
  Freelance: "bg-sky-50 text-sky-700",
  Investments: "bg-indigo-50 text-indigo-700",
  "Other income": "bg-slate-100 text-slate-700",
};

const seed: Txn[] = [
  { id: "t1", description: "Netflix Subscription", category: "Entertainment", account: "Everyday Account", date: "2026-10-13", amount: 15.99, type: "expense" },
  { id: "t2", description: "Salary — Acme Ltd", category: "Salary", account: "USD Account", date: "2026-10-10", amount: 4200, type: "income" },
  { id: "t3", description: "Shoprite groceries", category: "Food & groceries", account: "Everyday Account", date: "2026-10-09", amount: 86.4, type: "expense" },
  { id: "t4", description: "Rent — October", category: "Housing", account: "USD Account", date: "2026-10-01", amount: 1195.11, type: "expense" },
  { id: "t5", description: "Uber rides", category: "Transport", account: "Everyday Account", date: "2026-10-08", amount: 42.75, type: "expense" },
  { id: "t6", description: "Logo design project", category: "Freelance", account: "USD Account", date: "2026-10-06", amount: 850, type: "income" },
  { id: "t7", description: "Internet Subscription", category: "Utilities", account: "Everyday Account", date: "2026-10-05", amount: 49, type: "expense" },
  { id: "t8", description: "Figma Membership", category: "Utilities", account: "USD Account", date: "2026-10-04", amount: 24, type: "expense" },
  { id: "t9", description: "Pharmacy", category: "Health", account: "Everyday Account", date: "2026-10-03", amount: 31.2, type: "expense" },
  { id: "t10", description: "Dividend payout", category: "Investments", account: "Savings Account", date: "2026-10-02", amount: 126.5, type: "income" },
  { id: "t11", description: "Sneakers", category: "Shopping", account: "USD Account", date: "2026-09-28", amount: 96, type: "expense" },
  { id: "t12", description: "Cinema night", category: "Entertainment", account: "Everyday Account", date: "2026-09-26", amount: 28.5, type: "expense" },
  { id: "t13", description: "Fuel", category: "Transport", account: "Everyday Account", date: "2026-09-24", amount: 60, type: "expense" },
  { id: "t14", description: "Salary — Acme Ltd", category: "Salary", account: "USD Account", date: "2026-09-10", amount: 4200, type: "income" },
];

const PAGE_SIZE = 8;

const signed = (txn: Txn) =>
  txn.type === "income" ? txn.amount : -txn.amount;

/* ------------------------------ transaction form --------------------------- */

type FormValues = {
  type: TxnType;
  amount: string;
  description: string;
  category: string;
  account: string;
  date: string;
};

type FormState =
  | { mode: "add" }
  | { mode: "edit"; txn: Txn }
  | null;

const blankForm = (): FormValues => ({
  type: "expense",
  amount: "",
  description: "",
  category: expenseCategories[0],
  account: accountNames[0],
  date: new Date().toISOString().slice(0, 10),
});

const TransactionDialog = ({
  state,
  onClose,
  onSave,
}: {
  state: FormState;
  onClose: () => void;
  onSave: (values: Omit<Txn, "id">, id?: string) => void;
}) => {
  const [form, setForm] = useState<FormValues>(() =>
    state?.mode === "edit"
      ? {
          type: state.txn.type,
          amount: String(state.txn.amount),
          description: state.txn.description,
          category: state.txn.category,
          account: state.txn.account,
          date: state.txn.date,
        }
      : blankForm(),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories =
    form.type === "expense" ? expenseCategories : incomeCategories;

  const switchType = (type: TxnType) => {
    setForm((previous) => ({
      ...previous,
      type,
      category: (
        type === "expense" ? expenseCategories : incomeCategories
      )[0],
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      next.amount = "Enter an amount greater than zero.";
    }

    if (form.description.trim().length < 2) {
      next.description = "Add a short description.";
    }

    if (!form.date) {
      next.date = "Pick a date.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    onSave(
      {
        type: form.type,
        amount,
        description: form.description.trim(),
        category: form.category,
        account: form.account,
        date: form.date,
      },
      state?.mode === "edit" ? state.txn.id : undefined,
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
            {state?.mode === "edit"
              ? "Edit transaction"
              : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            Record money coming in or going out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div
            role="tablist"
            aria-label="Transaction type"
            className="grid grid-cols-2 rounded-lg bg-[#f3f3f6] p-1"
          >
            {(["expense", "income"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={form.type === type}
                onClick={() => switchType(type)}
                className={cn(
                  "h-8 rounded-md text-[13px] font-medium capitalize transition-all",
                  form.type === type
                    ? "bg-white text-[#14121a] shadow-sm"
                    : "text-[#8e8a97] hover:text-[#14121a]",
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Amount"
              htmlFor="txn-amount"
              error={errors.amount}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8e8a97]">
                  $
                </span>
                <Input
                  id="txn-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  autoFocus
                  placeholder="0.00"
                  className="pl-6"
                  value={form.amount}
                  onChange={(event) => {
                    setForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }));
                  }}
                />
              </div>
            </Field>

            <Field label="Date" htmlFor="txn-date" error={errors.date}>
              <Input
                id="txn-date"
                type="date"
                value={form.date}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }));
                }}
              />
            </Field>
          </div>

          <Field
            label="Description"
            htmlFor="txn-desc"
            error={errors.description}
          >
            <Input
              id="txn-desc"
              placeholder="What was this for?"
              value={form.description}
              onChange={(event) => {
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }));
              }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(value) => {
                  setForm((previous) => ({
                    ...previous,
                    category:
                      value ??
                      (previous.type === "expense"
                        ? expenseCategories[0]
                        : incomeCategories[0]),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Account">
              <Select
                value={form.account}
                onValueChange={(value) => {
                  setForm((previous) => ({
                    ...previous,
                    account: value ?? accountNames[0],
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountNames.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className={purpleButton}>
              {state?.mode === "edit" ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------------------------- page ----------------------------------- */

type SortKey = "date" | "description" | "amount";

export default function DashboardTransactions() {
  const [txns, setTxns] = useState<Txn[]>(seed);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<{
    key: SortKey;
    dir: "asc" | "desc";
  }>({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const resetView = () => {
    setPage(1);
    setSelected(new Set());
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const direction = sort.dir === "asc" ? 1 : -1;

    return txns
      .filter(
        (txn) =>
          (typeFilter === "all" || txn.type === typeFilter) &&
          (category === "all" || txn.category === category) &&
          (!q ||
            txn.description.toLowerCase().includes(q) ||
            txn.category.toLowerCase().includes(q) ||
            txn.account.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sort.key === "amount") {
          return (signed(a) - signed(b)) * direction;
        }

        if (sort.key === "description") {
          return a.description.localeCompare(b.description) * direction;
        }

        return a.date.localeCompare(b.date) * direction;
      });
  }, [txns, query, typeFilter, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const income = filtered
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const expenses = filtered
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const allOnPage =
    rows.length > 0 && rows.every((txn) => selected.has(txn.id));


  const filtersActive =
    !!query || typeFilter !== "all" || category !== "all";

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategory("all");
    resetView();
  };

  const toggleSort = (key: SortKey) => {
    setSort((previous) =>
      previous.key === key
        ? {
            key,
            dir: previous.dir === "asc" ? "desc" : "asc",
          }
        : {
            key,
            dir: key === "description" ? "asc" : "desc",
          },
    );
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (checked) next.add(id);
      else next.delete(id);

      return next;
    });
  };

  const togglePage = (checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);

      rows.forEach((txn) => {
        if (checked) next.add(txn.id);
        else next.delete(txn.id);
      });

      return next;
    });
  };

  const save = (values: Omit<Txn, "id">, id?: string) => {
    if (id) {
      setTxns((list) =>
        list.map((txn) => (txn.id === id ? { ...txn, ...values } : txn)),
      );
      toast.success("Transaction updated");
    } else {
      setTxns((list) => [
        { ...values, id: `t${Date.now()}` },
        ...list,
      ]);
      toast.success("Transaction added");
    }

    setForm(null);
  };

  const duplicate = (txn: Txn) => {
    setTxns((list) => [
      { ...txn, id: `t${Date.now()}` },
      ...list,
    ]);
    toast.success("Transaction duplicated");
  };

  const recategorise = (txn: Txn, nextCategory: string) => {
    setTxns((list) =>
      list.map((item) =>
        item.id === txn.id
          ? { ...item, category: nextCategory }
          : item,
      ),
    );

    toast.success(`Moved to ${nextCategory}`);
  };

  const deleteTxns = (ids: string[]) => {
    const removed = txns.filter((txn) => ids.includes(txn.id));

    setTxns((list) => list.filter((txn) => !ids.includes(txn.id)));
    setSelected(new Set());
    setDeleteIds(null);

    toast(
      `${removed.length} transaction${removed.length === 1 ? "" : "s"} deleted`,
      {
        action: {
          label: "Undo",
          onClick: () => {
            setTxns((list) => [...removed, ...list]);
          },
        },
      },
    );
  };

  const exportCsv = () => {
    const header = [
      "Date",
      "Description",
      "Category",
      "Account",
      "Type",
      "Amount",
    ];

    const lines = [
      header,
      ...filtered.map((txn) => [
        txn.date,
        txn.description,
        txn.category,
        txn.account,
        txn.type,
        signed(txn).toFixed(2),
      ]),
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([lines], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions`);
  };

  const menuFor = (txn: Txn): MenuAction[] => [
    {
      label: "Edit",
      icon: Pencil,
      onSelect: () => setForm({ mode: "edit", txn }),
    },
    {
      label: "Duplicate",
      icon: Copy,
      onSelect: () => duplicate(txn),
    },
    {
      label: "Change category",
      icon: Tag,
      submenu: (
        txn.type === "expense" ? expenseCategories : incomeCategories
      ).map((item) => ({
        label: item,
        active: item === txn.category,
        onSelect: () => recategorise(txn, item),
      })),
    },
    {
      label: "Delete",
      icon: Trash2,
      destructive: true,
      separatorBefore: true,
      onSelect: () => setDeleteIds([txn.id]),
    },
  ];

  const sortHead = (
    label: string,
    sortKey: SortKey,
    className = "",
  ) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#14121a]"
      >
        {label}
        <ArrowUpDown
          size={12}
          className={
            sort.key === sortKey ? "text-[#8b5cf6]" : "opacity-40"
          }
        />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        description="Search, filter and manage everything that moves through your accounts."
        actions={
          <>
            <Button
              variant="outline"
              className={outlinePill}
              onClick={exportCsv}
              disabled={!filtered.length}
            >
              <Download size={15} />
              Export CSV
            </Button>

            <Button
              className={darkPill}
              onClick={() => setForm({ mode: "add" })}
            >
              <Plus size={15} />
              Add transaction
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-[13px] text-[#9a96a3]">Income</p>
          <Money
            value={income}
            className="mt-2 block text-2xl font-semibold tracking-tight text-emerald-600"
          />
        </Card>

        <Card>
          <p className="text-[13px] text-[#9a96a3]">Expenses</p>
          <Money
            value={expenses}
            className="mt-2 block text-2xl font-semibold tracking-tight text-[#14121a]"
          />
        </Card>

        <Card>
          <p className="text-[13px] text-[#9a96a3]">Net</p>
          <Money
            value={income - expenses}
            signed
            className="mt-2 block text-2xl font-semibold tracking-tight text-[#14121a]"
          />
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d8696]"
          />

          <Input
            aria-label="Search transactions"
            placeholder="Search transactions..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetView();
            }}
            className="h-10 rounded-full border-transparent bg-white pl-9 text-[13px] shadow-sm"
          />
        </div>

        <Tabs
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value ?? "all");
            resetView();
          }}
        >
          <TabsList className={tabsListClass}>
            <TabsTrigger value="all" className={tabsTriggerClass}>
              All
            </TabsTrigger>
            <TabsTrigger value="income" className={tabsTriggerClass}>
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className={tabsTriggerClass}>
              Expenses
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value ?? "all");
            resetView();
          }}
        >
          <SelectTrigger
            aria-label="Filter by category"
            className="h-10 w-[180px] rounded-full border-transparent bg-white text-[13px] shadow-sm"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {allCategories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-[#6f6a78] transition-colors hover:text-[#14121a]"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#111014] px-4 py-2.5 text-[13px] text-white">
          <span>{selected.size} selected</span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>

            <Button
              size="sm"
              className="h-8 bg-red-600 text-white hover:bg-red-700"
              onClick={() => setDeleteIds([...selected])}
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions found"
          body={
            filtersActive
              ? "Nothing matches these filters. Try widening your search."
              : "Add your first transaction to start tracking."
          }
          action={
            filtersActive ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button
                className={darkPill}
                onClick={() => setForm({ mode: "add" })}
              >
                Add transaction
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(20,16,40,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="text-xs text-[#8e8a97] hover:bg-transparent">
                <TableHead className="w-10 pl-4">
                    <Checkbox
                    aria-label="Select all on this page"
                    checked={allOnPage}
                    onCheckedChange={(value) => togglePage(value === true)}
                    />
                </TableHead>

                {sortHead("Description", "description")}

                <TableHead className="hidden sm:table-cell">
                  Category
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  Account
                </TableHead>

                {sortHead("Date", "date", "hidden md:table-cell")}
                {sortHead("Amount", "amount", "text-right")}

                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((txn) => (
                <TableRow
                  key={txn.id}
                  data-state={
                    selected.has(txn.id) ? "selected" : undefined
                  }
                  className="text-[13px]"
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      aria-label={`Select ${txn.description}`}
                      checked={selected.has(txn.id)}
                      onCheckedChange={(value) =>
                        toggleRow(txn.id, value === true)
                      }
                    />
                  </TableCell>

                  <TableCell className="max-w-[220px] truncate font-medium text-[#14121a]">
                    {txn.description}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-md font-medium",
                        tones[txn.category] ?? "bg-slate-100 text-slate-700",
                      )}
                    >
                      {txn.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden text-[#6f6a78] lg:table-cell">
                    {txn.account}
                  </TableCell>

                  <TableCell className="hidden text-[#6f6a78] md:table-cell">
                    {formatDate(txn.date)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Money
                      value={signed(txn)}
                      signed
                      className={cn(
                        "font-semibold",
                        txn.type === "income"
                          ? "text-emerald-600"
                          : "text-[#14121a]",
                      )}
                    />
                  </TableCell>

                  <TableCell className="pr-3">
                    <ActionMenu
                      label={`Options for ${txn.description}`}
                      actions={menuFor(txn)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-[#f0eef4] px-4 py-3 text-xs text-[#8e8a97]">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft size={15} />
              </Button>

              <span className="px-2 tabular-nums">
                {safePage} / {pageCount}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Next page"
                disabled={safePage === pageCount}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <TransactionDialog
        key={
          form?.mode === "edit"
            ? form.txn.id
            : form?.mode ?? "closed"
        }
        state={form}
        onClose={() => setForm(null)}
        onSave={save}
      />

      <ConfirmDialog
        open={!!deleteIds}
        onOpenChange={(open) => {
          if (!open) setDeleteIds(null);
        }}
        destructive
        title={
          deleteIds?.length === 1
            ? "Delete this transaction?"
            : `Delete ${deleteIds?.length ?? 0} transactions?`
        }
        description="They'll be removed from your history and totals. You can undo right after."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteIds) deleteTxns(deleteIds);
        }}
      />
    </div>
  );
}
