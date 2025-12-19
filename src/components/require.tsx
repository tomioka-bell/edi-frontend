import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUser } from "../contexts/UserContext";
import FancyLoader from "../utils/fancy-loader";

type RequireRoleProps = {
  children: React.ReactNode;
  allow: string[];
};

export function RequireRole({ children, allow }: RequireRoleProps) {
  const { user, loading, hasAnyRole } = useUser();

  useEffect(() => {
    if (!loading && user && !hasAnyRole(...allow)) {
      toast.error("You do not have permission to access this page.");
    }
  }, [loading, user, allow, hasAnyRole]);

  if (loading)
    return (
      <FancyLoader label="Please wait a moment...." tip="Loading" />
    );

  if (!user || !hasAnyRole(...allow)) {
    return <Navigate to="/en/login" replace />;
  }

  return <>{children}</>;
}
