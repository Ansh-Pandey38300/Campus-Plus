import { forwardRef } from 'react';

// Reusable accessible input for authentication forms.
const AuthInput = forwardRef(function AuthInput(
  {
    label,
    id,
    type = 'text',
    icon: Icon,
    error,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div className="w-full">
      {/* Label remains visible above the input */}
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {/* Optional icon inside the input */}
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            Icon ? 'pl-11' : 'px-4'
          } ${
            error
              ? 'border-red-400'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>

      {/* Display validation errors next to the field */}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default AuthInput;