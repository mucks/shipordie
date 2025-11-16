export default function MarketsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-10 bg-neutral-800 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-6 bg-neutral-800 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-neutral-800 rounded w-32 animate-pulse"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-800 rounded w-1/2 mb-6"></div>
            <div className="h-2 bg-neutral-800 rounded mb-2"></div>
            <div className="h-2 bg-neutral-800 rounded w-5/6 mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-neutral-800 rounded flex-1"></div>
              <div className="h-8 bg-neutral-800 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

