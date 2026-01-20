"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { request } from "@/lib/req";

type Status = "idle" | "loading" | "success" | "error";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<PageShell>Loading confirmation...</PageShell>}>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const code = useMemo(
    () => searchParams.get("access_token")?.trim() ?? "",
    [searchParams]
  );

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Processing the received code...");
  const [retryCount, setRetryCount] = useState(0);

  const confirmCode = useCallback(async () => {
    setStatus("loading");
    setMessage("Validating the code with the server...");

    try {
      await request("/auth/confirm", "POST", { codigo: code });
      setStatus("success");
      setMessage("Code confirmed. You can return to the app.");
    } catch (error) {
      setStatus("error");
      setMessage(
        "We couldn't confirm the code. Try again or request a new link."
      );
    }
  }, [code]);

  useEffect(() => {
    void confirmCode();
  }, [confirmCode, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount((value) => value + 1);
  }, []);

  const isLoading = status === "loading";

  return (
    <PageShell>
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-2">
          <CardTitle>Code confirmation</CardTitle>
          <p className="text-sm text-muted-foreground">
            We extract the <code>codigo</code> parameter from the URL to verify
            your session with the authentication provider.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <p
              className={
                status === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              {message}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
              <span>Processing...</span>
            </div>
          )}

          {status === "error" && code && (
            <Button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full"
            >
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}
