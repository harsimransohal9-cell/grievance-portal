import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  // Not logged in at all -> send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role trying to access this page -> send to their own dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
}

export default ProtectedRoute;