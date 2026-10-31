import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-olive" aria-label="Loading" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
