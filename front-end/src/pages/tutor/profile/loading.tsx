export default function Loading() {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-white to-violet-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
          <p className="mt-4 text-violet-700 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }
  