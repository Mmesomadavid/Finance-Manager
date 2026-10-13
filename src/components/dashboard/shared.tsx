
import { Fragment, useState, type ReactNode } from "react";
import { Check, EllipsisVertical, type LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { formatMoney } from "./shared-utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

/* ---------------------------------- Money ---------------------------------- */

export const Money = ({
  value,
  className = "",
  signed = false,
}: {
  value: number;
  className?: string;
  signed?: boolean;
}) => {
  const [whole, decimals] = formatMoney(Math.abs(value)).split(".");
  const sign = value < 0 ? "−" : signed ? "+" : "";

  return (
    <span className={`tabular-nums ${className}`}>
      {sign}${whole}
      <span className="opacity-45">.{decimals}</span>
    </span>
  );
};

/* -------------------------------- primitives ------------------------------- */

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,16,40,0.04)] ${className}`}
  >
    {children}
  </section>
);

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-[#14121a]">
        {title}
      </h1>

      {description && (
        <p className="mt-1 text-sm text-[#8e8a97]">{description}</p>
      )}
    </div>

    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

export const Field = ({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-[13px] font-medium">
      {label}
    </Label>

    {children}

    {error ? (
      <p className="text-xs text-destructive">{error}</p>
    ) : hint ? (
      <p className="text-xs text-[#8e8a97]">{hint}</p>
    ) : null}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(20,16,40,0.04)]">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1ecff] text-[#8b5cf6]">
      <Icon size={22} />
    </span>

    <p className="text-sm font-semibold text-[#14121a]">{title}</p>

    <p className="mt-1 max-w-xs text-xs leading-5 text-[#8e8a97]">
      {body}
    </p>

    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ------------------------------- confirm dialog ---------------------------- */

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  requireText?: string;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  requireText,
  onConfirm,
}: ConfirmDialogProps) => {
  const [typed, setTyped] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTyped("");
    }

    onOpenChange(nextOpen);
  };

  const locked =
    Boolean(requireText) && typed.trim() !== requireText;

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireText && (
          <div className="space-y-2">
            <Label
              htmlFor="confirm-text"
              className="text-[13px]"
            >
              Type{" "}
              <span className="font-semibold">
                {requireText}
              </span>{" "}
              to continue
            </Label>

            <Input
              id="confirm-text"
              value={typed}
              onChange={(event) =>
                setTyped(event.target.value)
              }
              autoComplete="off"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={locked}
            onClick={onConfirm}
            className={
              destructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/* -------------------------------- action menu ------------------------------ */

export type MenuAction = {
  label: string;
  icon?: LucideIcon;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
  submenu?: {
    label: string;
    onSelect: () => void;
    active?: boolean;
  }[];
};

export const ActionMenu = ({
  label,
  title,
  actions,
}: {
  label: string;
  title?: string;
  actions: MenuAction[];
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger type="button" aria-label={label} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6f6a78] outline-none transition-colors hover:bg-[#f3f3f6] hover:text-[#14121a] focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40 data-[state=open]:bg-[#f3f3f6]">
      
        <EllipsisVertical size={16} />

    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      className="w-52 rounded-xl p-1.5"
    >
      {title && (
        <DropdownMenuLabel className="text-xs font-medium text-[#8e8a97]">
          {title}
        </DropdownMenuLabel>
      )}

      {actions.map((action) => (
        <Fragment key={action.label}>
          {action.separatorBefore && (
            <DropdownMenuSeparator />
          )}

          {action.submenu ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 rounded-lg text-[13px]">
                {action.icon && (
                  <action.icon size={15} />
                )}

                {action.label}
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="rounded-xl p-1.5">
                {action.submenu.map((sub) => (
                  <DropdownMenuItem
                    key={sub.label}
                    onSelect={sub.onSelect}
                    className="gap-2 rounded-lg text-[13px]"
                  >
                    {sub.label}

                    {sub.active && (
                      <Check
                        size={14}
                        className="ml-auto text-[#8b5cf6]"
                      />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              disabled={action.disabled}
              onSelect={action.onSelect}
              className={cn(
                "gap-2 rounded-lg text-[13px]",
                action.destructive &&
                  "text-red-600 focus:bg-red-50 focus:text-red-600",
              )}
            >
              {action.icon && (
                <action.icon size={15} />
              )}

              {action.label}
            </DropdownMenuItem>
          )}
        </Fragment>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
