import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { authApi } from "../api/authApi";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setErrorGlobal(null);
      try {
        await authApi.login(value);
        const me = await authApi.getMe();
        login(me);
        if (me.role === "admin") {
          navigate("/admin/resumen");
        } else {
          navigate("/");
        }
      } catch (err) {
        setErrorGlobal(handleApiError(err));
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ingresá a tu cuenta de Food Store
          </p>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg">
            {errorGlobal}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (!value.trim() ? "El usuario es obligatorio" : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="ej: admin o tu usuario"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? "La contraseña es obligatoria" : undefined),
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="Contraseña"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="••••••••"
              />
            )}
          </form.Field>

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={!canSubmit}
                loading={isSubmitting}
              >
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          ¿No tenés una cuenta?{" "}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Registrate acá
          </Link>
        </p>
      </Card>
    </div>
  );
};