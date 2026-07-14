import { cn } from './Button';

const Input = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500 transition-colors",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
