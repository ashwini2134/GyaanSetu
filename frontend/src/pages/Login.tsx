import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import LampLogin from "../components/auth/LampLogin";

export default function Login() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return <LampLogin />;
}
