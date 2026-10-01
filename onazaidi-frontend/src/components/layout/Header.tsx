import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";
import { useCartUIStore } from "@/app/store/cartStore";
import { useCart } from "@/services/hooks/useCart";
import { Container } from "./Container";
import { useAuthStore } from "@/app/store/authStore";
import { routes } from "@/config/routes";
import { env } from "@/config/env";
import { cn } from "@/utils/cn";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { data: cart } = useCart();
  const cartCount = cart?.itemCount ?? 0;

  const navItems = [
    { to: routes.destinations, label: "Destinations" },
    { to: routes.photos, label: "Photos" },
    { to: routes.albums, label: "Albums" },
    { to: routes.about, label: "About" },
    { to: routes.contact, label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-sage-100 shadow-soft">
      <Container>
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link to={routes.home} className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-display font-bold text-sm sm:text-lg shadow-glow group-hover:scale-110 transition-transform">
              O
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold gradient-text">
              {env.APP_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-soft"
                      : "text-sage-600 hover:bg-sage-100 hover:text-sage-900"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => useCartUIStore.getState().openDrawer()}
              className="relative p-2 sm:p-3 rounded-full text-sage-600 hover:bg-brand-50 hover:text-brand-600 transition-all duration-300 hover:scale-110"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-accent-500 text-[9px] sm:text-[10px] font-semibold text-white shadow-soft">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated() ? (
              <Link
                to={
                  user?.roles?.includes("ROLE_ADMIN")
                    ? routes.admin.dashboard
                    : routes.account.dashboard
                }
                className="flex items-center gap-2 rounded-full bg-sage-100 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-sage-700 hover:bg-brand-50 hover:text-brand-700 transition-all duration-300 hover:scale-105"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{user?.firstName}</span>
              </Link>
            ) : (
              <Link to={routes.login} className="btn-primary text-xs sm:text-sm px-3 py-2">
                Sign in
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-full text-sage-600 hover:bg-sage-100 transition-all duration-300"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-sage-100 py-4 animate-slide-up">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-sage-700 hover:bg-brand-50 hover:text-brand-700 transition-all duration-300"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
