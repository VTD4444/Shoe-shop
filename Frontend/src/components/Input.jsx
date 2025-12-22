import React from 'react';

const Input = React.forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-text mb-1 uppercase tracking-wide">{label}</label>}
      <input
        ref={ref}
        className={`w-full border-b-2 border-gray-300 bg-transparent py-2 px-1 focus:outline-none focus:border-accent transition-colors
        ${error ? 'border-error' : ''}`}
        {...props}
      />
      {error && <span className="text-xs text-error mt-1">{error.message}</span>}
    </div>
  );
});

export default Input;