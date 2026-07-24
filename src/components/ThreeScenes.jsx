import { forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  AdaptiveDpr,
  ContactShadows,
  Float,
  OrbitControls,
  RoundedBox,
  useCursor,
} from '@react-three/drei'
import * as THREE from 'three'
import { Box, RotateCcw, Sparkles } from 'lucide-react'
import ProductArt from './ProductArt'

function useExperiencePreference() {
  const [isLowPower, setIsLowPower] = useState(() => {
    if (typeof window === 'undefined') return true
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4
    let webgl = false
    try {
      const canvas = document.createElement('canvas')
      webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      webgl = false
    }
    return reduced || lowCores || lowMemory || !webgl
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => event.matches && setIsLowPower(true)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isLowPower
}

function createFabricTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.fillStyle = '#b6b6b6'
  context.fillRect(0, 0, 128, 128)
  for (let index = 0; index < 128; index += 3) {
    context.strokeStyle = index % 6 === 0 ? '#d8d8d8' : '#969696'
    context.globalAlpha = 0.32
    context.beginPath()
    context.moveTo(index, 0)
    context.lineTo(index + 8, 128)
    context.stroke()
    context.beginPath()
    context.moveTo(0, index)
    context.lineTo(128, index + 8)
    context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

const UnderwearModel = forwardRef(function UnderwearModel(
  { color = '#df8f9d', autoRotate = false, fabricDetail = false, hoverable = true },
  forwardedRef,
) {
  const group = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  useImperativeHandle(forwardedRef, () => group.current)

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-1.48, 1.05)
    shape.bezierCurveTo(-0.76, 0.88, 0.76, 0.88, 1.48, 1.05)
    shape.bezierCurveTo(1.36, 0.25, 1.02, -0.56, 0.5, -1.28)
    shape.bezierCurveTo(0.18, -1.18, -0.18, -1.18, -0.5, -1.28)
    shape.bezierCurveTo(-1.02, -0.56, -1.36, 0.25, -1.48, 1.05)
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.06,
      curveSegments: 28,
    })
  }, [])

  const fabricTexture = useMemo(createFabricTexture, [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      fabricTexture.dispose()
    }
  }, [fabricTexture, geometry])

  useFrame((state, delta) => {
    if (!group.current) return
    if (autoRotate) group.current.rotation.y += delta * 0.32
    const targetScale = hovered && hoverable ? 1.045 : 1
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    if (autoRotate) group.current.position.y = Math.sin(state.clock.elapsedTime * 0.85) * 0.07
  })

  return (
    <group
      ref={group}
      rotation={[-0.05, -0.15, 0.01]}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (hoverable) setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={geometry} castShadow receiveShadow position={[0, -0.03, -0.11]}>
        <meshStandardMaterial
          color={color}
          roughness={fabricDetail ? 0.95 : 0.78}
          metalness={0}
          bumpMap={fabricTexture}
          bumpScale={fabricDetail ? 0.055 : 0.022}
        />
      </mesh>
      <RoundedBox args={[2.94, 0.25, 0.38]} radius={0.1} smoothness={5} position={[0, 1.04, 0.04]} castShadow>
        <meshStandardMaterial color={color} roughness={0.72} bumpMap={fabricTexture} bumpScale={0.025} />
      </RoundedBox>
      <mesh position={[-0.17, 0.92, 0.34]} scale={[0.22, 0.12, 0.08]} rotation={[0, 0, -0.35]} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#fff2ef" roughness={0.65} />
      </mesh>
      <mesh position={[0.17, 0.92, 0.34]} scale={[0.22, 0.12, 0.08]} rotation={[0, 0, 0.35]} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#fff2ef" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.92, 0.39]} scale={0.085} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#fff9f7" roughness={0.6} />
      </mesh>
    </group>
  )
})

function Cloud({ position, scale = 1 }) {
  return (
    <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.25}>
      <group position={position} scale={scale}>
        {[
          [-0.65, 0, 0, 0.58],
          [-0.12, 0.2, 0, 0.78],
          [0.5, 0.02, 0, 0.6],
          [0.08, -0.12, 0.08, 0.72],
        ].map(([x, y, z, radius], index) => (
          <mesh key={index} position={[x, y, z]} castShadow>
            <sphereGeometry args={[radius, 18, 14]} />
            <meshStandardMaterial color="#fffaf5" roughness={0.92} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

function Ribbon({ color, points, position }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  )
  return (
    <mesh position={position} castShadow>
      <tubeGeometry args={[curve, 52, 0.055, 8, false]} />
      <meshStandardMaterial color={color} roughness={0.58} />
    </mesh>
  )
}

function Flower({ position, color = '#f0b4bd', scale = 1 }) {
  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.3}>
      <group position={position} scale={scale}>
        {[0, 1, 2, 3, 4].map((petal) => {
          const angle = (petal / 5) * Math.PI * 2
          return (
            <mesh key={petal} position={[Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0]} rotation={[0, 0, angle]} scale={[0.24, 0.14, 0.08]} castShadow>
              <sphereGeometry args={[1, 16, 10]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          )
        })}
        <mesh position={[0, 0, 0.1]} scale={0.12}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#e7b86f" roughness={0.6} />
        </mesh>
      </group>
    </Float>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.65} />
      <directionalLight position={[4, 7, 6]} intensity={3.2} color="#fff5e8" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 1, 4]} intensity={18} color="#e7c9f3" distance={9} />
      <pointLight position={[4, -1, 3]} intensity={12} color="#ffc7ad" distance={8} />
    </>
  )
}

function HeroWorld() {
  return (
    <>
      <Lights />
      <group position={[0.15, -0.2, 0]} scale={1.08}>
        <UnderwearModel color="#de8e9c" autoRotate />
      </group>
      <Cloud position={[-2.7, 1.6, -1.4]} scale={0.72} />
      <Cloud position={[2.65, -1.1, -1.8]} scale={0.52} />
      <Ribbon
        color="#bba4d6"
        position={[-2.7, -0.3, 0]}
        points={[[0, 1, 0], [0.7, 0.55, 0.1], [0.05, 0, -0.1], [0.6, -0.85, 0.2]]}
      />
      <Ribbon
        color="#efb199"
        position={[2.05, 0.45, -0.35]}
        points={[[0, 1, 0], [0.65, 0.4, 0.2], [-0.05, -0.2, 0], [0.45, -1.05, 0.1]]}
      />
      <Flower position={[-2.2, -1.3, 0.5]} scale={0.82} />
      <Flower position={[2.4, 1.55, -0.3]} color="#c5b1df" scale={0.62} />
      <ContactShadows position={[0, -1.68, 0]} opacity={0.22} scale={7} blur={2.8} far={4} />
      <AdaptiveDpr pixelated />
    </>
  )
}

const fallbackProduct = {
  name: 'Үүлэн зөөлөн бриф',
  category: 'Briefs',
  colors: [{ name: 'Дэлбээ ягаан', hex: '#df8f9d' }, { name: 'Дулаан крем', hex: '#e9dac6' }],
}

export function HeroExperience() {
  const lowPower = useExperiencePreference()
  const [show3D, setShow3D] = useState(!lowPower)

  return (
    <div className="hero-experience">
      {show3D ? (
        <div className="hero-canvas" aria-label="Үүл, тууз, цэцгээр хүрээлүүлэн эргэж буй ягаан хөвөн бриф" role="img">
          <Canvas
            shadows
            dpr={[1, 1.45]}
            camera={{ position: [0, 0.1, 6.2], fov: 42 }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
          >
            <Suspense fallback={null}>
              <HeroWorld />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="hero-static" role="img" aria-label="Зөөлөн үүл, цэцгийн чимэглэлтэй ягаан хөвөн бриф">
          <span className="static-cloud static-cloud-one" />
          <span className="static-cloud static-cloud-two" />
          <ProductArt product={fallbackProduct} />
        </div>
      )}
      <button
        type="button"
        className="experience-toggle"
        onClick={() => setShow3D((current) => !current)}
        aria-pressed={show3D}
      >
        <Box size={16} aria-hidden="true" />
        {show3D ? 'Энгийн зураг харах' : '3D-аар үзэх'}
      </button>
    </div>
  )
}

function CameraRig({ detail }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, detail ? 0.1 : 0.2, detail ? 4.1 : 6.2)
    camera.updateProjectionMatrix()
  }, [camera, detail])
  return null
}

export function ProductViewer({ product }) {
  const controls = useRef()
  const model = useRef()
  const [detail, setDetail] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const lowPower = useExperiencePreference()

  const reset = () => {
    controls.current?.reset()
    if (model.current) model.current.rotation.set(-0.05, -0.15, 0.01)
    setDetail(false)
    setResetKey((current) => current + 1)
  }

  if (lowPower) {
    return (
      <div className="viewer-fallback">
        <ProductArt product={product} />
        <p>Төхөөрөмжийн ачааллыг багасгахын тулд энгийн зураг идэвхтэй байна.</p>
      </div>
    )
  }

  return (
    <div className={`product-viewer ${detail ? 'is-detail' : ''}`}>
      <div className="viewer-canvas" aria-label={`${product.name}-ийн интерактив 3D харагдац`} role="img">
        <Canvas
          key={resetKey}
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.2, 6.2], fov: 40 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        >
          <Suspense fallback={null}>
            <Lights />
            <CameraRig detail={detail} />
            <UnderwearModel ref={model} color={product.colors[0].hex} fabricDetail={detail} />
            <ContactShadows position={[0, -1.55, 0]} opacity={0.24} scale={6} blur={2.5} far={4} />
            <OrbitControls
              ref={controls}
              makeDefault
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              minDistance={3.7}
              maxDistance={8}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={(Math.PI * 2) / 3}
            />
            <AdaptiveDpr pixelated />
          </Suspense>
        </Canvas>
      </div>
      <div className="viewer-controls" aria-label="3D харагдацын удирдлага">
        <button type="button" className={detail ? 'is-active' : ''} onClick={() => setDetail((current) => !current)} aria-pressed={detail}>
          <Sparkles size={16} aria-hidden="true" />
          {detail ? 'Бүтнээр харах' : 'Даавууг ойроос'}
        </button>
        <button type="button" onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" /> Шинээр эхлэх
        </button>
      </div>
      <p className="viewer-hint">Чирж эргүүлнэ · Гүйлгэж эсвэл чимхэж томруулна</p>
    </div>
  )
}
