"use client";

import type React from "react";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { request } from "@/lib/req";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => Promise<void> | void;
}

type SubmissionStatus = "success" | "error";

export function RegisterForm({ onSubmit }: RegisterFormProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedEmail = useMemo(() => email.trim(), [email]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (password !== confirmPassword) {
        setStatus("error");
        setStatusMessage("Passwords do not match.");
        return;
      }

      if (password.length < 8) {
        setStatus("error");
        setStatusMessage("Password must be at least 8 characters.");
        return;
      }

      if (!trimmedEmail) {
        setStatus("error");
        setStatusMessage("Enter a valid email.");
        return;
      }

      setIsSubmitting(true);
      setStatus(null);
      setStatusMessage(null);

      try {
        const response = await request("/auth/register", "POST", {
          email: trimmedEmail,
          password,
        });
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setStatusMessage("Could not create the account.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, onSubmit, password, trimmedEmail]
  );

  const statusClass =
    status === "success" ? "text-emerald-500" : "text-destructive";

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="my-email@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="bg-background"
            />
          </div>

          {statusMessage && (
            <p className={`text-sm ${statusClass}`}>{statusMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
