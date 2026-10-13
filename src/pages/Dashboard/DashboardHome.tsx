import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Ellipsis,
  EllipsisVertical,
  Plus,
  Settings,
} from "lucide-react";

/* ----------------------------------------------------------------------------
   Sample data: swap these for your API responses.
---------------------------------------------------------------------------- */

type FlowRow = { month: string; income: number; expenses: number };

const flow: FlowRow[] = [
  { month: "Jan", income: 10800, expenses: 7200 },
  { month: "Feb", income: 14200, expenses: 13600 },
  { month: "Mar", income: 10100, expenses: 14400 },
  { month: "Apr", income: 14800, expenses: 12000 },
  { month: "May", income: 19800, expenses: 19200 },
  { month: "Jun", income: 12600, expenses: 6400 },
  { month: "Jul", income: 16200, expenses: 15800 },
  { month: "Aug", income: 14400, expenses: 9000 },
  { month: "Sep", income: 12200, expenses: 14000 },
];

/** Expenses are negative so the bar chart can mirror them below the zero line. */
const barData = flow.map((row) => ({ ...row, expenses: -row.expenses }));
const netFlow = flow.reduce((sum, row) => sum + row.income - row.expenses, 0);

const accounts = [
  { id: "usd", name: "USD Account", brand: "Visa", last4: "1990", balance: 28390.2 },
  { id: "everyday", name: "Everyday Account", brand: "Mastercard", last4: "8742", balance: 8420.5 },
  { id: "savings", name: "Savings Account", brand: "Verve", last4: "3361", balance: 3250 },
];

const stats = [
  { label: "Monthly Income", value: 78821.88, change: "+1.5%" },
  { label: "Monthly Expenses", value: 16325.23, change: "+1.5%" },
  { label: "Monthly Savings", value: 11235.14, change: "+1.5%" },
];

const monthlySpend = 2845.5;

const breakdown = [
  { label: "Subscriptions", pct: 48.6, a: "#f7bd74", b: "#fde2bd" },
  { label: "Groceries", pct: 30.2, a: "#bba6fb", b: "#e4dafd" },
  { label: "Transport", pct: 21.2, a: "#7fdcf2", b: "#c5f0fa" },
];

const payments = [
  { id: "netflix", name: "Netflix Subscription", date: "Tue, 13 October 10:30 AM", category: "Streaming", amount: "$15.99", initial: "N", bg: "#fde4c8", fg: "#b45309" },
  { id: "figma", name: "Figma Membership", date: "Wed, 14 October 9:00 AM", category: "Professional", amount: "$24.00", initial: "F", bg: "#e6defc", fg: "#6d28d9" },
  { id: "internet", name: "Internet Subscription", date: "Fri, 16 October 11:00 AM", category: "Utilities", amount: "$49.00", initial: "I", bg: "#d3effa", fg: "#0e7490" },
];

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */

const hatch = (a: string, b: string) =>
  `repeating-linear-gradient(135deg, ${a} 0 3px, ${b} 3px 7px)`;

const formatAmount = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatAxis = (value: number) =>
  value === 0 ? "$0" : `$${Math.abs(value) / 1000}k`;

const useCountUp = (target: number) => {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1,
      ease: "easeOut",
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [target, reduceMotion]);

  return value;
};

/** "$78,821" in dark ink with ".88" faded, like the reference. */
const Money = ({ value, className = "" }: { value: number; className?: string }) => {
  const [whole, decimals] = formatAmount(value).split(".");
  return (
    <span className={`tabular-nums ${className}`}>
      ${whole}
      <span className="text-[#b6b2bf]">.{decimals}</span>
    </span>
  );
};

const AnimatedMoney = ({ value, className }: { value: number; className?: string }) => (
  <Money value={useCountUp(value)} className={className} />
);

/* ----------------------------------------------------------------------------
   Small building blocks
---------------------------------------------------------------------------- */

const Card = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,16,40,0.04)] ${className}`}
  >
    {children}
  </motion.section>
);

const MoreButton = ({ label }: { label: string }) => (
  <button
    type="button"
    aria-label={label}
    className="rounded-lg p-1 text-[#6f6a78] transition-colors hover:bg-[#f3f3f6] hover:text-[#14121a]"
  >
    <EllipsisVertical size={16} />
  </button>
);

const Badge = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-[#d9f7ee] px-1.5 py-1 text-[10px] font-semibold leading-none text-[#0f9d77]">
    {children}
  </span>
);

/* ----------------------------------------------------------------------------
   Account switcher (the "··· 1990" pill)
---------------------------------------------------------------------------- */

const AccountSwitcher = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = accounts.find((a) => a.id === value) ?? accounts[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full bg-white pl-1.5 pr-3 text-sm text-[#14121a] shadow-[0_1px_2px_rgba(20,16,40,0.04)] transition-shadow hover:shadow-md"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ece6fd] text-[#7c4ff0]">
          <CreditCard size={12} />
        </span>
        <span className="tabular-nums tracking-wide text-[#4d4856]">··· {current.last4}</span>
        <ChevronDown
          size={14}
          className={`text-[#6f6a78] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-40 mt-2 w-64 origin-top-left rounded-2xl bg-white p-1.5 shadow-xl shadow-black/10 ring-1 ring-black/5"
          >
            {accounts.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={account.id === value}
                  onClick={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f6f3ff]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[#14121a]">
                      {account.name}
                    </span>
                    <span className="block text-[11px] text-[#8e8a97]">
                      {account.brand} ···· {account.last4}
                    </span>
                  </span>
                  {account.id === value && <Check size={15} className="text-[#7c4ff0]" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ----------------------------------------------------------------------------
   Credit-history style chart
---------------------------------------------------------------------------- */

type PillProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  opacity?: number;
  payload?: { month?: string };
};

/** A fully rounded bar. Handles both positive and negative heights. */
const Pill = ({ x = 0, y = 0, width = 0, height = 0, fill, opacity = 1 }: PillProps) => {
  const h = Math.abs(height);
  if (!h || !width) return null;
  const top = height < 0 ? y + height : y;
  const r = Math.min(width, h) / 2;
  return (
    <rect
      x={x}
      y={top}
      width={width}
      height={h}
      rx={r}
      ry={r}
      fill={fill}
      opacity={opacity}
      style={{ transition: "opacity 150ms" }}
    />
  );
};

const DashedCursor = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) => (
  <line
    x1={x + width / 2}
    x2={x + width / 2}
    y1={y}
    y2={y + height}
    stroke="#8b5cf6"
    strokeDasharray="3 3"
  />
);

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FlowRow }>;
}) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-xl bg-white px-3 py-2.5 shadow-xl shadow-black/10 ring-1 ring-black/5">
      <p className="text-[13px] font-semibold tabular-nums text-[#14121a]">
        {Math.abs(row.income).toLocaleString("en-US")}
      </p>
      <p className="mb-2 mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8e8a97]">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: hatch("#d3c8fa", "#efeafd") }} />
        Income
      </p>
      <p className="text-[13px] font-semibold tabular-nums text-[#14121a]">
        {Math.abs(row.expenses).toLocaleString("en-US")}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8e8a97]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
        Expenses
      </p>
    </div>
  );
};

const CashFlowChart = () => {
  const [view, setView] = useState<"bar" | "line">("bar");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeMonth = activeIndex === null ? null : flow[activeIndex]?.month;

  const pill = (fill: string) => (props: unknown) => {
    const p = props as PillProps;
    const dimmed = activeMonth && p.payload?.month !== activeMonth;
    return <Pill {...p} fill={fill} opacity={dimmed ? 0.4 : 1} />;
  };

  const axisProps = {
    tickLine: false,
    axisLine: false,
    tick: { fontSize: 11, fill: "#8e8a97" },
  } as const;

  return (
    <Card className="flex h-full flex-col" delay={0.05}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-[#9a96a3]">Net cash flow</p>
          <div className="mt-1 flex items-center gap-2">
            <AnimatedMoney
              value={netFlow}
              className="text-[28px] font-semibold tracking-tight text-[#14121a]"
            />
            <Badge>+1.5%</Badge>
          </div>
        </div>

        <div role="tablist" aria-label="Chart type" className="flex rounded-xl bg-[#f3f3f6] p-1">
          {(
            [
              { id: "bar", label: "Bar chart", icon: ChartColumn },
              { id: "line", label: "Line chart", icon: ChartLine },
            ] as const
          ).map((option) => {
            const selected = view === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={option.label}
                onClick={() => setView(option.id)}
                className={`flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-all ${
                  selected
                    ? "bg-white text-[#14121a] shadow-sm"
                    : "text-[#8e8a97] hover:text-[#14121a]"
                }`}
              >
                <option.icon size={14} />
                {selected && <span>{option.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-4 text-xs text-[#6f6a78]">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: hatch("#d3c8fa", "#efeafd") }}
          />
          Income
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
          Expenses
        </span>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-2 h-[240px] w-full flex-1"
      >
        <ResponsiveContainer width="100%" height="100%">
          {view === "bar" ? (
            <BarChart
              data={barData}
              stackOffset="sign"
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              barCategoryGap="18%"
              onMouseMove={(state: { activeTooltipIndex?: number | string | null }) => {
                const index = Number(state?.activeTooltipIndex);
                setActiveIndex(Number.isNaN(index) ? null : index);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <pattern
                  id="incomeHatch"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                  patternTransform="rotate(45)"
                >
                  <rect width="8" height="8" fill="#f3effe" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#ddd3fb" strokeWidth="3.5" />
                </pattern>
              </defs>

              <CartesianGrid stroke="#eeeaf3" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" dy={8} {...axisProps} />
              <YAxis
                width={42}
                domain={[-20000, 20000]}
                ticks={[-20000, -10000, 0, 10000, 20000]}
                tickFormatter={formatAxis}
                {...axisProps}
              />
              <ReferenceLine y={0} stroke="#8b5cf6" strokeDasharray="4 4" />
              <Tooltip
                cursor={<DashedCursor />}
                content={<ChartTooltip />}
                allowEscapeViewBox={{ x: false, y: true }}
              />

              <Bar dataKey="income" stackId="flow" maxBarSize={40} shape={pill("url(#incomeHatch)")} />
              <Bar dataKey="expenses" stackId="flow" maxBarSize={40} shape={pill("#8b5cf6")} />
            </BarChart>
          ) : (
            <LineChart data={flow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eeeaf3" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" dy={8} {...axisProps} />
              <YAxis
                width={42}
                domain={[0, 20000]}
                ticks={[0, 5000, 10000, 15000, 20000]}
                tickFormatter={formatAxis}
                {...axisProps}
              />
              <Tooltip
                cursor={{ stroke: "#8b5cf6", strokeDasharray: "3 3" }}
                content={<ChartTooltip />}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#c9bafb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
};

/* ----------------------------------------------------------------------------
   Yellow debit card with a gentle 3D tilt
---------------------------------------------------------------------------- */

const DebitCard = ({ balance }: { balance: number }) => {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 220, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 20 });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 16);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 800 }} className="shrink-0 self-end">
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY }}
        className="relative aspect-[4/5] w-[132px] overflow-hidden rounded-2xl bg-[#f2e847] text-[#1b1a14] shadow-lg shadow-yellow-300/40 sm:w-[148px]"
      >
        <svg
          viewBox="0 0 120 150"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-8 112 C 18 62, 58 64, 50 102 C 44 130, 12 124, 32 98 C 58 66, 98 76, 92 114 C 90 136, 118 128, 136 84"
            stroke="#f7f29a"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative flex h-full flex-col justify-between p-3">
          <div>
            <p className="text-right text-[9px] font-semibold">Debit Card</p>
            <p className="mt-3 text-[9px] font-medium tracking-[0.18em]">
              •••• •••• 1990
            </p>
          </div>

          <div>
            <p className="text-[15px] font-bold tabular-nums tracking-tight">
              ${formatAmount(balance)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[8px] font-medium">
              <span>Ada Okafor</span>
              <span>12/05</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ----------------------------------------------------------------------------
   Page
---------------------------------------------------------------------------- */

export default function DashboardHome() {
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [selectedPayment, setSelectedPayment] = useState(payments[1].id);
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];

  return (
    <div className="space-y-5">
      {/* Title + controls */}
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[#14121a]">
          Overview
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AccountSwitcher value={accountId} onChange={setAccountId} />

            <button
              type="button"
              aria-label="Add account"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dcdce2] text-[#4d4856] transition-colors hover:bg-white"
            >
              <Plus size={15} />
            </button>

            <span className="mx-1 h-5 w-px bg-[#dcdce2]" />

            <button
              type="button"
              aria-label="More account actions"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-md shadow-purple-300/50 transition-colors hover:bg-[#7c3aed]"
            >
              <Ellipsis size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full border border-[#e3e3e8] bg-white px-4 text-[13px] font-medium text-[#14121a] transition-colors hover:bg-[#f7f7f9]"
            >
              <Settings size={15} />
              Manage Balance
            </button>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full bg-[#111014] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2a2830]"
            >
              <Plus size={15} />
              New Payment
            </button>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Connected account + expense breakdown */}
        <div className="grid gap-4 md:grid-cols-2 xl:col-start-1 xl:row-start-1 xl:grid-cols-1">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#14121a]">Connected Account</h2>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-[#6f6a78] transition-colors hover:text-[#14121a]"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="rounded-xl bg-[#f6f6f9] p-1.5">
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-xs font-medium text-[#4d4856]">{account.name}</span>
                <MoreButton label="Account options" />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 rounded-lg bg-[#eeeef3] px-3 py-3"
                >
                  <div className="flex h-11 w-9 shrink-0 flex-col justify-between rounded-md bg-gradient-to-br from-[#4f2fd0] to-[#7c5cf0] p-1.5">
                    <span className="h-0.5 w-3 rounded-full bg-white/60" />
                    <span className="h-0.5 w-5 rounded-full bg-white/40" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#14121a]">{account.brand}</p>
                    <p className="mt-0.5 text-[10px] tracking-wider text-[#8e8a97]">
                      •••• •••• {account.last4}
                    </p>
                  </div>

                  <AnimatedMoney
                    value={account.balance}
                    className="text-base font-semibold tracking-tight text-[#14121a]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>

          <Card delay={0.1}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#14121a]">Expense Breakdown</h2>
              <MoreButton label="Expense breakdown options" />
            </div>

            <div className="flex gap-2">
              {breakdown.map((item, index) => (
                <div
                  key={item.label}
                  style={{ flexGrow: item.pct, flexBasis: 0, minWidth: 64 }}
                >
                  <div className="border-l border-[#e6e4eb] pl-2">
                    <p className="truncate text-[11px] text-[#8e8a97]">{item.label}</p>
                    <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#14121a]">
                      {item.pct}%
                    </p>
                  </div>

                  <motion.div
                    title={`${item.label}: $${formatAmount((monthlySpend * item.pct) / 100)}`}
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.25 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.04 }}
                    style={{ background: hatch(item.a, item.b), originX: 0 }}
                    className="mt-3 h-11 rounded-full"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div className="xl:col-span-2 xl:col-start-2 xl:row-start-1">
          <CashFlowChart />
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3 xl:col-span-2 xl:col-start-1 xl:row-start-2">
          {stats.map((stat, index) => (
            <Card key={stat.label} delay={0.15 + index * 0.05}>
              <div className="flex items-start justify-between">
                <p className="text-[13px] text-[#9a96a3]">{stat.label}</p>
                <MoreButton label={`${stat.label} options`} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <AnimatedMoney
                  value={stat.value}
                  className="text-2xl font-semibold tracking-tight text-[#14121a]"
                />
                <Badge>{stat.change}</Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* My cards */}
        <Card
          delay={0.2}
          className="flex flex-col xl:col-start-3 xl:row-span-2 xl:row-start-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#14121a]">My Cards</h2>
            <MoreButton label="Card options" />
          </div>

          <div className="mt-4 flex flex-1 gap-4">
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
              <div>
                <p className="text-xl font-semibold tracking-tight text-[#14121a]">
                  3 Cards Active
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[#9a96a3]">
                  Freeze, limit or replace any card instantly.
                </p>
              </div>

              <div>
                <p className="mb-3 text-[11px] text-[#8e8a97]">
                  Check card availability{" "}
                  <a href="#" className="font-medium text-[#14121a] underline underline-offset-2">
                    here
                  </a>
                </p>
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2fd0aa] text-xs font-semibold text-[#063d31] transition-colors hover:bg-[#25bc99]"
                >
                  <Plus size={15} />
                  Add New Card
                </button>
              </div>
            </div>

            <DebitCard balance={14569} />
          </div>
        </Card>

        {/* Upcoming payments */}
        <Card delay={0.25} className="xl:col-span-2 xl:col-start-1 xl:row-start-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#14121a]">Upcoming Payment</h2>
            <button
              type="button"
              className="h-8 rounded-full bg-[#111014] px-4 text-xs font-medium text-white transition-colors hover:bg-[#2a2830]"
            >
              View All
            </button>
          </div>

          <div role="listbox" aria-label="Upcoming payments" className="space-y-1">
            {payments.map((payment) => {
              const selected = selectedPayment === payment.id;
              return (
                <button
                  key={payment.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setSelectedPayment(payment.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    selected ? "bg-[#f1ecff]" : "hover:bg-[#f7f6fa]"
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: payment.bg, color: payment.fg }}
                  >
                    {payment.initial}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#14121a]">
                    {payment.name}
                  </span>
                  <span className="hidden w-52 text-xs text-[#4d4856] md:block">
                    {payment.date}
                  </span>
                  <span className="hidden w-28 text-xs font-medium text-[#14121a] sm:block">
                    {payment.category}
                  </span>
                  <span className="w-16 text-right text-[13px] font-semibold tabular-nums text-[#14121a]">
                    {payment.amount}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}