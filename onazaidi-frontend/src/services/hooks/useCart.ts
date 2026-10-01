import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/services/api/cartApi";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { useAuthStore } from "@/app/store/authStore";

const KEY = ["cart"];

export function useCart() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: KEY,
    queryFn: cartApi.get,
    enabled: isAuthenticated(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => cartApi.add(photoId),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      toast.success("Added to cart");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => cartApi.remove(photoId),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      toast.success("Removed from cart");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}
