export const routes = {
  home: "/",
  about: "/about",
  contact: "/contact",
  terms: "/terms",

  photos: "/photos",
  photoDetail: (slug: string) => `/photos/${slug}`,
  albums: "/albums",
  albumDetail: (slug: string) => `/albums/${slug}`,
  destinations: "/destinations",
  destinationDetail: (slug: string) => `/destinations/${slug}`,

  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  cart: "/cart",
  checkout: "/checkout",
  paymentSuccess: "/payment/success",
  paymentFailed: "/payment/failed",

  account: {
    dashboard: "/account",
    orders: "/account/orders",
    orderDetail: (id: string) => `/account/orders/${id}`,
    purchases: "/account/purchases",
    downloads: "/account/downloads",
    profile: "/account/profile",
  },

  admin: {
    dashboard: "/admin",
    photos: "/admin/photos",
    photoNew: "/admin/photos/new",
    photoEdit: (id: string) => `/admin/photos/${id}/edit`,
    albums: "/admin/albums",
    destinations: "/admin/destinations",
    experiences: "/admin/experiences",
    categories: "/admin/categories",
    orders: "/admin/orders",
    orderDetail: (num: string) => `/admin/orders/${num}`,
    payments: "/admin/payments",
    customers: "/admin/customers",
  },
} as const;
