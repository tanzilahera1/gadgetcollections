import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleWishlist } from '@/actions/wishlist';
import { toast } from 'sonner';

export function useWishlist() {
  const queryClient = useQueryClient();

  // Fetch Wishlist Items
  const { data: wishlistIds = [], isLoading } = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: async () => {
      const res = await fetch('/api/user/wishlist', { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json() as string[];
    }
  });

  // Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      return toggleWishlist(productId);
    },
    onMutate: async ({ productId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist-items'] });
      const previousWishlist = queryClient.getQueryData<string[]>(['wishlist-items']) || [];
      
      const isCurrentlyWished = previousWishlist.includes(productId);
      queryClient.setQueryData<string[]>(['wishlist-items'], (old = []) => 
        isCurrentlyWished ? old.filter(id => id !== productId) : [...old, productId]
      );

      return { previousWishlist };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist-items'], context.previousWishlist);
      }
      toast.error("Failed to update wishlist");
    },
    onSuccess: (data) => {
      if (data.error) {
        if (data.notLoggedIn) {
           toast.error("অনুগ্রহ করে লগিন করুন");
        } else {
           toast.error(data.error);
        }
        queryClient.invalidateQueries({ queryKey: ['wishlist-items'] }); // Rollback optimistic update
      } else {
        toast.success(data.isAdded ? "উইশলিস্টে যোগ করা হয়েছে!" : "উইশলিস্ট থেকে সরানো হয়েছে!", {
          duration: 1500,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
    }
  });

  return {
    wishlistIds,
    isLoading,
    toggleWishlist: toggleMutation.mutate,
    isToggling: toggleMutation.isPending
  };
}
