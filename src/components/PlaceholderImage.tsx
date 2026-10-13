export default function PlaceholderImage({ className, text = 'Image' }: { className?: string, text?: string }) {
  return (
    <div className={`bg-slate-200 text-slate-400 flex items-center justify-center font-medium ${className || ''}`}>
      {text}
    </div>
  );
}
