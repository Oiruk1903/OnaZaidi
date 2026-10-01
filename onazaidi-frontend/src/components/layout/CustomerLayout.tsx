import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Download,
  User,
  LogOut,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastHost } from "@/components/ui/Toast";
import { Container } from "./Container";
import { useAuthStore } from "@/app/store/authStore";
import { routes } from "@/config/routes";
import { authApi } from "@/services/api/authApi";
import { cn } from "@/utils/cn";

const nav = [
  { to: routes.account.dashboard, label: "Overview", icon: LayoutDashboard },
  { to: routes.account.orders, label: "Orders", icon: ShoppingBag },
  { to: routes.account.purchases, label: "Purchases & Downloads", icon: Download },
  { to: routes.account.profile, label: "Profile", icon: User },
];

export function CustomerLayout() {
  const { user, refreshToken, clear } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const leftThreshold = 50; // pixels from left

      // Sidebar visibility - show on cursor hover (all screen sizes)
      if (e.clientX < leftThreshold) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // best-effort
    }
    clear();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 pt-16 sm:pt-20">
        <Container className="py-6 sm:py-10">
          <section>
            <Outlet />
          </section>
        </Container>
      </main>
      
      {/* Sidebar - Fixed, hidden by default, shows on cursor hover */}
      <aside className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white shadow-lg transition-transform duration-300 z-40 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="mb-4 sm:mb-6">
            <div className="text-[10px] sm:text-xs uppercase text-gray-500">Signed in as</div>
            <div className="font-medium text-gray-900 text-sm sm:text-base">
              {user?.firstName} {user?.lastName ?? ""}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">{user?.email}</div>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === routes.account.dashboard}
                  onClick={() => setIsSidebarVisible(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 sm:gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}

            <button
              onClick={handleLogout}
              className="mt-3 sm:mt-4 flex w-full items-center gap-2 sm:gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      </aside>
      
      <Footer />
      <CartDrawer />
      <ToastHost />
    </div>
  );
}
