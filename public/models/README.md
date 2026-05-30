# Models

The car currently renders procedurally from primitives in
`components/car/CarModel.tsx` — no GLB required, so the experience loads instantly.

## Swapping in a real car model (optional)

1. Drop a low-poly GLB here, e.g. `public/models/car.glb`
   (target < 50k triangles, Draco/Meshopt compressed).
2. Replace the body of `CarModel.tsx` with:

```tsx
import { useGLTF } from '@react-three/drei';
export function CarModel() {
  const { scene } = useGLTF('/models/car.glb');
  return <primitive object={scene} />;
}
useGLTF.preload('/models/car.glb');
```

The `CarController` is model-agnostic — it only moves the wrapping group, so
no physics changes are needed.

### Recommended free, license-clear sources
- Kenney "Car Kit" (CC0) — kenney.nl
- Quaternius low-poly vehicles (CC0)
- Poly Pizza (filter by CC0 / CC-BY)
