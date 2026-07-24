import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products } from '../data/products'

const CartContext = createContext(null)
const STORAGE_KEY = 'softher-cart-v1'
const LEGACY_STORAGE_KEY = 'cotton-blush-cart-v1'

function readCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return []
    return JSON.parse(saved).map((item) => {
      const baseId = item.product.id.replace(/-bundle$/, '')
      const catalogProduct = products.find((product) => product.id === baseId)
      if (!catalogProduct) return item
      const color = catalogProduct.colors.find((option) => option.hex === item.color.hex) || catalogProduct.colors[0]
      return {
        ...item,
        color,
        product: {
          ...catalogProduct,
          id: item.product.id,
          price: item.product.price,
        },
      }
    })
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, size = 'M', color = product.colors[0], quantity = 1) => {
    const key = `${product.id}-${size}-${color.name}`
    setItems((current) => {
      const existing = current.find((item) => item.key === key)
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...current, { key, product, size, color, quantity }]
    })
  }

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.key !== key))
      return
    }
    setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity } : item)))
  }

  const removeItem = (key) => setItems((current) => current.filter((item) => item.key !== key))
  const clearCart = () => setItems([])

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
