
# 3D Spinning Golden Coin - Implementation Plan

## Overview
Add a stunning 3D golden coin to the hero section that slowly spins and floats in the air. The coin will have ridged edges like real currency and display your logo embossed on both faces.

## Visual Concept

```text
                    ┌─────────────────────────────────────────┐
                    │                                         │
     HERO TEXT      │           ╭───────────╮                 │
                    │          ╱   LOGO     ╲                 │
   MuslimHacks      │         │   embossed   │   ← Spinning   │
                    │          ╲   coin      ╱     slowly     │
   36 hours to...   │           ╰───────────╯                 │
                    │               ↕                          │
   [Email signup]   │          floating                       │
                    │                                         │
                    └─────────────────────────────────────────┘
```

## Technical Approach

### 1. Install Dependencies
- `@react-three/fiber@^8.18` - React renderer for Three.js
- `@react-three/drei@^9.122.0` - Helper components (lighting, controls, etc.)
- `three@>=0.133` - The 3D engine

### 2. Create 3D Coin Component
**File: `src/components/GoldenCoin.tsx`**

**Coin geometry:**
- Main body: `CylinderGeometry` with adequate radial segments for smoothness
- Edge ridges: Either via geometry or normal mapping
- Proper proportions (thin like a real coin)

**Material:**
- Gold metallic PBR material
- High metalness (0.9+), low roughness (0.2-0.3)
- Warm gold color: `#FFD700` or similar amber-gold from our palette
- Environment map for realistic reflections

**Animations:**
- Slow Y-axis rotation (one full turn every 8-10 seconds)
- Subtle floating bob (using sine wave, ~10px amplitude)
- Optional: slight tilt to show 3D depth

### 3. Logo Embossing Strategy
**Phase 1 (now):** Create coin with a subtle circular indentation on both faces as a placeholder
**Phase 2 (when you provide logo):** Convert logo to grayscale bump map - white areas rise, dark areas recede, creating the embossed effect

### 4. Lighting Setup
- Ambient light for base visibility
- One or two point/spot lights positioned to catch the gold surface
- Optional environment map for realistic metallic reflections

### 5. Integration with Hero Section
- Position coin on the right side of the hero (replacing current decorative circles)
- Responsive sizing (smaller on mobile, larger on desktop)
- Use `Canvas` component from R3F to create the 3D context
- Ensure it doesn't block interactivity of other elements

## Technical Details

### Component Structure
```text
GoldenCoin.tsx
├── Canvas (R3F container)
│   ├── ambientLight
│   ├── pointLight (key light)
│   ├── pointLight (fill light)
│   └── CoinMesh
│       ├── Cylinder geometry
│       ├── MeshStandardMaterial (gold PBR)
│       └── useFrame (rotation + float animation)
└── Suspense fallback (loading state)
```

### Animation Logic
- **Rotation:** `mesh.rotation.y += delta * 0.3` in the render loop
- **Float:** `mesh.position.y = Math.sin(time) * 0.1` for subtle bobbing

### Responsive Behavior
- Desktop: Full-size coin, positioned right of text
- Tablet: Slightly smaller, still beside text
- Mobile: Either above/below text, or smaller inline

## File Changes

| File | Action |
|------|--------|
| `package.json` | Add three.js and R3F dependencies |
| `src/components/GoldenCoin.tsx` | New - 3D coin component |
| `src/components/sections/OpeningSection.tsx` | Integrate coin, remove decorative circles |

## Performance Considerations
- Use `React.Suspense` for async loading
- Optimize geometry segments (not too many)
- Consider `frameloop="demand"` if needed
- Mobile-friendly with reduced complexity if needed

## Future Enhancement (when logo is provided)
1. Convert logo PNG/SVG to grayscale bump map
2. Apply as `bumpMap` or `displacementMap` on coin faces
3. Adjust bump scale for desired depth
4. Logo will appear "pressed into" the gold surface
