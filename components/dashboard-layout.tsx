"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/req";
import {
  Home,
  Search,
  Library,
  Settings,
  Users,
  ChevronLeft,
  Moon,
  Sun,
  Upload,
  Palette,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UploadModal } from "@/components/upload-modal";
import { verifyProfile } from "@/lib/verifications";
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Chat", href: "/chat", icon: Sparkles },
  { name: "Search", href: "/search", icon: Search },
  { name: "Library", href: "/library", icon: Library },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const accentColors = [
  { name: "Blue", value: "hsl(221, 83%, 53%)", class: "bg-blue-600" },
  { name: "Green", value: "hsl(142, 76%, 36%)", class: "bg-green-600" },
  { name: "Orange", value: "hsl(24, 95%, 53%)", class: "bg-orange-600" },
  { name: "Purple", value: "hsl(262, 83%, 58%)", class: "bg-purple-600" },
  { name: "Pink", value: "hsl(326, 78%, 56%)", class: "bg-pink-600" },
  { name: "Red", value: "hsl(0, 84%, 60%)", class: "bg-red-600" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [accentColor, setAccentColor] = useState(accentColors[0].value);
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    team: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadUserInfoFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    const savedUserInfo = localStorage.getItem("user_info");
    if (!savedUserInfo) return;
    try {
      const parsed = JSON.parse(savedUserInfo);
      if (parsed?.name || parsed?.team) {
        setUserInfo({
          name: parsed.name ?? "User",
          team: parsed.team ?? "",
        });
      }
    } catch (err) {
      console.error("Failed to parse user_info", err);
    }
  }, []);

  useEffect(() => {
    // Guard against SSR: localStorage is only available in the browser.
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const savedAccentColor = localStorage.getItem("accentColor");
    const savedUserId = localStorage.getItem("user_id");

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    }
    if (savedUserId) {
      setUserId(savedUserId);
    }
    loadUserInfoFromStorage();
    setIsInitialized(true);
  }, [loadUserInfoFromStorage]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("accentColor", accentColor);
    document.documentElement.style.setProperty("--primary", accentColor);
  }, [accentColor, isInitialized]);

  useEffect(() => {
    if (!userId) return;
    const runVerify = async () => {
      await verifyProfile(userId);
      loadUserInfoFromStorage();
    };
    runVerify();
  }, [router, userId, loadUserInfoFromStorage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = useCallback(() => {
    request("/auth/logout", "POST", {}).then(async () => {
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_info");
      router.push("/");
    });
  }, [router]);

  const userInitials =
    (userInfo?.name ?? "User")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="size-8 bg-sidebar-primary rounded-lg flex items-center justify-center p-4">
                  <span className="text-sidebar-primary-foreground font-bold text-lg">
                    K
                  </span>
                </div>
                <span className="text-base font-semibold text-sidebar-foreground">
                  KnowledgeHub AI
                </span>
              </div>
            ) : (
              <div className="size-8 bg-sidebar-primary rounded-lg flex items-center justify-center mx-auto">
                <span className="text-sidebar-primary-foreground font-bold text-lg">
                  K
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "text-sidebar-foreground",
                !sidebarOpen && "mx-auto mt-2"
              )}
            >
              <ChevronLeft
                className={cn(
                  "size-4 transition-transform",
                  !sidebarOpen && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          {sidebarOpen && (
            <div className="p-4 border-t border-sidebar-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground">
                        {userInfo?.name ?? "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userInfo?.team ?? "Team"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>KHAI</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button onClick={handleLogout} className="w-full text-left">
                      Log out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-4 px-6 py-4">
            {/* Global Search */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="size-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Palette className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setAccentColor(color.value)}
                        className={cn(
                          "size-10 rounded-md transition-all hover:scale-110",
                          color.class,
                          accentColor === color.value &&
                            "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                        )}
                        title={color.name}
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* UploadModal Component */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
