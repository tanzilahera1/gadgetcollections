'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db' 
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import { auth } from '@/auth'
import type { ICartItem } from '@/types/cart'

// --- Zod Schemas ---
const AddToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  itemQuantity: z.number().min(1).max(10)
})

const UpdateQtySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  itemQuantity: z.number().min(1).max(10)
})

const RemoveFromCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional()
})

// --- Internal Helper ---
async function getCart() {
  await dbConnect()
  const session = await auth()
  const { getOrCreateSessionId } = await import('@/lib/session')

  if (session?.user?.id) {
    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
    }
    return cart
  } else {
    const guestSessionId = await getOrCreateSessionId()
    let cart = await Cart.findOne({ sessionId: guestSessionId })
    if (!cart) {
      cart = new Cart({ sessionId: guestSessionId, items: [] })
    }
    return cart
  }
}

// --- Next.js Actions ---
export async function addToCart(formData: FormData) {
  const validated = AddToCartSchema.safeParse({
    productId: formData.get('productId'),
    variantId: formData.get('variantId') || undefined,
    itemQuantity: Number(formData.get('itemQuantity') || 1)
  })

  if (!validated.success) return { success: false, error: 'Invalid data', details: validated.error.flatten() }

  const { productId, variantId, itemQuantity } = validated.data
  
  // 1. Verify product exists and is in stock
  await dbConnect()
  const product = await Product.findById(productId)
  if (!product || product.status !== 'published') return { success: false, error: 'Product not found or unavailable' }
  if (product.stockQuantity < itemQuantity) return { success: false, error: 'দুঃখিত! প্রোডাক্টটি এইমাত্র স্টক আউট হয়ে গেছে।' }

  // 2. Get or create cart
  const cart = await getCart()
  if (!cart) return { success: false, error: 'Could not manage cart' }

  const existingItemIndex = cart.items.findIndex(
    (item: ICartItem) => item.product.toString() === productId && item.variant?.toString() === variantId
  )

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].itemQuantity + itemQuantity
    if (product.stockQuantity < newQty) return { success: false, error: 'সর্বোচ্চ স্টক লিমিট পার হয়েছে!' }
    cart.items[existingItemIndex].itemQuantity = newQty
  } else {
    cart.items.push({ product: productId, variant: variantId, itemQuantity, addedAt: new Date() })
  }

  await cart.save()
  return { success: true }
}

export async function updateQty(formData: FormData) {
  const validated = UpdateQtySchema.safeParse({
    productId: formData.get('productId'),
    variantId: formData.get('variantId') || undefined,
    itemQuantity: Number(formData.get('itemQuantity'))
  })

  if (!validated.success) return { success: false, error: 'Invalid data' }

  const cart = await getCart()
  if (!cart) return { success: false, error: 'Could not find cart' }

  const { productId, variantId, itemQuantity } = validated.data
  const existingItemIndex = cart.items.findIndex(
    (item: ICartItem) => item.product.toString() === productId && item.variant?.toString() === variantId
  )

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].itemQuantity = itemQuantity
    await cart.save()
  }
  return { success: true }
}

export async function removeFromCart(formData: FormData) {
  const validated = RemoveFromCartSchema.safeParse({
    productId: formData.get('productId'),
    variantId: formData.get('variantId') || undefined
  })

  if (!validated.success) return { error: 'Invalid data' }

  const cart = await getCart()
  if (!cart) return { error: 'Could not find cart' }

  const { productId, variantId } = validated.data
  cart.items = cart.items.filter(
    (item: ICartItem) => !(item.product.toString() === productId && item.variant?.toString() === variantId)
  )

  await cart.save()
  return { success: true }
}

// --- Auth Merge Logic ---
export async function mergeGuestCartToUser(userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const session = await auth()
    finalUserId = session?.user?.id;
  }
  
  if (!finalUserId) return { success: false, error: 'User ID missing' }

  await dbConnect()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('cart_session_id')?.value
  if (!guestSessionId) return { success: true }

  const [guestCart, userCart] = await Promise.all([
    Cart.findOne({ sessionId: guestSessionId }),
    Cart.findOne({ user: finalUserId })
  ])

  if (!guestCart || guestCart.items.length === 0) return { success: true }

  if (!userCart) {
    guestCart.user = finalUserId
    guestCart.sessionId = undefined
    try {
      await guestCart.save()
      cookieStore.delete('cart_session_id')
    } catch {}
    return { success: true }
  }

  for (const guestItem of guestCart.items) {
    const existingItemIndex = userCart.items.findIndex(
      (item: ICartItem) => item.product.toString() === guestItem.product.toString() &&
              item.variant?.toString() === guestItem.variant?.toString()
    )

    if (existingItemIndex > -1) {
      const product = await Product.findById(guestItem.product).select('stockQuantity')
      const newQty = userCart.items[existingItemIndex].itemQuantity + guestItem.itemQuantity
      userCart.items[existingItemIndex].itemQuantity = Math.min(newQty, product?.stockQuantity || newQty)
    } else {
      const product = await Product.findById(guestItem.product).select('status stockQuantity')
      if (product && product.status === 'published' && product.stockQuantity > 0) {
        userCart.items.push(guestItem)
      }
    }
  }

  await userCart.save()
  await Cart.deleteOne({ _id: guestCart._id })
  try {
    cookieStore.delete('cart_session_id')
  } catch {}
  return { success: true }
}