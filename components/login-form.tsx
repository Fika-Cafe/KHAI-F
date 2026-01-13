"use client";

import type React from "react";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { request } from "@/lib/req";
import { verifyProfile } from "@/lib/verifications";

interface LoginFormProps {
  onSubmit?: (credentials: {
    email: string;
    password: string;
  }) => Promise<void> | void;
  onForgotPassword?: (email: string) => Promise<void> | void;
}

export function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const trimmedEmail = useMemo(() => email.trim(), [email]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      setResetMessage(null);
      setStatusMessage(null);

      if (!trimmedEmail || !password) {
        setStatusMessage("Agrega tus credenciales para continuar.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await request("/auth/login", "POST", {
          email: trimmedEmail,
          password,
        });

        localStorage.setItem("user_id", response.user.id);
        await verifyProfile(router, response.user.id);
        router.push("/dashboard");
      } catch (error) {
        setStatusMessage("No fue posible iniciar sesión.");
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit, password, router, trimmedEmail]
  );

  const handleForgot = useCallback(async () => {
    if (!trimmedEmail) {
      setResetMessage("Ingresa tu correo para recibir el enlace.");
      return;
    }

    try {
      await Promise.resolve(onForgotPassword?.(trimmedEmail));
      setResetMessage(
        "Revisa tu bandeja para restablecer la contraseña o contacta al equipo de soporte."
      );
    } catch (error) {
      setResetMessage("No fue posible generar el enlace. Intenta nuevamente.");
    }
  }, [trimmedEmail, onForgotPassword]);

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleForgot}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="bg-background"
            />
          </div>

          {statusMessage && (
            <p className="text-sm text-destructive">{statusMessage}</p>
          )}
          {resetMessage && (
            <p className="text-sm text-muted-foreground">{resetMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
