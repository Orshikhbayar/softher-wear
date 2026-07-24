import { useId } from 'react'

const silhouettes = {
  Briefs: 'M160 210 C210 230 390 230 440 210 L406 458 C372 414 334 394 300 408 C266 394 228 414 194 458 Z',
  Hipsters: 'M146 250 C220 268 380 268 454 250 L418 448 C376 404 340 389 300 407 C260 389 224 404 182 448 Z',
  'High-Waist': 'M160 145 C225 167 375 167 440 145 L410 465 C368 414 335 395 300 409 C265 395 232 414 190 465 Z',
  Boyshorts: 'M142 220 C224 244 376 244 458 220 L444 465 L354 465 C342 422 324 402 300 413 C276 402 258 422 246 465 L156 465 Z',
  Thongs: 'M150 232 C228 251 372 251 450 232 L406 330 C360 353 325 399 300 458 C275 399 240 353 194 330 Z',
  Multipacks: 'M160 210 C210 230 390 230 440 210 L406 458 C372 414 334 394 300 408 C266 394 228 414 194 458 Z',
}

function SingleBrief({ product, gradientId, offset = 0, opacity = 1 }) {
  const path = silhouettes[product.category] || silhouettes.Briefs
  return (
    <g transform={`translate(${offset} 0)`} opacity={opacity}>
      <path d={path} fill={`url(#${gradientId})`} stroke="rgba(105,65,72,.26)" strokeWidth="2" />
      <path d="M160 214 C232 235 368 235 440 214" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="12" strokeLinecap="round" />
      <path d="M170 226 C232 243 368 243 430 226" fill="none" stroke="rgba(104,62,70,.16)" strokeWidth="2" strokeDasharray="3 7" />
      <g transform="translate(300 231)">
        <ellipse cx="-13" cy="0" rx="15" ry="8" fill="rgba(255,255,255,.78)" transform="rotate(20)" />
        <ellipse cx="13" cy="0" rx="15" ry="8" fill="rgba(255,255,255,.78)" transform="rotate(-20)" />
        <circle r="5" fill="rgba(255,255,255,.92)" />
      </g>
      <path d="M206 450 C235 409 268 393 300 408 C332 393 365 409 394 450" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

export default function ProductArt({ product, className = '', compact = false }) {
  const rawId = useId()
  const gradientId = `product-${rawId.replace(/:/g, '')}`
  const color = product.colors?.[0]?.hex || '#df8f9d'
  const secondColor = product.colors?.[1]?.hex || color

  return (
    <svg
      className={`product-art ${className}`}
      viewBox="0 0 600 620"
      role="img"
      aria-label={`${product.name}, ${product.colors?.[0]?.name || 'ягаан'} өнгөтэй`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={secondColor} />
          <stop offset=".48" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".82" />
        </linearGradient>
        <filter id={`${gradientId}-shadow`} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#74535a" floodOpacity=".2" />
        </filter>
        <radialGradient id={`${gradientId}-glow`}>
          <stop offset="0" stopColor="#fff" stopOpacity=".86" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="520" rx={compact ? 150 : 190} ry="38" fill="rgba(102,65,72,.12)" />
      <circle cx="300" cy="290" r="245" fill={`url(#${gradientId}-glow)`} opacity=".72" />
      <g filter={`url(#${gradientId}-shadow)`}>
        {product.category === 'Multipacks' && (
          <>
            <SingleBrief product={{ ...product, category: 'Briefs' }} gradientId={gradientId} offset={-45} opacity={0.46} />
            <SingleBrief product={{ ...product, category: 'Briefs' }} gradientId={gradientId} offset={45} opacity={0.65} />
          </>
        )}
        <SingleBrief product={product} gradientId={gradientId} />
      </g>
      {!compact && (
        <>
          <path d="M99 132 C112 97 148 85 181 105 C145 112 127 129 122 158 C113 151 105 143 99 132Z" fill="rgba(255,255,255,.65)" />
          <circle cx="488" cy="145" r="10" fill="#fff" opacity=".62" />
          <circle cx="510" cy="171" r="5" fill="#fff" opacity=".5" />
        </>
      )}
    </svg>
  )
}
