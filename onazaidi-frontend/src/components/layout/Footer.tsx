import { Container } from "./Container";
import { env } from "@/config/env";

export function Footer() {
  return (
    <footer className="mt-16 sm:mt-24 border-t border-gray-200 bg-gray-50">
      <Container className="py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="font-display text-lg sm:text-xl font-bold text-brand-700">
              {env.APP_NAME}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Discover Tanzania through professional photography.
            </p>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Explore</h4>
            <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li><a href="/destinations" className="hover:text-gray-900">Destinations</a></li>
              <li><a href="/photos" className="hover:text-gray-900">Photographs</a></li>
              <li><a href="/albums" className="hover:text-gray-900">Albums</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li><a href="/about" className="hover:text-gray-900">About</a></li>
              <li><a href="/contact" className="hover:text-gray-900">Contact</a></li>
              <li><a href="/terms" className="hover:text-gray-900">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Support</h4>
            <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li><a href="mailto:hello@onazaidi.com" className="hover:text-gray-900">hello@onazaidi.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-3 sm:pt-4 text-center text-[10px] sm:text-xs text-gray-500">
          © {new Date().getFullYear()} {env.APP_NAME}. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
