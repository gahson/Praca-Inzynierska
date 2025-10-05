import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/views/account/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/views/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
