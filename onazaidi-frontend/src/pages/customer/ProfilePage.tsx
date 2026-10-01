import { useAuthStore } from "@/app/store/authStore";
import { formatDate } from "@/utils/format";

export function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-600">
        Your account information.
      </p>

      <div className="mt-8 card p-6">
        <dl className="space-y-4 text-sm">
          <Row label="First name" value={user?.firstName} />
          <Row label="Last name" value={user?.lastName} />
          <Row label="Email" value={user?.email} />
          <Row
            label="Roles"
            value={user?.roles.map((r) => r.replace("ROLE_", "")).join(", ")}
          />
        </dl>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Profile editing is disabled in this version. Contact support to make changes.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}
