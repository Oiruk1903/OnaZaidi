import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ImagePlus } from "lucide-react";
import { adminApi, type Album } from "@/services/api/adminApi";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { Link } from "react-router-dom";
import { useDestinations } from "@/services/hooks/useDestinations";

export function AdminAlbumsPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", destinationId: "" });
  const { data: destinations } = useDestinations();

  const {
    data: albums,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-albums"],
    queryFn: adminApi.listAlbums,
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; destinationId?: string }) =>
      adminApi.createAlbum({
        title: data.title,
        description: data.description,
        destinationId: data.destinationId,
      }),
    onSuccess: () => {
      toast.success("Album created successfully");
      setShowCreateForm(false);
      setFormData({ title: "", description: "", destinationId: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-albums"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title: string; description?: string; destinationId?: string }) =>
      adminApi.updateAlbum(data.id, {
        title: data.title,
        description: data.description,
        destinationId: data.destinationId,
      }),
    onSuccess: () => {
      toast.success("Album updated successfully");
      setEditingAlbum(null);
      setFormData({ title: "", description: "", destinationId: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-albums"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAlbum(id),
    onSuccess: () => {
      toast.success("Album deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-albums"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Album title is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !editingAlbum) {
      toast.error("Album title is required");
      return;
    }
    updateMutation.mutate({ id: editingAlbum.id, ...formData });
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({ title: album.title, description: album.description || "", destinationId: album.destinationId || "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Albums</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage photo albums for your website.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Album
        </button>
      </div>

      {(showCreateForm || editingAlbum) && (
        <div className="mt-6 card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">
            {editingAlbum ? "Edit Album" : "Create New Album"}
          </h2>
          <form onSubmit={editingAlbum ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="label">Album Title</label>
              <input
                className="input"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Serengeti Safari"
                required
              />
            </div>
            <div>
              <label className="label">Destination (Optional)</label>
              <select
                className="input"
                value={formData.destinationId}
                onChange={(e) =>
                  setFormData({ ...formData, destinationId: e.target.value })
                }
              >
                <option value="">— No destination —</option>
                {destinations?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this album..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingAlbum
                  ? "Update Album"
                  : "Create Album"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAlbum(null);
                  setFormData({ title: "", description: "", destinationId: "" });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading albums...</div>
        ) : isError ? (
          <div className="text-center py-8 text-red-600">
            Failed to load albums. Please try again.
          </div>
        ) : !albums || albums.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No albums yet. Create your first album to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-gray-900">
                      {album.title}
                    </h3>
                    {album.destinationName && (
                      <p className="mt-1 text-xs text-brand-600 font-medium">
                        {album.destinationName}
                      </p>
                    )}
                    {album.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Created: {new Date(album.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(album)}
                      className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/admin/photos/new?albumId=${album.id}`}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Add Photos
                  </Link>
                  <Link
                    to={`/albums/${album.slug}`}
                    target="_blank"
                    className="flex-1 btn-primary text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}