import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  LogOut,
  Folder,
} from "lucide-react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastHost } from "@/components/ui/Toast";
import { Container } from "./Container";
import { useAuthStore } from "@/app/store/authStore";
import { routes } from "@/config/routes";
import { cn } from "@/utils/cn";
import { authApi } from "@/services/api/authApi";

const nav = [
  { to: routes.admin.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: routes.admin.photos, label: "Photos", icon: ImageIcon, end: false },
  { to: routes.admin.albums, label: "Albums", icon: Folder, end: false },
  { to: routes.admin.orders, label: "Orders", icon: ShoppingBag, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
];

export function AdminLayout() {
  const { user, refreshToken, clear } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    clear();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-sage-50">
      <aside className="group relative flex flex-col bg-white border-r border-sage-100 transition-all duration-300 w-16 hover:w-72 shadow-soft">
        <div className="border-b border-sage-100 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-display font-bold text-sm flex-shrink-0">
              O
            </div>
            <div className="font-display text-lg font-bold gradient-text whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
              OnaZaidi
            </div>
          </div>
          <div className="text-xs uppercase tracking-wide text-sage-500 mt-2 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-soft"
                      : "text-sage-600 hover:bg-sage-100 hover:text-sage-900"
                  )
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sage-100 p-3">
          <div className="px-3 py-2 whitespace-nowrap overflow-hidden">
            <div className="text-xs text-sage-500 opacity-0 group-hover:opacity-100 transition-opacity">Signed in as</div>
            <div className="text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity text-sage-700">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-accent-600 hover:bg-accent-50 whitespace-nowrap overflow-hidden transition-all duration-300"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <Container className="py-12">
          <Outlet />
        </Container>
      </main>

      <CartDrawer />
      <ToastHost />
    </div>
  );
}
