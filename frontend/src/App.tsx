import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AppRouter } from "@/routes/AppRouter";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}