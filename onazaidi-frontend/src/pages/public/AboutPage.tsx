import { Container } from "@/components/layout/Container";

export function AboutPage() {
  return (
    <Container className="py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
          About Dennis Yamat
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional Wildlife Guide &amp; Photographer | Serengeti, Tanzania
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* About Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Story Card */}
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">My Story</h2>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Dennis was born in Arusha in the northern part of Tanzania, a
                city close to many national parks. His love and passion for
                wildlife started when he was a young boy as his father was
                working for the Frankfurt Zoological Society in the Serengeti
                National Park at that time.
              </p>

              <p>
                During holidays, Dennis and his brother Derrick would visit
                their dad in the Serengeti. The language of the wild—roars,
                snorts, trumpets, and chirps—with meanings derived over eons
                spoke to Dennis saying: <em>"Here is where you belong."</em>
              </p>

              <p>
                Dennis studied wildlife management at the Mweka College of
                African Wildlife Management before doing extensive volunteer
                work including anti-poaching and community education at Kisampa
                Conservancy.
              </p>

              <p>
                Dennis also ventured to the south of the continent to volunteer
                in South Africa at the renowned Lapalala Wilderness Foundation
                with Wildlife ACT. Here he helped to monitor wildlife
                populations and conduct research. This served to deepen his
                passion for conservation still more.
              </p>

              <p>
                In 2023, Dennis joined the &amp;BEYOND Mwewe Ranger Training
                School, continuing his journey in wildlife conservation and
                guiding. Today, he is based at Serengeti Under Canvas, where he
                shares his passion for the African wilderness with travelers
                from around the world.
              </p>
            </div>
          </div>

          {/* Expertise Card */}
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Expertise &amp; Passion
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ExpertiseItem
                title="Wildlife Photography"
                description="Capturing breathtaking moments in the Serengeti"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                }
              />

              <ExpertiseItem
                title="Conservation"
                description="Anti-poaching and wildlife protection efforts"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                }
              />

              <ExpertiseItem
                title="Professional Guiding"
                description="Expert safari guide in Serengeti National Park"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                }
              />

              <ExpertiseItem
                title="Community Education"
                description="Teaching local communities about wildlife"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                }
              />
            </div>
          </div>

          {/* Gallery Preview */}
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Photography Gallery
            </h2>
            <p className="mb-6 text-gray-600">
              Explore stunning wildlife photographs captured during my journeys
              across the Serengeti. From the Great Migration to intimate
              wildlife portraits, each image tells a story of the African
              wilderness.
            </p>
            <a
              href="/photos"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              View Full Gallery
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-lg bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full ring-4 ring-brand-100">
              <img
                src="/images/yamatDennis.jpg"
                alt="Dennis Yamat"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Dennis Yamat</h3>
            <p className="text-sm text-gray-600 mb-4">
              Wildlife Guide &amp; Photographer
            </p>
            <div className="inline-block rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
              Serengeti Under Canvas
            </div>
          </div>

          {/* Contact Card */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:dennisyamat121@gmail.com"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                dennisyamat121@gmail.com
              </a>
              <a
                href="https://wa.me/255692755937"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +255 692 755 937
              </a>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Follow My Journey
            </h3>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/dennis_yamat/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <svg
                  className="h-5 w-5 text-pink-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  Instagram
                </span>
              </a>

              <a
                href="https://www.youtube.com/@IntoTheWildWithYamat-255"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  YouTube
                </span>
              </a>
            </div>
          </div>

          {/* Education Card */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Education &amp; Training
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <EducationItem text="Mweka College of African Wildlife Management" />
              <EducationItem text="&BEYOND Mwewe Ranger Training School (2023)" />
              <EducationItem text="Lapalala Wilderness Foundation, South Africa" />
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}

function ExpertiseItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function EducationItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="h-5 w-5 flex-shrink-0 text-brand-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{text}</span>
    </li>
  );
}