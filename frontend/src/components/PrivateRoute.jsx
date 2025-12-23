import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = localStorage.getItem("token");

  if (!token || !isAuthenticated) return <Navigate to="/views/account/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return <Navigate to="/views/account/login" replace />;
  } catch {
    return <Navigate to="/views/account/login" replace />;
  }

  return children;
};

export default PrivateRoute;
