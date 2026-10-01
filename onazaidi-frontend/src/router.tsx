import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminRoute } from "@/components/common/AdminRoute";

import { HomePage } from "@/pages/public/HomePage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { PhotosPage } from "@/pages/marketplace/PhotosPage";
import { PhotoDetailPage } from "@/pages/marketplace/PhotoDetailPage";
import { CartPage } from "@/pages/marketplace/CartPage";
import { CheckoutPage } from "@/pages/marketplace/CheckoutPage";
import { PaymentCallbackPage } from "@/pages/marketplace/PaymentCallbackPage";
import { DestinationsPage } from "@/pages/marketplace/DestinationsPage";
import { DestinationDetailPage } from "@/pages/marketplace/DestinationDetailPage";
import { AlbumsPage } from "@/pages/marketplace/AlbumsPage";
import { AlbumDetailPage } from "@/pages/marketplace/AlbumDetailPage";

import { DashboardPage } from "@/pages/customer/DashboardPage";
import { OrdersPage } from "@/pages/customer/OrdersPage";
import { OrderDetailPage } from "@/pages/customer/OrderDetailPage";
import { PurchasesPage } from "@/pages/customer/PurchasesPage";
import { ProfilePage } from "@/pages/customer/ProfilePage";

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminPhotoListPage } from "@/pages/admin/AdminPhotoListPage";
import { AdminPhotoUploadPage } from "@/pages/admin/AdminPhotoUploadPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";
import { AdminPhotoPurchasersPage } from "@/pages/admin/AdminPhotoPurchasersPage";
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
import { AdminAlbumsPage } from "@/pages/admin/AdminAlbumsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/photos", element: <PhotosPage /> },
      { path: "/photos/:slug", element: <PhotoDetailPage /> },
      { path: "/albums", element: <AlbumsPage /> },
      { path: "/albums/:slug", element: <AlbumDetailPage /> },
      { path: "/destinations", element: <DestinationsPage /> },
      { path: "/destinations/:slug", element: <DestinationDetailPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/cart", element: <CartPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/payment/success", element: <PaymentCallbackPage /> },
        ],
      },
      {
        path: "/account",
        element: <CustomerLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "orders/:id", element: <OrderDetailPage /> },
          { path: "purchases", element: <PurchasesPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "photos", element: <AdminPhotoListPage /> },
          { path: "photos/new", element: <AdminPhotoUploadPage /> },
          { path: "photos/:photoId/purchasers", element: <AdminPhotoPurchasersPage /> },
          { path: "albums", element: <AdminAlbumsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/:orderNumber", element: <AdminOrderDetailPage /> },
          { path: "customers", element: <AdminCustomersPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
