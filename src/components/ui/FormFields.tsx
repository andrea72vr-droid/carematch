import { ComponentProps, forwardRef } from "react";

interface LabelProps extends ComponentProps<"label"> {
  children: React.ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`block text-xs font-semibold uppercase tracking-wider text-neutral-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

interface TextAreaProps extends ComponentProps<"textarea"> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <textarea
          ref={ref}
          id={id}
          className={`min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all ${className}`}
          {...props}
        />
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
