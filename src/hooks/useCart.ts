import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart, updateQty, removeFromCart } from '@/actions/cart'
import { toast } from 'sonner'

export function useCart() {
  const queryClient = useQueryClient()

  // 1. Fetch Cart Count (Optimized for small data)
  const { data: cartCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      const res = await fetch('/api/cart/count', { cache: 'no-store' })
      const data = await res.json()
      return data.count as number
    }
  })

  // 2. Fetch Full Cart Details
  const { data: cartData = { items: [], total: 0 }, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart-details'],
    queryFn: async () => {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      return await res.json()
    }
  })

  // 3. Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('itemQuantity', quantity.toString())
      return addToCart(formData)
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['cart-count'] })
        queryClient.invalidateQueries({ queryKey: ['cart-details'] })
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    },
    onError: () => toast.error('Something went wrong')
  })

  // 4. Update Qty Mutation 
  const updateQtyMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('itemQuantity', quantity.toString())
      return updateQty(formData)
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['cart-count'] })
        queryClient.invalidateQueries({ queryKey: ['cart-details'] })
      }
    }
  })

  // 5. Remove Item Mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const formData = new FormData()
      formData.append('productId', productId)
      return removeFromCart(formData)
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['cart-count'] })
        queryClient.invalidateQueries({ queryKey: ['cart-details'] })
        toast.success('Item removed')
      }
    }
  })

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
    isRemoving: removeItemMutation.isPending
  }
}
