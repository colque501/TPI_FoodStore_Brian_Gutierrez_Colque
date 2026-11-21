import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { authApi } from "../api/authApi";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setErrorGlobal(null);
      try {
        await authApi.register(value);
        navigate("/login");
      } catch (err) {
        setErrorGlobal(handleApiError(err));
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Cuenta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Completá tus datos para pedir en Food Store
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
              onChange: ({ value }) =>
                value.length < 3 ? "El usuario debe tener al menos 3 caracteres" : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Nombre de Usuario"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="ej: briang"
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? "Ingresá tu nombre y apellido completo" : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Nombre Completo"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="ej: Brian Gutierrez"
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? "Ingresá un correo electrónico válido"
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                type="email"
                label="Correo Electrónico"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="nombre@ejemplo.com"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8 ? "La clave debe tener mínimo 8 caracteres" : undefined,
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="Contraseña"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="Mínimo 8 caracteres"
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
                Registrarme
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Iniciá sesión acá
          </Link>
        </p>
      </Card>
    </div>
  );
};