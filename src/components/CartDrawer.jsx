import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useDialogA11y } from '../hooks/useDialogA11y'
import ProductArt from './ProductArt'

export default function CartDrawer({ open, onClose, onNotify }) {
  const drawerRef = useRef(null)
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [delivery, setDelivery] = useState('standard')
  useDialogA11y(drawerRef, open, onClose)
  const deliveryCost = delivery === 'express' ? 8 : subtotal >= 60 ? 0 : 5

  const closeDrawer = () => {
    onClose()
    window.setTimeout(() => {
      setCheckoutMode(false)
      setOrderNumber('')
      setDelivery('standard')
    }, 250)
  }

  const submitOrder = (event) => {
    event.preventDefault()
    const code = `SF-${Math.floor(1000 + Math.random() * 9000)}`
    setOrderNumber(code)
    clearCart()
    onNotify(`Демо захиалга ${code} амжилттай баталгаажлаа.`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="drawer-scrim" onClick={closeDrawer} aria-label="Сагсыг хаах" />
          <motion.aside
            ref={drawerRef}
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 330, damping: 34 }}
          >
            <header className="drawer-header">
              {checkoutMode && !orderNumber ? (
                <button type="button" className="icon-button" onClick={() => setCheckoutMode(false)} aria-label="Сагс руу буцах">
                  <ArrowLeft aria-hidden="true" />
                </button>
              ) : <ShoppingBag aria-hidden="true" />}
              <div>
                <p className="eyebrow">{checkoutMode ? 'Аюулгүй демо төлбөр' : 'Таны өдөр тутмын сонголт'}</p>
                <h2 id="cart-title">{orderNumber ? 'Захиалга баталгаажлаа' : checkoutMode ? 'Хүргэлтийн мэдээлэл' : `Сагс (${itemCount})`}</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeDrawer} aria-label="Сагсыг хаах">
                <X aria-hidden="true" />
              </button>
            </header>

            {orderNumber ? (
              <div className="order-complete">
                <span className="order-check"><Check aria-hidden="true" /></span>
                <p className="eyebrow">Баярлалаа</p>
                <h3>Таны зөөлөн сонголтууд замдаа гарлаа.</h3>
                <p>Энэ бол зөвхөн интерфейсийн демо захиалга. Таны баталгаажуулах дугаар <strong>{orderNumber}</strong>.</p>
                <button type="button" className="button button-primary" onClick={closeDrawer}>Худалдан авалтаа үргэлжлүүлэх</button>
              </div>
            ) : checkoutMode ? (
              <form className="checkout-form" onSubmit={submitOrder}>
                <div className="checkout-note"><ShieldCheck aria-hidden="true" /><span><strong>Демо төлбөр</strong>Төлбөрийн мэдээлэл цуглуулахгүйгээр сагсны бүрэн урсгалыг туршина.</span></div>
                <label>Имэйл хаяг<input required type="email" name="email" autoComplete="email" placeholder="таны@имэйл.mn" /></label>
                <label>Овог нэр<input required name="name" autoComplete="name" placeholder="Овог нэр" /></label>
                <label>Гудамж, байр, тоот<input required name="address" autoComplete="street-address" placeholder="Хөвөнгийн гудамж 123" /></label>
                <div className="form-split">
                  <label>Хот<input required name="city" autoComplete="address-level2" /></label>
                  <label>Шуудангийн код<input required name="postal" autoComplete="postal-code" /></label>
                </div>
                <label>Хүргэлтийн төрөл<select name="delivery" value={delivery} onChange={(event) => setDelivery(event.target.value)}><option value="standard">Энгийн · {subtotal >= 60 ? 'Үнэгүй' : '$5'}</option><option value="express">Шуурхай · $8</option></select></label>
                <div className="checkout-total"><span>Нийт</span><strong>${(subtotal + deliveryCost).toFixed(2)}</strong></div>
                <button className="button button-primary" type="submit">Демо захиалга өгөх</button>
              </form>
            ) : items.length === 0 ? (
              <div className="empty-cart">
                <span><ShoppingBag aria-hidden="true" /></span>
                <h3>Таны сагс хоосон байна.</h3>
                <p>Үүлэн зөөлөн дуртай бүтээгдэхүүнээ нэмбэл дараагийн удаад энд хадгалагдана.</p>
                <button type="button" className="button button-primary" onClick={closeDrawer}>Шилдэг бүтээгдэхүүн үзэх</button>
              </div>
            ) : (
              <>
                <div className="cart-progress">
                  <div>
                    <span>{subtotal >= 60 ? 'Үнэгүй хүргэлтийн эрх нээгдлээ' : `Үнэгүй хүргэлтэд $${(60 - subtotal).toFixed(2)} дутуу`}</span>
                    {subtotal >= 60 && <Check size={16} aria-hidden="true" />}
                  </div>
                  <span className="progress-track"><span style={{ width: `${Math.min(100, (subtotal / 60) * 100)}%` }} /></span>
                </div>
                <div className="cart-items">
                  {items.map((item) => (
                    <article className="cart-item" key={item.key}>
                      <div className="cart-item-art"><ProductArt product={{ ...item.product, colors: [item.color] }} compact /></div>
                      <div className="cart-item-info">
                        <div><h3>{item.product.name}</h3><p>{item.color.name} · {item.size}</p></div>
                        <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                        <div className="cart-item-actions">
                          <div className="quantity-control small-control">
                            <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label={`${item.product.name}-ийн тоог багасгах`}><Minus size={14} aria-hidden="true" /></button>
                            <output>{item.quantity}</output>
                            <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label={`${item.product.name}-ийн тоог нэмэх`}><Plus size={14} aria-hidden="true" /></button>
                          </div>
                          <button type="button" className="remove-item" onClick={() => removeItem(item.key)} aria-label={`${item.product.name}-ийг сагснаас хасах`}><Trash2 size={16} aria-hidden="true" /> Хасах</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <footer className="cart-footer">
                  <div className="subtotal"><span>Дүн</span><strong>${subtotal.toFixed(2)}</strong></div>
                  <p>{subtotal >= 60 ? 'Татварыг төлбөрийн хэсэгт тооцно. Энгийн хүргэлт үнэгүй.' : `Татварыг төлбөрийн хэсэгт тооцно. Үнэгүй энгийн хүргэлтэд $${(60 - subtotal).toFixed(2)}-ын бүтээгдэхүүн нэмнэ үү.`}</p>
                  <button type="button" className="button button-primary" onClick={() => setCheckoutMode(true)}><ShieldCheck size={18} aria-hidden="true" /> Аюулгүй төлбөр</button>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
