export function Loading({ text = 'Wird geladen …' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-500">
      <span className="animate-pulse">{text}</span>
    </div>
  );
}

export function ErrorNote({ text }: { text: string }) {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
      {text}
    </div>
  );
}

export function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-md bg-gray-50 border border-dashed border-gray-300 text-gray-500 px-4 py-8 text-center text-sm">
      {text}
    </div>
  );
}
