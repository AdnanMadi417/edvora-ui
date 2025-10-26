import React, { forwardRef } from "react";
import clsx from "clsx";

type InputFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  extra?: string;
  variant?: "auth" | "default";
  state?: "error" | "success" | "default";
  disabled?: boolean;
  type?: string;
  message?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      label,
      placeholder,
      extra = "",
      variant = "default",
      state = "default",
      disabled = false,
      type = "text",
      message,
      onChange,
      ...rest
    },
    ref
  ) => {
    const messageId = `${id}-message`;

    return (
      <div className={clsx("flex flex-col", extra)}>
        <label
          htmlFor={id}
          className={clsx(
            "text-p2 text-text-primary dark:text-white",
            variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
          )}
        >
          {label}
        </label>

        <input
          id={id}
          ref={ref}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          aria-disabled={disabled}
          aria-invalid={state === "error"}
          aria-describedby={message ? messageId : undefined}
          className={clsx(
            "mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-transparent p-3 text-p2 outline-none transition-colors",
            {
              "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:text-white/20":
              disabled,
              "border-red-500 text-red-500 placeholder:text-red-500 dark:border-red-400 dark:text-red-400 dark:placeholder:text-red-400":
                state === "error" && !disabled,
              "border-green-500 text-green-500 placeholder:text-green-500 dark:border-green-400 dark:text-green-400 dark:placeholder:text-green-400":
                state === "success" && !disabled,
              "border-gray-300 dark:border-white/10 dark:text-white":
                state === "default" && !disabled,
            }
          )}
          {...rest}
        />

        {message && (
          <p
            id={messageId}
            className={clsx("mt-1 text-sm", {
              "text-red-500 dark:text-red-400": state === "error",
              "text-gray-500 dark:text-gray-400": state === "default",
              "text-green-500 dark:text-green-400": state === "success",
            })}
          >
            {message}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
