export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
