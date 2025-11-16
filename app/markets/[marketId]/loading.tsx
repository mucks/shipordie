export default function MarketDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-6 bg-neutral-800 rounded w-32 mb-6 animate-pulse"></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 animate-pulse">
            <div className="h-8 bg-neutral-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-800 rounded w-1/2 mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-neutral-800 rounded"></div>
              <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-800 rounded w-4/6"></div>
            </div>
            <div className="h-2 bg-neutral-800 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-neutral-800 rounded"></div>
              <div className="h-16 bg-neutral-800 rounded"></div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-neutral-800 rounded"></div>
              <div className="h-10 bg-neutral-800 rounded"></div>
              <div className="h-10 bg-neutral-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

