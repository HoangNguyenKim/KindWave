import { Heart, LogIn } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/common/ui/button";
import { useAuthStore } from "@/features/authentication/store/auth.store";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Heart className="h-5 w-5 fill-primary" />
          <span className="text-lg">KindWave</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/campaigns" className="text-muted-foreground hover:text-foreground">
            Khám phá
          </Link>
          <Link to="/campaigns/create" className="text-muted-foreground hover:text-foreground">
            Tạo chiến dịch
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                aria-label="Avatar"
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="border-t bg-muted/40">
    <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
      <div className="flex items-center gap-2 font-semibold text-primary">
        <Heart className="h-4 w-4 fill-primary" />
        KindWave
      </div>
      <p className="text-sm text-muted-foreground">
        Spreading kindness through connection.
      </p>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} KindWave. All rights reserved.
      </p>
    </div>
  </footer>
);

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
