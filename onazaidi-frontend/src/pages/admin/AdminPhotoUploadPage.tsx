import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Upload } from "lucide-react";
import { adminApi } from "@/services/api/adminApi";
import { useDestinations } from "@/services/hooks/useDestinations";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { routes } from "@/config/routes";

export function AdminPhotoUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { data: destinations } = useDestinations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [destinationId, setDestinationId] = useState("");
  const [albumId, setAlbumId] = useState(searchParams.get("albumId") || "");
  const [categoryId, setCategoryId] = useState("");
  const [experienceId, setExperienceId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch albums, categories, experiences
  const { data: albums } = useQuery({
  queryKey: ["admin-albums"],
  queryFn: adminApi.listAlbums,
});

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch('/api/v1/categories');
      const data = await response.json();
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: experiences } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const response = await fetch('/api/v1/experiences');
      const data = await response.json();
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file");
      return;
    }
    setSubmitting(true);
    try {
      const photo = await adminApi.uploadPhoto(file, {
        title: title.trim() || "Untitled",
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        currency: currency || undefined,
        destinationId: destinationId || undefined,
        albumId: albumId || undefined,
        categoryId: categoryId || undefined,
        experienceId: experienceId || undefined,
      });
      toast.success("Photo uploaded successfully");
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
      navigate(routes.admin.photos);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Upload photo</h1>
      <p className="mt-1 text-sm text-gray-600">
        Upload a photograph and set its details.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <label className="label">Image file</label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg" />
            ) : (
              <div className="py-10 text-gray-500">
                <Upload className="mx-auto h-10 w-10" />
                <p className="mt-3 text-sm">Choose a JPEG or PNG up to 50 MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-4 block w-full text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lion at sunset"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Currency</label>
              <select
                className="input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="TZS">TZS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Destination</label>
              <select
                className="input"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
              >
                <option value="">—</option>
                {destinations?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Album</label>
              <select
  className="input"
  value={albumId}
  onChange={(e) => setAlbumId(e.target.value)}
>
  <option value="">— No album —</option>
  {albums?.map((a) => (
    <option key={a.id} value={a.id}>
      {a.title}
    </option>
  ))}
</select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">—</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Experience</label>
              <select
                className="input"
                value={experienceId}
                onChange={(e) => setExperienceId(e.target.value)}
              >
                <option value="">—</option>
                {experiences?.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || !file}
          >
            {submitting ? "Uploading..." : "Upload photo"}
          </button>
          <p className="text-xs text-gray-500">
            The photo is saved as a draft. Publish it from the photos list to
            generate the watermarked preview.
          </p>
        </div>
      </form>
    </div>
  );
}
