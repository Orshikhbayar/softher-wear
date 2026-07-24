import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Facebook,
  Flower2,
  Heart,
  Instagram,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wind,
  X,
} from 'lucide-react'
import { categories, getCategoryLabel, products, testimonials } from './data/products'
import { useCart } from './context/CartContext'
import { useDialogA11y } from './hooks/useDialogA11y'
import ProductArt from './components/ProductArt'
import { HeroCinematic, MaterialCinematic } from './components/CinematicSequence'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'

const allColorNames = [...new Set(products.flatMap((product) => product.colors.map((color) => color.name)))].sort()

function usePersistentWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('softher-wishlist-v1')
        || localStorage.getItem('cotton-blush-wishlist-v1')
      return JSON.parse(saved) || []
    } catch {
      return []
    }
  })
  useEffect(() => localStorage.setItem('softher-wishlist-v1', JSON.stringify(wishlist)), [wishlist])
  const toggle = (id) => setWishlist((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  return { wishlist, toggle }
}

function Logo() {
  return (
    <span className="brand-logo" aria-label="softher">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 23c-5-10-17-12-19-3-2 8 11 8 19 6M24 23c5-10 17-12 19-3 2 8-11 8-19 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill="currentColor" />
        <path d="M24 28c-2 7-7 10-11 12M24 28c2 7 7 10 11 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>softher</span>
    </span>
  )
}

function AnnouncementBar() {
  return (
    <div className="announcement-bar" aria-label="Дэлгүүрийн мэдээлэл">
      <span>$60-аас дээш захиалгад хүргэлт үнэгүй</span>
      <span className="announcement-extra">Өмсөөгүй бүтээгдэхүүнийг 30 хоногт хялбар буцаана</span>
      <span>Шинэ өнгө: цэцэрлэгийн туяанууд</span>
    </div>
  )
}

function Header({ itemCount, wishlistCount, wishlistOnly, onWishlist, onCart, onSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMenu = () => setMobileOpen(false)
  return (
    <>
      <AnnouncementBar />
      <header className="site-header">
        <div className="nav-shell">
          <a href="#top" className="logo-link" onClick={closeMenu}><Logo /></a>
          <nav className="desktop-nav" aria-label="Үндсэн цэс">
            <a href="#shop">Дэлгүүр</a>
            <a href="#categories">Цуглуулга</a>
            <a href="#bundle">Багц бүрдүүлэх</a>
            <a href="#story">Бидний зөөлөн чанар</a>
          </nav>
          <div className="nav-actions">
            <button type="button" className="icon-button" onClick={onSearch} aria-label="Бүтээгдэхүүн хайх"><Search aria-hidden="true" /></button>
            <button type="button" className={`icon-button has-count ${wishlistOnly ? 'is-active' : ''}`} onClick={onWishlist} aria-label={`Хадгалсан бүтээгдэхүүн: ${wishlistCount}`} aria-pressed={wishlistOnly}>
              <Heart fill={wishlistOnly ? 'currentColor' : 'none'} aria-hidden="true" />
              {wishlistCount > 0 && <span>{wishlistCount}</span>}
            </button>
            <button type="button" className="icon-button has-count" onClick={onCart} aria-label={`Сагсанд ${itemCount} бүтээгдэхүүн байна`}>
              <ShoppingBag aria-hidden="true" />
              {itemCount > 0 && <span>{itemCount}</span>}
            </button>
            <button type="button" className="icon-button mobile-menu-button" onClick={() => setMobileOpen((current) => !current)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? 'Цэс хаах' : 'Цэс нээх'}>
              {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav id="mobile-menu" className="mobile-nav" aria-label="Гар утасны цэс" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <a href="#shop" onClick={closeMenu}>Дэлгүүр <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#categories" onClick={closeMenu}>Цуглуулга <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#bundle" onClick={closeMenu}>Багц бүрдүүлэх <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#story" onClick={closeMenu}>Бидний зөөлөн чанар <ArrowRight size={17} aria-hidden="true" /></a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function Hero({ onShop, onFit }) {
  return <HeroCinematic onShop={onShop} onFit={onFit} />
}

function SoftnessTicker() {
  return (
    <div className="softness-ticker" aria-label="Бүтээгдэхүүний онцлог">
      <div>
        <span>Амьсгалдаг хөвөн <Flower2 aria-hidden="true" /></span>
        <span>Зөөлөн суналт <Flower2 aria-hidden="true" /></span>
        <span>Бүх биед нийцэх эсгүүр <Flower2 aria-hidden="true" /></span>
        <span>Өдөр тутмын тав тух <Flower2 aria-hidden="true" /></span>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, text, action }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

function CategoriesSection({ onCategory }) {
  return (
    <section id="categories" className="section-shell section-space">
      <SectionHeading eyebrow="Эсгүүрээ сонгоорой" title="Өдөр бүрт тохирох сонголт" text="Танил эсгүүрүүдийг илүү зөөлөн хөвөн, эвтэйхэн бүсэлхийгээр шинэчиллээ." />
      <div className="category-grid">
        {categories.map((category, index) => (
          <motion.button
            type="button"
            className="category-card"
            key={category.name}
            onClick={() => onCategory(category.name)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            style={{ '--category-tone': category.tone }}
          >
            <span className="category-number">0{index + 1}</span>
            <span className="category-bloom"><Flower2 aria-hidden="true" /></span>
            <strong>{category.label}</strong>
            <small>{category.note}</small>
            <ArrowRight size={18} aria-hidden="true" />
          </motion.button>
        ))}
      </div>
    </section>
  )
}

function Rating({ rating, count }) {
  return (
    <span className="card-rating" aria-label={`5-аас ${rating} од, ${count} сэтгэгдэл`}>
      <Star size={14} fill="currentColor" aria-hidden="true" /><strong>{rating}</strong><span>({count})</span>
    </span>
  )
}

function ProductCard({ product, wished, onToggleWish, onOpen, onQuickAdd }) {
  const [size, setSize] = useState('M')
  return (
    <motion.article className="product-card" layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <div className="product-image-wrap">
        {product.badge && <span className="product-badge">{product.badgeLabel || product.badge}</span>}
        <button type="button" className={`wishlist-button ${wished ? 'is-wished' : ''}`} onClick={() => onToggleWish(product.id)} aria-label={wished ? `${product.name}-ийг хадгалснаас хасах` : `${product.name}-ийг хадгалах`} aria-pressed={wished}>
          <Heart fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <button type="button" className="product-image-button" onClick={() => onOpen(product)} aria-label={`${product.name}-ийн дэлгэрэнгүйг үзэх`}>
          <ProductArt product={product} />
        </button>
        <div className="quick-add-panel">
          <label><span className="sr-only">{product.name}-ийн хурдан нэмэх хэмжээ</span><select value={size} onChange={(event) => setSize(event.target.value)}>{product.sizes.map((option) => <option key={option}>{option}</option>)}</select></label>
          <button type="button" onClick={() => onQuickAdd(product, size)}>Сагслах</button>
        </div>
      </div>
      <div className="product-card-info">
        <div className="product-meta"><span>{getCategoryLabel(product.category)}</span><Rating rating={product.rating} count={product.reviewCount} /></div>
        <button type="button" className="product-name-button" onClick={() => onOpen(product)}><h3>{product.name}</h3></button>
        <div className="price-line"><strong>${product.price.toFixed(2)}</strong>{product.compareAt && <del>${product.compareAt.toFixed(2)}</del>}</div>
        <div className="swatch-row" aria-label={`Боломжит өнгө: ${product.colors.map((color) => color.name).join(', ')}`}>
          {product.colors.map((color) => <span key={color.name} style={{ '--swatch': color.hex }} title={color.name} />)}
          <small>{product.colors.length} өнгө</small>
        </div>
      </div>
    </motion.article>
  )
}

function ShopSection({ category, setCategory, wishlist, wishlistOnly, setWishlistOnly, bestsellersOnly, setBestsellersOnly, onOpenProduct, onQuickAdd, onToggleWish }) {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('All')
  const [color, setColor] = useState('All')
  const [price, setPrice] = useState('all')
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.category} ${getCategoryLabel(product.category)} ${product.description}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || product.category === category
      const matchesSize = size === 'All' || product.sizes.includes(size)
      const matchesColor = color === 'All' || product.colors.some((option) => option.name === color)
      const matchesWishlist = !wishlistOnly || wishlist.includes(product.id)
      const matchesBestseller = !bestsellersOnly || product.badge === 'Bestseller'
      const matchesPrice = price === 'all' || (price === 'under20' && product.price < 20) || (price === '20to25' && product.price >= 20 && product.price <= 25) || (price === 'over25' && product.price > 25)
      return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesWishlist && matchesBestseller && matchesPrice
    })
    if (sort === 'low') return [...result].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [bestsellersOnly, category, color, price, search, size, sort, wishlist, wishlistOnly])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setSize('All')
    setColor('All')
    setPrice('all')
    setWishlistOnly(false)
    setBestsellersOnly(false)
  }

  return (
    <section id="shop" className="shop-section section-shell section-space">
      <SectionHeading eyebrow="Зөөлөн сонголтууд" title="Өдөр тутмын дуртайгаа олоорой" text="Бодож бүтээсэн бүрхэлт, баяр баясгалант өнгө, арьс маажих шошгогүй." />
      <div className="category-pills" aria-label="Ангиллаар шүүх">
        {['All', ...categories.map((item) => item.name)].map((item) => (
          <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} aria-pressed={category === item}>{item === 'All' ? 'Бүгд' : getCategoryLabel(item)}</button>
        ))}
      </div>
      <div className="filter-bar">
        <label className="search-field" htmlFor="product-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Бүтээгдэхүүн хайх</span><input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Зөөлөн сонголтоо хайх" /></label>
        <label className="filter-control"><span className="filter-label">Хэмжээ</span><select value={size} onChange={(event) => setSize(event.target.value)}><option value="All">Бүгд</option>{products[0].sizes.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></label>
        <label className="filter-control"><span className="filter-label">Өнгө</span><select value={color} onChange={(event) => setColor(event.target.value)}><option value="All">Бүгд</option>{allColorNames.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></label>
        <label className="filter-control"><span className="filter-label">Үнэ</span><select value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">Бүх үнэ</option><option value="under20">$20-оос доош</option><option value="20to25">$20–$25</option><option value="over25">$25-аас дээш</option></select><ChevronDown size={15} aria-hidden="true" /></label>
        <label className="filter-control"><span className="filter-label">Эрэмбэ</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Онцлох</option><option value="rating">Өндөр үнэлгээтэй</option><option value="low">Үнэ: багаас</option><option value="high">Үнэ: ихээс</option></select><ChevronDown size={15} aria-hidden="true" /></label>
      </div>
      {(wishlistOnly || bestsellersOnly) && (
        <div className="active-filters" aria-label="Идэвхтэй шүүлтүүр">
          {wishlistOnly && <button type="button" onClick={() => setWishlistOnly(false)}>Зөвхөн хадгалсан <X size={14} aria-hidden="true" /></button>}
          {bestsellersOnly && <button type="button" onClick={() => setBestsellersOnly(false)}>Шилдэг борлуулалт <X size={14} aria-hidden="true" /></button>}
        </div>
      )}
      <div className="results-line"><p aria-live="polite"><strong>{filtered.length}</strong> зөөлөн сонголт</p><span>Бага хэмжээгээр, нягт нямбай үйлдвэрлэв</span></div>
      {filtered.length ? (
        <motion.div className="product-grid" layout>
          <AnimatePresence>
            {filtered.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onToggleWish={onToggleWish} onOpen={onOpenProduct} onQuickAdd={onQuickAdd} />)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="empty-results"><Flower2 aria-hidden="true" /><h3>Тохирох бүтээгдэхүүн олдсонгүй.</h3><p>Илүү олон үүлэн зөөлөн сонголт харахын тулд шүүлтүүрээ цэвэрлээрэй.</p><button type="button" className="button button-secondary" onClick={clearFilters}>Бүх шүүлтүүрийг цэвэрлэх</button></div>
      )}
    </section>
  )
}

function BundleBuilder({ onNotify }) {
  const [selected, setSelected] = useState([])
  const [size, setSize] = useState('M')
  const { addItem } = useCart()
  const bundleProducts = products.filter((product) => product.category !== 'Multipacks').slice(0, 6)
  const chosen = selected.map((id) => products.find((product) => product.id === id))
  const rawTotal = chosen.reduce((sum, product) => sum + product.price, 0)
  const bundleTotal = rawTotal * 0.9

  const toggleProduct = (id) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length === 3) return current
      return [...current, id]
    })
  }

  const addBundle = () => {
    chosen.forEach((product) => addItem({
      ...product,
      id: `${product.id}-bundle`,
      price: Number((product.price * 0.9).toFixed(2)),
    }, size, product.colors[0], 1))
    onNotify('Таны гурван хосын багц 10% хэмнэлттэйгээр сагсанд нэмэгдлээ.')
    setSelected([])
  }

  return (
    <section id="bundle" className="bundle-section section-space">
      <div className="section-shell bundle-shell">
        <div className="bundle-copy">
          <p className="eyebrow">Өөрийнхөөрөө бүрдүүлээрэй</p>
          <h2>Зөөлөн гурвал бүрдүүлэх</h2>
          <p>Дан бүтээгдэхүүнээс дурын гурвыг сонгоод 10% хэмнээрэй. Эсгүүрүүдээ хослуулж, нэг хэмжээгээр багцлаарай.</p>
          <div className="bundle-steps"><span className={selected.length >= 1 ? 'is-done' : ''}>1</span><i /><span className={selected.length >= 2 ? 'is-done' : ''}>2</span><i /><span className={selected.length >= 3 ? 'is-done' : ''}>3</span></div>
          <label className="bundle-size">Багцын хэмжээ<select value={size} onChange={(event) => setSize(event.target.value)}>{products[0].sizes.map((option) => <option key={option}>{option}</option>)}</select></label>
          <div className="bundle-summary">
            <div><span>{selected.length}/3 сонгосон</span><strong>{selected.length ? `$${bundleTotal.toFixed(2)}` : 'Хосуудаа сонгоно уу'}</strong>{selected.length > 0 && <del>${rawTotal.toFixed(2)}</del>}</div>
            <button type="button" className="button button-primary" disabled={selected.length !== 3} onClick={addBundle}>Багцыг сагслах</button>
          </div>
        </div>
        <div className="bundle-picker" aria-label="Багцдаа гурван бүтээгдэхүүн сонгох">
          {bundleProducts.map((product) => {
            const active = selected.includes(product.id)
            const disabled = selected.length === 3 && !active
            return (
              <button type="button" key={product.id} className={active ? 'is-selected' : ''} onClick={() => toggleProduct(product.id)} aria-pressed={active} disabled={disabled}>
                <span className="bundle-check">{active ? <Check size={15} aria-hidden="true" /> : <PlusMark />}</span>
                <ProductArt product={product} compact />
                <span><strong>{product.name}</strong><small>${product.price.toFixed(2)}</small></span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PlusMark() { return <span aria-hidden="true">+</span> }

function BenefitsSection() {
  const benefits = [
    { icon: Wind, title: 'Амьсгалдаг хөвөн', text: 'Хөвөнгийн өндөр агууламжтай даавуу бүх улиралд байгалийн хөнгөн мэдрэмж төрүүлнэ.' },
    { icon: Sparkles, title: 'Зөөлөн бүсэлхий', text: 'Зөөлөвчтэй резин арьсанд шигдэхгүй, хумигдахгүй, чимхэхгүйгээр тэгш сууна.' },
    { icon: Heart, title: 'Бүх биед нийцэх эсгүүр', text: 'XS–3X хэмжээтэй, бодит биед өмсөж туршсан, хүссэн бүрхэлтээ сонгох боломжтой.' },
    { icon: PackageCheck, title: 'Хариуцлагатай савлагаа', text: 'Дахин боловсруулсан цаасан уут, бага будаг, хэрэгцээгүй хуванцаргүй.' },
  ]
  return (
    <section id="benefits" className="benefits-section section-shell section-space">
      <SectionHeading eyebrow="softher-ийн ялгарал" title="Ухамсартай тав тух" text="Жижиг зүйл бүрийг нямбай зөөлрүүлэв." />
      <div className="benefits-grid">
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <article key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>
        ))}
      </div>
    </section>
  )
}

function ReviewsSection() {
  return (
    <section id="reviews" className="reviews-section section-space">
      <div className="section-shell">
        <SectionHeading eyebrow="Зөөлөн чанар батлагдсан" title="Өдөр тутмын бодит биед хайрлагдсан" action={<div className="review-total"><strong>4.8</strong><span><span className="stars" aria-hidden="true">★★★★★</span><small>1,392 баталгаажсан сэтгэгдэл</small></span></div>} />
        <div className="testimonial-grid">
          {testimonials.map((review) => (
            <article key={review.name}><span className="stars" aria-hidden="true">★★★★★</span><blockquote>“{review.quote}”</blockquote><footer><span className="review-avatar">{review.name.charAt(0)}</span><p><strong>{review.name}</strong><small>{review.detail}</small></p><ShieldCheck size={18} aria-label="Баталгаажсан сэтгэгдэл" /></footer></article>
          ))}
        </div>
      </div>
    </section>
  )
}

function GallerySection() {
  return (
    <section className="gallery-section section-shell section-space" aria-labelledby="gallery-title">
      <SectionHeading eyebrow="Зөөлөн хэмнэлтэй амьдрал" title="Тайван өглөө болон түүнээс хойших бүхэнд" text="Эвтэйхэн хөвөн, бодит өдөр тутам, өөрөөрөө байх тав тух." />
      <h2 className="sr-only" id="gallery-title">softher амьдралын хэв маягийн галерей</h2>
      <div className="gallery-grid">
        <figure className="gallery-wide"><img src="/images/softher-friends.jpg" alt="Нарлаг өрөөнд пастел өнгийн хөвөн хувцастай гурван насанд хүрсэн найз угаасан хувцсаа хамт эвхэж байна" width="1536" height="1024" loading="lazy" /><figcaption>Хамтдаа бүр зөөлөн</figcaption></figure>
        <figure className="gallery-tall"><img src="/images/softher-reading.jpg" alt="Крем, лаванда өнгийн хөвөн амралтын хувцастай насанд хүрсэн эмэгтэй нарлаг цонхны дэргэд ном уншиж байна" width="768" height="1344" loading="lazy" /><figcaption>Тайвшрах орон зай</figcaption></figure>
        <figure className="gallery-crop"><img src="/images/softher-friends.jpg" alt="Ягаан, крем, лаванда өнгийн шинэхэн эвхсэн хөвөн хувцас" width="1536" height="1024" loading="lazy" /><figcaption>Шинэхэн эвхсэн дуртай хувцас</figcaption></figure>
      </div>
    </section>
  )
}

function Newsletter({ onNotify }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    onNotify('Зөөлөн захидалд тавтай морил—удахгүй имэйлээ шалгаарай.')
  }
  return (
    <section className="newsletter section-shell">
      <div className="newsletter-decoration" aria-hidden="true"><Flower2 /><Flower2 /><Flower2 /></div>
      <p className="eyebrow">Зөөлөн захидал</p>
      <h2>Таны имэйлд багахан тав тух.</h2>
      <p>Шинэ өнгө, эсгүүрийн зөвлөгөө, түрүүлж авах боломжийг хааяа, нягт нямбай илгээнэ.</p>
      {submitted ? (
        <div className="newsletter-success" role="status"><Check aria-hidden="true" /><span><strong>Та жагсаалтад бүртгэгдлээ.</strong> Цөөн бөгөөд дулаахан мэдээ хүргэнэ.</span></div>
      ) : (
        <form onSubmit={submit}><label htmlFor="newsletter-email" className="sr-only">Имэйл хаяг</label><input id="newsletter-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Таны имэйл хаяг" /><button type="submit" className="button button-primary">Зөөлөн хүрээлэлд нэгдэх <ArrowRight size={18} aria-hidden="true" /></button></form>
      )}
    </section>
  )
}

function Footer({ onFit }) {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div className="footer-brand"><a href="#top"><Logo /></a><p>Хөдөлгөөн болон амралтын мөч бүрт зориулсан амьсгалдаг хөвөн үндсэн хэрэглээ.</p><div className="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram дахь softher"><Instagram aria-hidden="true" /></a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook дахь softher"><Facebook aria-hidden="true" /></a></div></div>
        <div><h2>Дэлгүүр</h2><a href="#shop">Бүх дотуур хувцас</a><a href="#categories">Эсгүүрээр сонгох</a><a href="#bundle">Багц бүрдүүлэх</a><a href="#shop">Шилдэг борлуулалт</a></div>
        <div><h2>Тусламж</h2><button type="button" onClick={onFit}>Өөрийн эсгэлтээ олох</button><a href="#story">Даавуу ба арчилгаа</a><a href="mailto:hello@softher.wear">Холбоо барих</a><a href="#reviews">Сэтгэгдэл</a></div>
        <div><h2>Бидний амлалт</h2><a href="#story">Хариуцлагатай материал</a><a href="#story">Савлагаа</a><a href="#story">Бүх биед нийцэх дизайн</a><a href="mailto:hello@softher.wear?subject=Accessibility">Хүртээмж</a></div>
      </div>
      <div className="section-shell footer-bottom"><span>© 2026 softher. Хайраар бүтээсэн дэлгүүрийн демо.</span><span>Нууцлал · Нөхцөл · Күүки</span></div>
    </footer>
  )
}

function FitFinder({ open, onClose, onResult }) {
  const dialogRef = useRef(null)
  const [coverage, setCoverage] = useState('balanced')
  const [rise, setRise] = useState('mid')
  const [result, setResult] = useState(null)
  useDialogA11y(dialogRef, open, onClose)

  useEffect(() => {
    if (!open) setResult(null)
  }, [open])

  const findFit = () => {
    let recommendation = 'Briefs'
    if (coverage === 'minimal') recommendation = 'Thongs'
    if (coverage === 'full' && rise === 'high') recommendation = 'High-Waist'
    else if (coverage === 'full') recommendation = 'Boyshorts'
    else if (rise === 'low') recommendation = 'Hipsters'
    setResult(recommendation)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-layer fit-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="modal-scrim" aria-label="Эсгүүр олох цонхыг хаах" onClick={onClose} />
          <motion.section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="fit-title" className="fit-finder" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}>
            <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Эсгүүр олох цонхыг хаах"><X aria-hidden="true" /></button>
            <span className="fit-icon"><Sparkles aria-hidden="true" /></span>
            <p className="eyebrow">60 секундэд эсгүүрээ олоорой</p>
            <h2 id="fit-title">Танд хамгийн эвтэйхэнийг олъё.</h2>
            {!result ? (
              <>
                <fieldset><legend>Ямар бүрхэлт танд эвтэйхэн бэ?</legend><div className="fit-options">{[['minimal', 'Минимал', 'Арын хэсэг маш бага'], ['balanced', 'Тэнцвэртэй', 'Өдөр тутмын сонгодог'], ['full', 'Бүрэн', 'Илүү тухтай бүрхэлт']].map(([value, label, note]) => <button type="button" key={value} className={coverage === value ? 'is-selected' : ''} onClick={() => setCoverage(value)} aria-pressed={coverage === value}><strong>{label}</strong><span>{note}</span></button>)}</div></fieldset>
                <fieldset><legend>Бүсэлхий хаана суухыг хүсдэг вэ?</legend><div className="fit-options">{[['low', 'Намхан', 'Ташаан дээр'], ['mid', 'Дунд', 'Хүйсний доор'], ['high', 'Өндөр', 'Бэлхүүс дээр']].map(([value, label, note]) => <button type="button" key={value} className={rise === value ? 'is-selected' : ''} onClick={() => setRise(value)} aria-pressed={rise === value}><strong>{label}</strong><span>{note}</span></button>)}</div></fieldset>
                <button type="button" className="button button-primary" onClick={findFit}>Надад тохирохыг харуулах <ArrowRight size={18} aria-hidden="true" /></button>
              </>
            ) : (
              <div className="fit-result" role="status"><span className="fit-result-art"><Flower2 aria-hidden="true" /></span><p>Танд хамгийн тохирох эсгүүр</p><h3>{getCategoryLabel(result)}</h3><p>{result === 'High-Waist' ? 'Бэлхүүс дээр зөөлөн дэмжлэг, эвтэйхэн бүрхэлт өгнө.' : result === 'Boyshorts' ? 'Завгүй өдөр ч толигор хэвээр байх сул, бүрэн бүрхэлт.' : result === 'Thongs' ? 'Амьсгалдаг хөвөнгийн зөөлөн мэдрэмжтэй хөнгөн, минимал эсгүүр.' : result === 'Hipsters' ? 'Тэнцвэртэй арын бүрхэлттэй эвтэйхэн намхан суудал.' : 'Өдөр бүрт зориулсан сонгодог, тэнцвэртэй эсгүүр.'}</p><button type="button" className="button button-primary" onClick={() => onResult(result)}>Тохирохыг худалдаж авах <ArrowRight size={18} aria-hidden="true" /></button><button type="button" className="text-button" onClick={() => setResult(null)}>Асуулгыг дахин бөглөх</button></div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const { itemCount, addItem } = useCart()
  const { wishlist, toggle } = usePersistentWishlist()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [fitOpen, setFitOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [wishlistOnly, setWishlistOnly] = useState(false)
  const [bestsellersOnly, setBestsellersOnly] = useState(false)
  const [toast, setToast] = useState('')

  const closeProduct = useCallback(() => setSelectedProduct(null), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const closeFit = useCallback(() => setFitOpen(false), [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = (message) => setToast(message)
  const scrollToShop = () => window.setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 10)
  const shopBestsellers = () => { setCategory('All'); setWishlistOnly(false); setBestsellersOnly(true); scrollToShop() }
  const chooseCategory = (nextCategory) => { setCategory(nextCategory); setWishlistOnly(false); setBestsellersOnly(false); scrollToShop() }
  const searchProducts = () => { setWishlistOnly(false); scrollToShop(); window.setTimeout(() => document.getElementById('product-search')?.focus(), 600) }
  const toggleWishlistView = () => { setWishlistOnly((current) => !current); setBestsellersOnly(false); scrollToShop() }
  const quickAdd = (product, size) => { addItem(product, size, product.colors[0], 1); notify(`${product.name}, ${size} хэмжээ сагсанд нэмэгдлээ.`) }
  const fitResult = (nextCategory) => { closeFit(); chooseCategory(nextCategory) }
  const related = selectedProduct ? products.filter((item) => item.id !== selectedProduct.id).slice(0, 3) : []

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Үндсэн хэсэг рүү шилжих</a>
      <Header itemCount={itemCount} wishlistCount={wishlist.length} wishlistOnly={wishlistOnly} onWishlist={toggleWishlistView} onCart={() => setCartOpen(true)} onSearch={searchProducts} />
      <main id="main-content">
        <Hero onShop={shopBestsellers} onFit={() => setFitOpen(true)} />
        <CategoriesSection onCategory={chooseCategory} />
        <ShopSection category={category} setCategory={setCategory} wishlist={wishlist} wishlistOnly={wishlistOnly} setWishlistOnly={setWishlistOnly} bestsellersOnly={bestsellersOnly} setBestsellersOnly={setBestsellersOnly} onOpenProduct={setSelectedProduct} onQuickAdd={quickAdd} onToggleWish={toggle} />
        <SoftnessTicker />
        <BundleBuilder onNotify={notify} />
        <BenefitsSection />
        <MaterialCinematic />
        <ReviewsSection />
        <GallerySection />
        <Newsletter onNotify={notify} />
      </main>
      <Footer onFit={() => setFitOpen(true)} />
      <ProductModal product={selectedProduct} onClose={closeProduct} onSelectProduct={setSelectedProduct} related={related} onNotify={notify} wished={selectedProduct ? wishlist.includes(selectedProduct.id) : false} onToggleWish={toggle} />
      <CartDrawer open={cartOpen} onClose={closeCart} onNotify={notify} />
      <FitFinder open={fitOpen} onClose={closeFit} onResult={fitResult} />
      <AnimatePresence>{toast && <motion.div className="toast" role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check aria-hidden="true" />{toast}<button type="button" onClick={() => setToast('')} aria-label="Мэдэгдлийг хаах"><X size={16} aria-hidden="true" /></button></motion.div>}</AnimatePresence>
    </div>
  )
}
