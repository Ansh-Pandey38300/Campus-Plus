import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle,
  X,
  ShieldAlert,
} from 'lucide-react';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const resolverRef = useRef(null);

  // Open a confirmation dialog.
  const confirm = useCallback((message, title = 'Confirm action') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setDialog({
        type: 'confirm',
        title,
        message,
      });
    });
  }, []);

  // Open a custom input dialog.
  const prompt = useCallback((
    message,
    defaultValue = '',
    options = {},
  ) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setInputValue(defaultValue);

      setDialog({
        type: 'prompt',
        title: options.title || 'Enter information',
        message,
        inputType: options.inputType || 'text',
        placeholder: options.placeholder || '',
        min: options.min,
        max: options.max,
      });
    });
  }, []);

  // Close dialog and return the user's response.
  const closeDialog = useCallback((result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }

    setDialog(null);
    setInputValue('');
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog(
                dialog.type === 'confirm' ? false : null,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {dialog.type === 'confirm' ? (
                    <ShieldAlert size={22} />
                  ) : (
                    <AlertTriangle size={22} />
                  )}
                </div>

                <h2
                  id="custom-dialog-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {dialog.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  closeDialog(
                    dialog.type === 'confirm' ? false : null,
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>

            </div>

            {/* Body */}
            <form
              onSubmit={(event) => {
                event.preventDefault();

                if (dialog.type === 'prompt') {
                  closeDialog(inputValue);
                } else {
                  closeDialog(true);
                }
              }}
            >
              <div className="px-6 py-6">

                <p className="text-sm leading-6 text-slate-600">
                  {dialog.message}
                </p>

                {dialog.type === 'prompt' && (
                  <input
                    autoFocus
                    type={dialog.inputType}
                    value={inputValue}
                    onChange={(event) =>
                      setInputValue(event.target.value)
                    }
                    placeholder={dialog.placeholder}
                    min={dialog.min}
                    max={dialog.max}
                    className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                )}

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    closeDialog(
                      dialog.type === 'confirm' ? false : null,
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <CheckCircle size={16} />

                  {dialog.type === 'confirm'
                    ? 'Confirm'
                    : 'Submit'}
                </button>

              </div>
            </form>

          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error(
      'useDialog must be used inside DialogProvider.',
    );
  }

  return context;
}