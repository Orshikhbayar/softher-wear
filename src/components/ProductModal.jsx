import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Heart, Minus, Plus, Star, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useDialogA11y } from '../hooks/useDialogA11y'
import ProductArt from './ProductArt'
import { ProductViewer } from './ThreeScenes'
import { getCategoryLabel } from '../data/products'

export default function ProductModal({ product, onClose, onSelectProduct, related, onNotify, wished, onToggleWish }) {
  const open = Boolean(product)
  const dialogRef = useRef(null)
  const [size, setSize] = useState('M')
  const [colorIndex, setColorIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  useDialogA11y(dialogRef, open, onClose)

  useEffect(() => {
    setSize('M')
    setColorIndex(0)
    setQuantity(1)
  }, [product?.id])

  if (!product) return null
  const color = product.colors[colorIndex]

  const addToBag = () => {
    addItem(product, size, color, quantity)
    onNotify(`${quantity} × ${product.name} сагсанд нэмэгдлээ.`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="modal-scrim" type="button" aria-label="Бүтээгдэхүүний дэлгэрэнгүйг хаах" onClick={onClose} />
          <motion.section
            ref={dialogRef}
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Бүтээгдэхүүний дэлгэрэнгүйг хаах">
              <X aria-hidden="true" />
            </button>
            <div className="product-modal-grid">
              <ProductViewer product={{ ...product, colors: [color, ...product.colors.filter((_, index) => index !== colorIndex)] }} />
              <div className="product-info-panel">
                <p className="eyebrow">{getCategoryLabel(product.category)}</p>
                <div className="product-title-row">
                  <div>
                    <h2 id="product-modal-title">{product.name}</h2>
                    <div className="rating-line" aria-label={`5-аас ${product.rating} од, ${product.reviewCount} сэтгэгдэл`}>
                      <Star size={16} fill="currentColor" aria-hidden="true" />
                      <strong>{product.rating}</strong>
                      <span>{product.reviewCount} сэтгэгдэл</span>
                    </div>
                  </div>
                  <button className={`icon-button ${wished ? 'is-wished' : ''}`} type="button" onClick={() => onToggleWish(product.id)} aria-pressed={wished} aria-label={wished ? `${product.name}-ийг хадгалснаас хасах` : `${product.name}-ийг хадгалах`}>
                    <Heart fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                </div>
                <p className="modal-price">${product.price.toFixed(2)}</p>
                <p className="product-description">{product.description}</p>

                <fieldset className="option-group">
                  <legend>Өнгө <span>{color.name}</span></legend>
                  <div className="large-swatches">
                    {product.colors.map((option, index) => (
                      <button
                        type="button"
                        key={option.name}
                        className={index === colorIndex ? 'is-selected' : ''}
                        style={{ '--swatch': option.hex }}
                        aria-label={`${option.name}${index === colorIndex ? ', сонгосон' : ''}`}
                        onClick={() => setColorIndex(index)}
                      />
                    ))}
                  </div>
                </fieldset>

                <fieldset className="option-group">
                  <legend>Хэмжээ <button type="button" className="text-button" onClick={() => onNotify('Эсгүүрийн зөвлөгөө: өмсдөг хэмжээгээ сонгоорой. Хоёр хэмжээний дунд байвал илүү зөөлөн суултын тулд томыг сонгоно уу.')}>Хэмжээний зөвлөмж</button></legend>
                  <div className="size-grid">
                    {product.sizes.map((option) => (
                      <button type="button" key={option} className={size === option ? 'is-selected' : ''} aria-pressed={size === option} onClick={() => setSize(option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="purchase-row">
                  <div className="quantity-control" aria-label="Тоо ширхэг сонгох">
                    <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Тоо ширхэг багасгах" disabled={quantity === 1}>
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <output aria-live="polite">{quantity}</output>
                    <button type="button" onClick={() => setQuantity((current) => Math.min(8, current + 1))} aria-label="Тоо ширхэг нэмэх" disabled={quantity === 8}>
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <button className="button button-primary add-to-bag" type="button" onClick={addToBag}>
                    Сагслах · ${(product.price * quantity).toFixed(2)}
                  </button>
                </div>

                <div className="detail-accordions">
                  <details open>
                    <summary>Даавуу ба эсгүүр</summary>
                    <p>{product.composition} Шошгогүй, зөөлөн бүтэцтэй бөгөөд дөрвөн чиглэлд эвтэйхэн сунана.</p>
                  </details>
                  <details>
                    <summary>Арчилгааны заавар</summary>
                    <p>{product.care}</p>
                  </details>
                  <details>
                    <summary>Хүргэлт ба буцаалт</summary>
                    <p>$60-аас дээш захиалгад энгийн хүргэлт үнэгүй. Өмсөөгүй бүтээгдэхүүнийг анхны савлагаатай нь 30 хоногийн дотор буцааж болно.</p>
                  </details>
                </div>
              </div>
            </div>

            <div className="modal-review">
              <div>
                <span className="stars" aria-hidden="true">★★★★★</span>
                <blockquote>“Хөлний эргэн тойрон үнэхээр зөөлөн, суудал нь яг хүссэн газартаа байна. Өдрийн төгсгөлд ч чимхэхгүй.”</blockquote>
                <p>— Rina T., баталгаажсан худалдан авагч</p>
              </div>
              <div className="review-score">
                <strong>{product.rating}</strong>
                <span>дундаж үнэлгээ</span>
              </div>
            </div>

            <div className="related-products">
              <div className="section-heading compact-heading">
                <div><p className="eyebrow">Сайхан зохицоно</p><h3>Танд мөн таалагдаж магадгүй</h3></div>
              </div>
              <div className="related-grid">
                {related.map((item) => (
                  <button type="button" className="related-card" key={item.id} onClick={() => onSelectProduct(item)}>
                    <ProductArt product={item} compact />
                    <span><strong>{item.name}</strong><small>${item.price.toFixed(2)}</small></span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
