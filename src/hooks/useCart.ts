import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, updateQty, removeFromCart } from "@/actions/cart";
import { toast } from "sonner";

export function useCart() {
  const queryClient = useQueryClient();

  // 1. Fetch Cart Count (Optimized for small data)
  const { data: cartCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ["cart-count"],
    queryFn: async () => {
      const res = await fetch("/api/cart/count");
      const data = await res.json();
      return data.count as number;
    },
  });

  // 2. Fetch Full Cart Details
  const { data: cartData = { items: [], total: 0 }, isLoading: isLoadingCart } =
    useQuery({
      queryKey: ["cart-details"],
      queryFn: async () => {
        const res = await fetch("/api/cart");
        return await res.json();
      },
    });

  // 3. Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("itemQuantity", quantity.toString());
      return addToCart(formData);
    },
    onMutate: async (newItem) => {
      // ১. অন্য কোনো ফেচ রিফ্রেশ বন্ধ করো যাতে ওভাররাইট না হয়
      await queryClient.cancelQueries({ queryKey: ["cart-count"] });
      await queryClient.cancelQueries({ queryKey: ["cart-details"] });

      // ২. আগের ডেটা সেভ করে রাখো (এরর হলে রোলব্যাক করার জন্য)
      const previousCount = queryClient.getQueryData(["cart-count"]);
      const previousDetails = queryClient.getQueryData(["cart-details"]);

      // ৩. ইনস্ট্যান্টলি UI আপডেট করো (Optimistic Update)
      queryClient.setQueryData(
        ["cart-count"],
        (old: number = 0) => old + newItem.quantity,
      );

      // কার্ট ডিটেইলসেও নতুন আইটেম যোগ করার চেষ্টা করা যেতে পারে, তবে কাউন্ট ইনাফ ইনস্ট্যান্ট ফিলের জন্য

      return { previousCount, previousDetails };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("কার্টে যোগ হয়েছে!");
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    },
    onError: (err, newItem, context) => {
      // ৪. সমস্যা হলে আগের ডেটাতে ফিরে যাও
      if (context) {
        queryClient.setQueryData(["cart-count"], context.previousCount);
        queryClient.setQueryData(["cart-details"], context.previousDetails);
      }
      toast.error("Something went wrong");
    },
    onSettled: () => {
      // ৫. কাজ শেষে সার্ভারের সাথে সিঙ্ক করে নাও
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-details"] });
    },
  });

  // 4. Update Qty Mutation
  const updateQtyMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("itemQuantity", quantity.toString());
      return updateQty(formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        queryClient.invalidateQueries({ queryKey: ["cart-details"] });
      }
    },
  });

  // 5. Remove Item Mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const formData = new FormData();
      formData.append("productId", productId);
      return removeFromCart(formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        queryClient.invalidateQueries({ queryKey: ["cart-details"] });
        toast.success("Item removed");
      }
    },
  });

  return {
    cartCount,
    cart: cartData,
    isLoadingCount,
    isLoadingCart,
    addToCart: addToCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    updateQty: updateQtyMutation.mutate,
    isUpdating: updateQtyMutation.isPending,
    removeItem: removeItemMutation.mutate,
    isRemoving: removeItemMutation.isPending,
  };
}
