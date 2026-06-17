import { PageLoader, SkeletonGrid } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="px-6 py-12">
      <PageLoader />
      <div className="mx-auto mt-12 max-w-7xl">
        <SkeletonGrid />
      </div>
    </div>
  );
}

