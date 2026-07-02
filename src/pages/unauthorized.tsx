import { useRouter } from "next/router"
import { Button } from "@/modules/shared/ui/shadcn/button"
import {
  Card,
  CardContent,
} from "@/modules/shared/ui/shadcn/card"

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9fb] p-4">
      <Card className="w-full max-w-sm text-center border border-black/5 shadow-md rounded-2xl">
        <CardContent className="p-6 sm:p-10">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Code */}
          <p className="text-xs font-bold tracking-[0.2em] text-red-600 uppercase mb-2">
            403 — Forbidden
          </p>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs mx-auto">
            You don't have permission to view this page. If you think this is a
            mistake, please contact your administrator.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Go Back
              </span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/")}
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                </svg>
                Go Home
              </span>
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}