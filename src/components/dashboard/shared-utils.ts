
export const darkPill =
  "h-10 gap-2 rounded-full bg-[#111014] px-4 text-[13px] font-medium text-white hover:bg-[#2a2830]";

export const outlinePill =
  "h-10 gap-2 rounded-full border-[#e3e3e8] bg-white px-4 text-[13px] font-medium text-[#14121a] hover:bg-[#f7f7f9]";

export const purpleButton =
  "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]";

export const tabsListClass =
  "h-auto rounded-xl bg-white p-1 shadow-[0_1px_2px_rgba(20,16,40,0.04)]";

export const tabsTriggerClass =
  "rounded-lg px-3.5 py-1.5 text-[13px] data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white data-[state=active]:shadow-none";

export const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
