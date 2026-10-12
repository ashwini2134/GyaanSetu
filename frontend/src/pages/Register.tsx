import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import DoorSignup from "../components/auth/DoorSignup";

export default function Register() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return <DoorSignup />;
}
