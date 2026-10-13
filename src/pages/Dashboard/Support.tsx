// import { useEffect, useMemo, useState, type FormEvent } from "react";
// import { Copy, LifeBuoy, Mail, MessageCircle, Plus, Search, X } from "lucide-react";
// import { toast } from "sonner";

// import {
//   ActionMenu,
//   Card,
//   ConfirmDialog,
//   EmptyState,
//   Field,
//   PageHeader,
//   darkPill,
//   purpleButton,
//   type MenuAction,
// } from "../../components/dashboard/shared";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "../../components/ui/accordion";
// import { Badge } from "../../components/ui/badge";
// import { Button } from "../../components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../../components/ui/dialog";
// import { Input } from "../../components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
// import { Textarea } from "../../components/ui/textarea";

// /* ---------------------------------- data ----------------------------------- */

// const faqCategories = ["All", "Accounts", "Payments", "Security", "Budgets"];

// const faqs = [
//   { id: "f1", category: "Accounts", q: "How do I connect a new bank account or card?", a: "Open Accounts and choose Connect account. Pick the type and network, enter the last four digits and your current balance, and it appears in your totals straight away." },
//   { id: "f2", category: "Accounts", q: "Can I freeze a card if I lose it?", a: "Yes. Open the three-dot menu on the card in Accounts and choose Freeze. Payments are blocked immediately, and you can unfreeze it any time." },
//   { id: "f3", category: "Payments", q: "Why is my upcoming payment showing the wrong date?", a: "Dates follow the billing day set by the merchant. If it looks off, edit the transaction and correct the date. Future reminders will follow the new schedule." },
//   { id: "f4", category: "Payments", q: "How do I export my transactions?", a: "Go to Transactions, apply any filters you need, and choose Export CSV. The file contains exactly the rows currently shown." },
//   { id: "f5", category: "Security", q: "How do I change my passcode?", a: "Open Settings, then Security, then Change next to Passcode. You'll need your current passcode, and we'll reject easy-to-guess ones like 123456." },
//   { id: "f6", category: "Security", q: "What happens if I sign out of all devices?", a: "Every other signed-in device is logged out immediately. You stay signed in on the one you're using." },
//   { id: "f7", category: "Budgets", q: "How are budget alerts calculated?", a: "We compare what you've spent this month to your limit. You're warned when you reach your chosen alert level, and again if your current pace would take you over by month end." },
//   { id: "f8", category: "Budgets", q: "Can I pause a budget without deleting it?", a: "Yes. Choose Pause tracking from the budget's menu. It stays on the page but is left out of your totals and alerts until you resume it." },
// ];

// type Ticket = { id: string; subject: string; status: "open" | "resolved"; updated: string };

// const initialTickets: Ticket[] = [
//   { id: "TCK-2041", subject: "Card payment declined at checkout", status: "open", updated: "2 hours ago" },
//   { id: "TCK-2037", subject: "Update my phone number", status: "resolved", updated: "Oct 8" },
// ];

// const topics = ["Account & sign-in", "Payments", "Cards", "Budgets", "Billing", "Something else"];

// /* ----------------------------- contact dialog ------------------------------ */

// const ContactDialog = ({
//   open,
//   onOpenChange,
//   onSubmit,
//   onPickFaq,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (subject: string) => void;
//   onPickFaq: (id: string) => void;
// }) => {
//   const [topic, setTopic] = useState(topics[0]);
//   const [subject, setSubject] = useState("");
//   const [message, setMessage] = useState("");
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (open) {
//       setTopic(topics[0]);
//       setSubject("");
//       setMessage("");
//       setErrors({});
//     }
//   }, [open]);

//   /* As they type a subject, surface answers that might save them the wait. */
//   const related = useMemo(() => {
//     const words = subject.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
//     if (!words.length) return [];
//     return faqs.filter((f) => words.some((w) => f.q.toLowerCase().includes(w))).slice(0, 2);
//   }, [subject]);

//   const submit = (event: FormEvent) => {
//     event.preventDefault();
//     const next: Record<string, string> = {};
//     if (subject.trim().length < 4) next.subject = "Give your request a short title.";
//     if (message.trim().length < 10) next.message = "Tell us a little more so we can help.";
//     setErrors(next);
//     if (Object.keys(next).length) return;
//     onSubmit(subject.trim());
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="rounded-2xl sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Contact support</DialogTitle>
//           <DialogDescription>We usually reply within a couple of hours.</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={submit} className="space-y-4">
//           <Field label="Topic">
//             <Select value={topic} onValueChange={setTopic}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 {topics.map((t) => (
//                   <SelectItem key={t} value={t}>{t}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </Field>

//           <Field label="Subject" htmlFor="ticket-subject" error={errors.subject}>
//             <Input
//               id="ticket-subject"
//               autoFocus
//               placeholder="e.g. My card was declined"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//             />
//           </Field>

//           {related.length > 0 && (
//             <div className="rounded-xl bg-[#f6f3ff] p-3">
//               <p className="mb-1.5 text-xs font-medium text-[#5b3fb5]">These answers might help</p>
//               <ul className="space-y-1">
//                 {related.map((f) => (
//                   <li key={f.id}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         onOpenChange(false);
//                         onPickFaq(f.id);
//                       }}
//                       className="text-left text-xs text-[#14121a] underline-offset-2 hover:underline"
//                     >
//                       {f.q}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <Field label="How can we help?" htmlFor="ticket-message" error={errors.message} hint={`${message.length}/500`}>
//             <Textarea
//               id="ticket-message"
//               rows={5}
//               maxLength={500}
//               placeholder="Include anything that would help us look into it."
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//             />
//           </Field>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//             <Button type="submit" className={purpleButton}>Send request</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// /* ---------------------------------- page ----------------------------------- */

// export default function DashboardSupport() {
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("All");
//   const [openFaq, setOpenFaq] = useState("");
//   const [contactOpen, setContactOpen] = useState(false);
//   const [tickets, setTickets] = useState(initialTickets);
//   const [closeId, setCloseId] = useState<string | null>(null);

//   const results = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return faqs.filter(
//       (f) =>
//         (category === "All" || f.category === category) &&
//         (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
//     );
//   }, [query, category]);

//   const jumpToFaq = (id: string) => {
//     setQuery("");
//     setCategory("All");
//     setOpenFaq(id);
//     window.setTimeout(() => document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
//   };

//   const createTicket = (subject: string) => {
//     const id = `TCK-${2042 + tickets.length}`;
//     setTickets((list) => [{ id, subject, status: "open", updated: "Just now" }, ...list]);
//     toast.success(`Request ${id} sent. We'll email you when we reply.`);
//   };

//   const menuFor = (t: Ticket): MenuAction[] => [
//     {
//       label: "Copy ticket ID",
//       icon: Copy,
//       onSelect: () => {
//         navigator.clipboard?.writeText(t.id);
//         toast.success(`${t.id} copied`);
//       },
//     },
//     { label: "Close ticket", icon: X, disabled: t.status === "resolved", separatorBefore: true, onSelect: () => setCloseId(t.id) },
//   ];

//   const closing = tickets.find((t) => t.id === closeId);

//   return (
//     <div className="space-y-5">
//       <PageHeader
//         title="Help & Support"
//         description="Find an answer fast, or talk to a real person."
//         actions={
//           <Button className={darkPill} onClick={() => setContactOpen(true)}>
//             <Plus size={15} /> New request
//           </Button>
//         }
//       />

//       {/* Quick contact */}
//       <div className="grid gap-4 sm:grid-cols-3">
//         <button
//           type="button"
//           onClick={() => setContactOpen(true)}
//           className="rounded-2xl bg-white p-5 text-left shadow-[0_1px_2px_rgba(20,16,40,0.04)] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40"
//         >
//           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1ecff] text-[#8b5cf6]"><MessageCircle size={19} /></span>
//           <p className="mt-4 text-sm font-semibold text-[#14121a]">Message us</p>
//           <p className="mt-1 text-xs text-[#8e8a97]">Start a request. Replies in about 2 hours.</p>
//         </button>

//         <a
//           href="mailto:support@expenseflow.app"
//           className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,16,40,0.04)] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40"
//         >
//           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Mail size={19} /></span>
//           <p className="mt-4 text-sm font-semibold text-[#14121a]">Email</p>
//           <p className="mt-1 text-xs text-[#8e8a97]">support@expenseflow.app</p>
//         </a>

//         <Card>
//           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><LifeBuoy size={19} /></span>
//           <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#14121a]">
//             System status
//             <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
//             </span>
//           </p>
//           <p className="mt-1 text-xs text-[#8e8a97]">All services are running normally.</p>
//         </Card>
//       </div>

//       <div className="grid gap-5 lg:grid-cols-3">
//         {/* FAQ */}
//         <div className="space-y-4 lg:col-span-2">
//           <div className="relative">
//             <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8d8696]" />
//             <Input
//               aria-label="Search help articles"
//               placeholder="Search for answers..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="h-11 rounded-full border-transparent bg-white pl-10 text-sm shadow-sm"
//             />
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {faqCategories.map((c) => (
//               <button
//                 key={c}
//                 type="button"
//                 onClick={() => setCategory(c)}
//                 aria-pressed={category === c}
//                 className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
//                   category === c ? "bg-[#8b5cf6] text-white" : "bg-white text-[#6f6a78] hover:text-[#14121a]"
//                 }`}
//               >
//                 {c}
//               </button>
//             ))}
//           </div>

//           {results.length === 0 ? (
//             <EmptyState
//               icon={Search}
//               title="No answers found"
//               body="Try different words, or send us your question and we'll get back to you."
//               action={<Button className={darkPill} onClick={() => setContactOpen(true)}>Contact support</Button>}
//             />
//           ) : (
//             <Card className="py-2">
//               <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq}>
//                 {results.map((f) => (
//                   <AccordionItem key={f.id} value={f.id} id={`faq-${f.id}`} className="border-[#f0eef4]">
//                     <AccordionTrigger className="text-left text-sm font-medium text-[#14121a] hover:no-underline">
//                       {f.q}
//                     </AccordionTrigger>
//                     <AccordionContent className="text-sm leading-6 text-[#6f6a78]">{f.a}</AccordionContent>
//                   </AccordionItem>
//                 ))}
//               </Accordion>
//             </Card>
//           )}
//         </div>

//         {/* Tickets */}
//         <Card className="self-start">
//           <h2 className="text-sm font-semibold text-[#14121a]">Your requests</h2>

//           {tickets.length === 0 ? (
//             <p className="mt-3 text-xs text-[#8e8a97]">You haven't sent any requests yet.</p>
//           ) : (
//             <ul className="mt-3 divide-y divide-[#f0eef4]">
//               {tickets.map((t) => (
//                 <li key={t.id} className="flex items-start gap-2 py-3">
//                   <div className="min-w-0 flex-1">
//                     <p className="truncate text-[13px] font-medium text-[#14121a]">{t.subject}</p>
//                     <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#8e8a97]">
//                       <Badge
//                         variant="secondary"
//                         className={`rounded-md text-[10px] font-semibold ${
//                           t.status === "open" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
//                         }`}
//                       >
//                         {t.status === "open" ? "Open" : "Resolved"}
//                       </Badge>
//                       <span>{t.id} · {t.updated}</span>
//                     </div>
//                   </div>
//                   <ActionMenu label={`Options for ${t.id}`} title={t.id} actions={menuFor(t)} />
//                 </li>
//               ))}
//             </ul>
//           )}
//         </Card>
//       </div>

//       <ContactDialog
//         open={contactOpen}
//         onOpenChange={setContactOpen}
//         onSubmit={createTicket}
//         onPickFaq={jumpToFaq}
//       />

//       <ConfirmDialog
//         open={!!closeId}
//         onOpenChange={(open) => !open && setCloseId(null)}
//         title={`Close ${closing?.id ?? "ticket"}?`}
//         description="We'll mark this request as resolved. You can always open a new one if the problem comes back."
//         confirmLabel="Close ticket"
//         onConfirm={() => {
//           setTickets((list) => list.map((t) => (t.id === closeId ? { ...t, status: "resolved", updated: "Just now" } : t)));
//           toast.success("Ticket closed");
//         }}
//       />
//     </div>
//   );
// }