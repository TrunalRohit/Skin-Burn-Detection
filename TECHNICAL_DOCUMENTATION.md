# Skin Burn Detection - Complete Technical Documentation

**Version:** 2.0  
**Last Updated:** May 11, 2026  
**Project Status:** Production Ready  
**Major Update:** Full-Stack Modernization (Streamlit → React/Next.js + FastAPI + Firebase Auth)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Key Features & Implementation](#key-features--implementation)
8. [Technical Specifications](#technical-specifications)
9. [Installation & Setup](#installation--setup)
10. [API Documentation](#api-documentation)
11. [Dependencies & Versions](#dependencies--versions)
12. [Technical Definitions](#technical-definitions)
13. [Development Workflow](#development-workflow)

---

## Project Overview

**Project Name:** Skin Burn Detection System  
**Purpose:** AI-powered deep learning application for burn severity classification with interactive mapping and real-time camera capture  
**Target Users:** Healthcare professionals, emergency responders, medical students, patients seeking quick assessment  
**Application Type:** Full-Stack Web Application (Frontend + Backend Architecture)  
**Repository:** https://github.com/UtshoDeyTech/Skin-Burn-Detection

### Key Objectives
✅ Classify burns into 3 severity levels (1st, 2nd, 3rd degree) using deep learning  
✅ Provide real-time risk assessment and medical guidance  
✅ Support both file upload and live camera capture input  
✅ Generate downloadable PDF reports with detailed analysis  
✅ Locate nearby medical specialists using geolocation and Google Maps API  
✅ Display interactive maps with specialist locations  
✅ Deliver professional, responsive web interface  
✅ Support mobile and desktop devices seamlessly  
✅ Secure user authentication with Firebase Auth  
✅ Email verification and password reset functionality  
✅ User session management and route protection  
✅ Report history storage in Firestore  
✅ Background saving for improved UX

---

## Technology Stack

### Frontend Architecture (React + Next.js + TypeScript)

| Technology | Version | Purpose | Why Chosen | Location |
|--|--|--|--|--|
| **React** | 19.2.4 | UI component library | Latest version with improved hooks, Server Components, optimal performance | `frontend/app/` and `frontend/components/` |
| **Next.js** | 16.2.0 | Full-stack React framework | App Router (better file organization), Turbopack (4x faster dev builds), API routes, image optimization | `frontend/app/page.tsx`, `frontend/components/` |
| **TypeScript** | 5.7.3 | Static type safety | Prevents runtime type errors, enables IDE autocomplete, improves code maintainability | All `.tsx` and `.ts` files in `frontend/` |
| **Tailwind CSS** | 4.2.0 | Utility-first styling | Smaller bundle (15KB), rapid development, consistent design system, responsive mobile-first | All component files with `className=` attributes |
| **Leaflet** | 1.9.4 | Interactive mapping | Lightweight (39KB vs Google Maps 150KB), open-source, no API key required for base maps | `frontend/components/map-section.tsx` |
| **react-leaflet** | 5.0.0 | React Leaflet wrapper | Idiomatic React hooks API, reduces complexity, component reusability | Map rendering logic in `map-section.tsx` |
| **Radix UI** | Latest | Headless UI components | 20+ unstyled accessible components (buttons, dialogs, cards), pairs with Tailwind CSS | 14 components in `frontend/components/ui/` |
| **Recharts** | Latest | React charting library | Composable chart components, responsive by default | `frontend/components/probabilities-chart.tsx` |
| **Firebase Auth** | 12.12.1 | Authentication service | Secure, scalable auth with email verification, Google sign-in, password reset | `frontend/lib/firebase.ts`, `frontend/components/auth-provider.tsx` |
| **Firestore** | 12.12.1 | NoSQL database | Real-time data sync, user report history storage, automatic scaling | `frontend/lib/report-history.ts` |
| **Next.js Image** | Built-in | Image optimization | Automatic lazy loading, responsive images, format conversion, size optimization | Used in map and result displays |

### Backend Architecture (Python + FastAPI + Machine Learning)

| Technology | Version | Purpose | Why Chosen | Location in Code |
|--|--|--|--|--|
| **FastAPI** | 0.110.0 | Web framework | Modern async-first (nearly Node.js speed), auto-generated API docs (Swagger), built-in validation | Core of `backend/app.py` (lines 1-350+) |
| **Uvicorn** | 0.28.0 | ASGI server | High-performance async HTTP server, better than WSGI for concurrent requests, supports WebSockets | Runs with `uvicorn backend.app:app --reload` |
| **TensorFlow** | 2.15.0 | Deep learning framework | Industry standard, optimized inference, extensive documentation, model serving capabilities | `load_model()` function in `backend/app.py` (lines 22-30) |
| **Keras** | Integrated | Neural network API | High-level model loading (`tf.keras.models.load_model`), standardized layer implementations | Model definition and inference in `preprocess_image()` |
| **Pillow (PIL)** | 9.4.0 | Image processing | Pure Python image handling, format conversion, resizing, PIL standard | Image loading in `preprocess_image()` function |
| **NumPy** | 1.26.4 | Numerical computing | Array operations for normalization, batch dimension handling, efficient tensor computation | Array operations in preprocessing pipeline |
| **geopy** | 2.3.0 | Geocoding library | Standardized address-to-coordinates conversion, multiple provider support | Used in `/nearby` endpoint for location services |
| **Google Maps Places API** | Latest | Medical facility search | Authoritative hospital/doctor database, accurate coordinates, authoritative source data | Called in `search_nearby_hospitals()` function |
| **ReportLab** | Latest | PDF generation | Programmatic PDF creation with text, images, tables, styling | PDF report generation endpoint |
| **python-dotenv** | Latest | Environment management | Loads `.env` configuration files securely (never commit API keys to git) | `load_dotenv()` in app startup |
| **JWT (python-jose)** | Latest | Token-based authentication | Industry standard for secure API authentication | Token creation and validation |
| **bcrypt (passlib)** | Latest | Password hashing | Secure password storage with salt and pepper | User registration and login |

### Machine Learning Model Stack

| Component | Details | Rationale |
|--|--|--|
| **Architecture** | VGG19 (pre-trained on ImageNet) | Reliable feature extractor, proven on medical images, fine-grained detail detection |
| **Input Size** | 224 × 224 × 3 (RGB) | VGG19 standard, captures sufficient detail for burn classification |
| **Output Classes** | 3 (1st, 2nd, 3rd degree) | Matches medical burn classification standard |
| **Model Format** | HDF5 (`.h5`) | Efficient binary format, contains weights + architecture, ~200MB file size |
| **Preprocessing** | Resize → Normalize (ImageNet mean/std) | Matches training pipeline, ensures consistent inference |
| **Inference Speed** | <100ms per image | Real-time performance on consumer hardware (CPU or GPU) |

### Development & Operations Stack

| Tool | Purpose | Configuration |
|--|--|--|
| **npm/pnpm** | Frontend package manager | `frontend/package.json` with 25+ dependencies |
| **pip** | Python package manager | `backend/requirements.txt` with 15+ packages |
| **Python venv** | Virtual environment isolation | `env/` directory (activate with `env\Scripts\activate`) |
| **.env files** | Environment variable management | `backend/.env` (API keys), `frontend/.env.local` (API URL) |
| **Git/GitHub** | Version control | `.gitignore` excludes sensitive files and environments |

### External Services & APIs

| Service | API Key | Purpose | Free Tier | Configuration |
|--|--|--|--|--|
| **Google Maps Places API** | Yes | Find nearby hospitals/doctors | $300 credit / 7-day trial | `GOOGLE_MAPS_API_KEY` in `backend/.env` |
| **OpenStreetMap** | No | Map tiles for Leaflet | Fully free, community-maintained | No configuration needed, used by default |

---

## Architecture Overview (v2.0: Full-Stack Modern Application)

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (localhost:3000)                  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │            NEXT.JS FRONTEND (React 19 + TypeScript)              │  │
│  │                                                                   │  │
│  │  ┌──────────────────┬──────────────────┬──────────────────┐     │  │
│  │  │ Upload Component │ Camera Component │  Map Component   │     │  │
│  │  │  (File Picker)   │ (getUserMedia)   │  (Leaflet+OSM)   │     │  │
│  │  └────────┬─────────┴─────────┬────────┴────────┬─────────┘     │  │
│  │           │                   │                 │               │  │
│  │           └───────────────────┼─────────────────┘               │  │
│  │                               │                                 │  │
│  │  ┌──────────────────────────┬─┴──────────────────────────┐     │  │
│  │  │  Specialized Search      │  Prediction Result Display │    │  │
│  │  │  (Medical Advice Parser) │  (Risk + Confidence)       │    │  │
│  │  └──────────────────────────┴──────────────────────────┬─┘     │  │
│  │                                                        │         │  │
│  │  ┌────────────────────────────────────────────────────┴──────┐ │  │
│  │  │  PDF Report Generator & Download Component               │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                              ↕ HTTP/CORS                             │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
       ✓ Image File           ✓ Nearby Search     (APIs)
       ✓ Location Data        ✓ Specialist Request
                              │
┌───────────────────────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND (localhost:8000)                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │           ASYNCHRONOUS REQUEST HANDLER (Uvicorn)                 │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                 Route Handlers                             │ │  │
│  │  │  ┌──────────────┬────────────────┬──────────────────────┐ │ │  │
│  │  │  │ POST /predict│ POST /nearby   │ GET /status (health)│ │ │  │
│  │  │  │ (Image file) │ (Lat, Lon)     │                      │ │ │  │
│  │  │  └──┬───────────┴────────┬───────┴───────────┬──────────┘ │ │  │
│  │  └─────┼────────────────────┼─────────────────────┼──────────┘ │  │
│  │        │                    │                     │            │  │
│  │  ┌─────┴────────┐  ┌────────┴──────────┐  ┌──────┴──────┐    │  │
│  │  │ Preprocessing│  │ Geolocation &    │  │Validation   │    │  │
│  │  │ Pipeline     │  │ Distance Calc    │  │ & Logging   │    │  │
│  │  │              │  │                  │  │             │    │  │
│  │  │ • Resize     │  │ • geopy geocode  │  │ • Pydantic  │    │  │
│  │  │   224×224    │  │ • Haversine dist │  │   validation│    │  │
│  │  │ • Normalize  │  │ • Sort by dist   │  │ • Error     │    │  │
│  │  │   (ImageNet) │  │ • Limit results  │  │   handling  │    │  │
│  │  │ • Batch dims │  │                  │  │             │    │  │
│  │  └─────┬────────┘  └────────┬──────────┘  └──────┬──────┘    │  │
│  │        │                    │                     │            │  │
│  │  ┌─────┴─────────────────────┴─────────────────────┴──────────┐ │  │
│  │  │         Cached Model Loading (LRU Cache)                  │ │  │
│  │  │  Load once on startup, reuse for all requests             │ │  │
│  │  └────────────────────────────┬────────────────────────────┘ │  │
│  │                               │                             │  │
│  │  ┌────────────────────────────┴─────────────────────────▶  │  │
│  │  │                                                          │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  │        TensorFlow Model Inference                │ │  │
│  │  │  │                                                  │ │  │
│  │  │  │  Input (1, 224, 224, 3)                         │ │  │
│  │  │  │  ↓                                               │ │  │
│  │  │  │  VGG19 Conv Layers (Frozen) → Feature Map      │ │  │
│  │  │  │  ↓                                               │ │  │
│  │  │  │  Custom Dense Layers (Trained) → Probabilities │ │  │
│  │  │  │  ↓                                               │ │  │
│  │  │  │  Output: [p1st, p2nd, p3rd] (sum = 1.0)      │ │  │
│  │  │  │                                                  │ │  │
│  │  │  │  <100ms inference time                          │ │  │
│  │  │  └────────────────────────────────────────────────┘ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │        Response Assembly                                │   │  │
│  │  │  • Class prediction (argmax)                            │   │  │
│  │  │  • Confidence score (max probability)                   │   │  │
│  │  │  • Risk level mapping (1st→low, 2nd→mod, 3rd→high)    │   │  │
│  │  │  • Medical advice lookup (context-specific)            │   │  │
│  │  │  • Nearby specialists (if requested)                   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└───────────────────────────────────────────────────────────────────────────┘
        │                                  │
        ├──────────────────────────────────┤
        │                                  │
   ┌────▼──────┐               ┌──────────▼────┐
   │  Model    │               │  Config       │
   │  my_model │               │  .env         │
   │  .h5      │               │  API Keys     │
   │ (~200MB)  │               │               │
   └───────────┘               └────────────────┘
        │
        └──────────────────────────────────────┐
                                               │
                         ┌─────────────────────┴──────┐
                         │                            │
                    ┌────▼─────┐         ┌────────────▼────┐
                    │ Google    │         │ OpenStreetMap  │
                    │ Maps API  │         │ (Tile Servers)│
                    │ (Places)  │         │ (Leaflet)      │
                    └───────────┘         └────────────────┘
```

### Request Flow: Image Prediction

```
1. User selects image (upload or camera)
              ↓
2. Browser resizes preview
              ↓
3. Client sends multipart/form-data with:
   - image file (JPEG/PNG)
   - optional location (lat, lon)
              ↓
4. FastAPI validates request via Pydantic
              ↓
5. Backend preprocessing:
   - Open image with PIL
   - Resize to 224×224
   - Normalize (divide by 255, apply ImageNet stats)
   - Convert to numpy array
   - Expand batch dimension [1, 224, 224, 3]
              ↓
6. TensorFlow inference (<100ms):
   - VGG19 forward pass (frozen weights)
   - Custom dense layers (trained weights)
   - Softmax output (3 probabilities)
              ↓
7. Post-processing:
   - Extract class: argmax([p1, p2, p3])
   - Calculate confidence: max(probabilities)
   - Map to risk: 1st→Low, 2nd→Moderate, 3rd→High
   - Retrieve medical advice for predicted class
              ↓
8. Return JSON response:
   {
     "predicted_class": "2nd Degree Burn",
     "confidence": 0.87,
     "risk_level": "Moderate Risk",
     "probabilities": {"1st": 0.05, "2nd": 0.87, "3rd": 0.08},
     "medical_advice": "Immerse in cool water...",
     "specialist_recommendations": [...]
   }
              ↓
9. React displays results with styling
              ↓
10. User can download PDF report


---

## Frontend Architecture (React 19 + Next.js 16)

### Directory Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Main application page
│   ├── layout.tsx                  # Root layout & providers
│   └── globals.css                 # Global Tailwind styles
├── components/
│   ├── image-upload.tsx            # File upload + camera toggle
│   ├── camera-capture.tsx          # Live camera preview & capture
│   ├── prediction-result.tsx       # Classification results display
│   ├── probabilities-chart.tsx     # Probability bar chart (Recharts)
│   ├── medical-advice.tsx          # Text parsing + numbered list
│   ├── map-section.tsx             # Leaflet map with markers
│   ├── nearby-specialists.tsx      # Search & results display
│   ├── report-section.tsx          # PDF download button
│   └── ui/                          # 20+ Radix UI components
├── hooks/
│   ├── use-mobile.ts               # Mobile detection
│   └── use-toast.ts                # Toast notifications
├── lib/
│   ├── api.ts                      # Typed API client
│   └── utils.ts                    # Utility functions
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── next.config.mjs                 # Next.js config
```

### Key Implementation Details

**CameraCapture Fix (Critical):**
The async blob timing issue was solved using `useRef`:
```typescript
const capturedBlobRef = useRef<Blob | null>(null)

// During capture - store blob immediately in ref
canvasRef.current!.toBlob((blob) => {
  capturedBlobRef.current = blob  // Store NOW
}, 'image/jpeg', 0.95)

// During submit - use stored blob (no async wait)
const blob = capturedBlobRef.current
```

**Medical Advice Parsing:**
Smart text splitting on 3 delimiters:
```typescript
parseAdvice(text: string): string[] {
  // Regex splits on: bullets (•), line breaks, sentence boundaries
  return text.split(/(?<=[.!?])\s+(?=[A-Z])|•/)
             .filter(s => s.trim().length > 0)
             .map(s => s.trim())
}
```

**Map Dynamic Import (SSR Fix):**
```typescript
const MapSection = dynamic(
  () => import("@/components/map-section").then((mod) => mod.MapSection),
  { ssr: false, loading: () => <div>Loading map...</div> }
)
```

---

## Authentication System (Firebase + JWT)

### Authentication Flow

```
1. User Registration/Login
   ↓
2. Firebase Auth handles:
   - Email/password authentication
   - Google OAuth sign-in
   - Email verification
   - Password reset
   ↓
3. Firebase returns ID token
   ↓
4. Frontend stores token in localStorage
   ↓
5. API requests include JWT in Authorization header
   ↓
6. Backend validates JWT with Firebase Admin SDK
   ↓
7. Protected endpoints return user-specific data
```

### Firebase Configuration (`frontend/lib/firebase.ts`)

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### Route Protection (`frontend/middleware.ts`)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/app') ||
                         request.nextUrl.pathname.startsWith('/history')

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return NextResponse.next()
}
```

### JWT Token Validation (`backend/app.py`)

```python
from firebase_admin import auth as firebase_auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Decode Firebase JWT token
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### Report History Storage (`frontend/lib/report-history.ts`)

```typescript
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore'

export async function saveReportHistory(userId: string, report: ReportData) {
  try {
    await addDoc(collection(db, 'reports'), {
      userId,
      ...report,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error saving report:', error)
  }
}

export async function getReportHistory(userId: string): Promise<ReportData[]> {
  const q = query(
    collection(db, 'reports'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as ReportData)
}
```

### Optimized Prediction Flow (v2.0)

**UI-First Approach:** Results display immediately while saving happens in background

```typescript
// frontend/app/app/page.tsx
const handleImageUpload = async (file: File) => {
  // 1. Show results immediately (optimistic UI)
  const results = await predictBurn(file)
  setPredictionResults(results)  // UI updates instantly

  // 2. Save to Firestore in background (non-blocking)
  saveReportHistory(userId, results).catch(console.error)
}
```

**Benefits:**
- **Immediate feedback:** Users see results instantly
- **Background persistence:** No waiting for database operations
- **Error isolation:** UI failures don't affect prediction display
- **Improved UX:** Smooth, responsive interaction

---

## Backend Architecture (FastAPI + Python)

### Application Structure (`backend/app.py` - 350+ lines)

```python
# 1. IMPORTS & SETUP
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from PIL import Image
import numpy as np
from functools import lru_cache
from dotenv import load_dotenv
import os

# 2. APP INITIALIZATION
app = FastAPI(title="Skin Burn Detection API", version="2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])

# 3. MODEL LOADING (Cached)
@lru_cache(maxsize=1)
def load_model():
    return tf.keras.models.load_model(MODEL_PATH)

# 4. IMAGE PREPROCESSING
def preprocess_image(image_data: bytes) -> np.ndarray:
    # Load → Resize to 224×224 → Normalize → Batch dimension
    # Returns: [1, 224, 224, 3] float32 array

# 5. PREDICTION ENDPOINT
@app.post("/predict")
async def predict(file: UploadFile):
    # Process image → Run inference → Return results
    # Response time: <100ms

# 6. NEARBY SEARCH ENDPOINT  
@app.post("/nearby")
async def search_nearby(lat: float, lon: float, radius: float):
    # Google Places API → Haversine distance → Sort by proximity

# 7. MEDICAL ADVICE LOOKUP
def get_medical_advice(burn_class: str) -> str:
    # Map class to context-specific first aid guidance
```

### Performance Characteristics

| Metric | Value | Notes |
|--|--|--|
| Model Load Time | 500-800ms | First request only, then cached |
| Image Preprocessing | 10-20ms | PIL resize + numpy normalization |
| Model Inference | 50-80ms | TensorFlow VGG19 forward pass |
| API Response | <100ms total | All processing included |
| Concurrent Requests | 20+ | Uvicorn async handling |
| Memory Usage | ~500MB | TensorFlow model + Python runtime |
| CPU Usage | 1-2 cores | During inference (brief spike) |

### API Endpoints Reference

**POST /predict**
- **Authentication:** Required (JWT Bearer token)
- **Input:** Image file (multipart/form-data)
- **Output:** Classification + confidence + medical advice
- **Time:** <100ms

**POST /nearby**
- **Authentication:** Required (JWT Bearer token)
- **Input:** Latitude, longitude, radius (JSON)
- **Output:** 10 nearest medical specialists
- **Time:** 300-500ms (depends on Google API)

**GET /health**
- **Authentication:** None (public endpoint)
- **Input:** None
- **Output:** Server status + model loaded check
- **Time:** <1ms

---

## Frontend Authentication Notes

- The frontend uses Firebase Authentication for login, signup, password reset, and email verification.
- Route protection is enforced in `frontend/middleware.ts` using an auth token cookie.
- Auth state is managed by `frontend/components/auth-provider.tsx`.

## Backend Authentication Notes

- Backend auth exists as legacy endpoints in `backend/app.py` but is not the primary auth path for the current frontend.
- Prediction and nearby endpoints are currently public.

---

## Backend `requirements.txt`
```text
fastapi
uvicorn[standard]
python-dotenv
tensorflow
numpy
pillow
requests
reportlab
python-multipart
pydantic
passlib[bcrypt]
python-jose[cryptography]
pydantic-settings
```

## Frontend `package.json` (Key Dependencies)
```json
{
  "dependencies": {
    "firebase": "^12.12.1",
    "leaflet": "^1.9.4",
    "next": "16.2.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-leaflet": "^5.0.0",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "tailwindcss": "^4.2.4",
    "typescript": "5.7.3",
    "postcss": "^8.5.12"
  }
}
```

---

## Installation & Setup (Current)

### Step 1: Clone Repository
```bash
git clone https://github.com/UtshoDeyTech/Skin-Burn-Detection.git
cd Skin-Burn-Detection
```

### Step 2: Backend Setup

**Create virtual environment:**
```bash
python -m venv env
env\Scripts\activate      # Windows
# or
source env/bin/activate     # macOS/Linux
```

**Install backend dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Create backend .env:**
```bash
GOOGLE_MAPS_API_KEY=your_google_places_api_key
SECRET_KEY=your_secret_key_here
```

**Start backend:**
```bash
uvicorn app:app --reload --host localhost --port 8000
```

### Step 3: Frontend Setup

**Install frontend dependencies:**
```bash
cd ../frontend
npm install
# or
pnpm install
```

**Create frontend .env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Start frontend:**
```bash
npm run dev
```

### Step 4: Verify
- Visit `http://localhost:3000`
- Confirm auth page loads
- Upload an image and check prediction
- Confirm nearby specialists are returned after location search

---

## Technical Definitions
## Technical Definitions

### Machine Learning Terminology

**Transfer Learning**
- Using a pre-trained model as starting point for a new task
- Advantage: Requires less data, trains faster, better accuracy
- In this project: VGG19 (trained on 1.2M ImageNet images) adapted for burn classification

**Fine-tuning**
- Adjusting pre-trained model weights for a new task
- In this project: Not fully performed (all VGG19 layers frozen)
- Future improvement: Unfreeze last few layers and fine-tune

**Convolutional Neural Network (CNN)**
- Neural network designed for image processing
- Learns spatial hierarchies of features
- VGG19: 19 layers with convolutional blocks and pooling

**Feature Extraction**
- Process of identifying important characteristics in images
- VGG19 learns: edges → textures → patterns → objects
- Output: 7×7×512 feature map from input image

**Backpropagation**
- Algorithm to compute gradients and update weights
- Error flows backward through network
- Gradients guide weight updates toward better predictions

### Image Processing Terminology

**Normalization**
- Scaling pixel values to standard range [0, 1]
- Formula: pixel_normalized = pixel_original / 255
- Purpose: Improves model convergence and stability

**Resizing**
- Changing image dimensions from any size to 224×224
- Method: Interpolation (bilinear, bicubic, etc.)
- Purpose: Standardize input for model

**Batch**
- Group of images processed together
- Size: 32 images per batch in this project
- Purpose: Efficient GPU utilization, smoothed gradients

**One-hot Encoding**
- Categorical labels converted to binary vectors
- Example: [1, 0, 0] for 1st degree, [0, 1, 0] for 2nd degree
- Purpose: Required format for categorical crossentropy loss

**RGB Color Space**
- Red, Green, Blue channel representation
- 8-bit per channel: 256 intensity levels (0-255)
- Total colors: 256³ = 16.7 million

### Model Terminology

**Epoch**
- One complete pass through the entire training dataset
- 50 epochs = dataset seen 50 times during training
- Purpose: Measure training progress

**Softmax Activation**
- Converts raw model outputs to probability distribution
- Formula: softmax(x[i]) = exp(x[i]) / Σ(exp(x[j]))
- Property: All outputs sum to 1.0, suitable for classification

**Categorical Crossentropy**
- Loss function for multi-class classification
- Measures difference between predicted and true probability distributions
- Lower value = better predictions

**Adam Optimizer**
- Adaptive learning rate optimizer
- Combines momentum and RMSprop algorithms
- Automatically adjusts learning rates per parameter

**Accuracy Metric**
- Percentage of correct predictions
- Calculated as: correct_predictions / total_predictions * 100%
- Target: >95% accuracy on validation set

### Web Application Terminology

**Session State**
- Client-side state persisted in React context and local storage
- Preserves auth status, report form values, and selected location
- Managed by `frontend/components/auth-provider.tsx`

**Caching**
- Saves repeated data fetches and model resources in memory
- Frontend caches report history and backend caches model load with `lru_cache`
- Improves performance by reducing network and compute overhead

**UI Component**
- Reusable React component for buttons, cards, dialogs, and forms
- Examples: `image-upload.tsx`, `camera-capture.tsx`, `prediction-result.tsx`
- Styled with Tailwind CSS utility classes

**BytesIO Buffer**
- In-memory byte stream used to generate PDF reports
- Enables direct PDF creation and browser download without disk writes
- Used in backend report generation endpoint

**Decorator (Python)**
- Function wrapper that modifies behavior
- `@app.post(...)` registers FastAPI route handlers
- `@lru_cache` reuses expensive objects like loaded models

### File Formats

**HDF5 (.h5)**
- Hierarchical Data Format Version 5
- Stores large numerical arrays and metadata
- Used for: Model architecture, weights, training config
- Binary format: Not human-readable

### Geographic & Geolocation Terminology

**Latitude**
- Angular distance north or south from Earth's equator
- Range: -90° (South Pole) to +90° (North Pole)
- Used in coordinate pairs (lat, lon)

**Longitude**
- Angular distance east or west from Prime Meridian (0°)
- Range: -180° (International Date Line West) to +180° (East)
- Used in coordinate pairs (lat, lon)

**Haversine Formula**
- Mathematical formula to calculate great-circle distance between two points on Earth
- Accounts for spherical shape of Earth (radius ~6,371 km)
- Input: Two (latitude, longitude) pairs
- Output: Distance in kilometers
- Accuracy: Excellent for distances, more accurate than equirectangular approximation

**Geocoding**
- Process of converting addresses to geographic coordinates (lat/lon)
- Reverse geocoding: Converting coordinates to addresses
- Example: "Mumbai, India" → (19.0760, 72.8777)

**Map Services & Location APIs**

**OpenStreetMap (OSM)**
- Free, open-source map tile provider used by Leaflet
- No API key required for baseline tiles
- Used for frontend map display in `frontend/components/map-section.tsx`

**Leaflet**
- Browser-based JavaScript mapping library for interactive maps
- Supports markers, popups, layers, and custom tile providers
- Used with React via `react-leaflet` for client-side map rendering

**Google Places API**
- Provides nearby hospital and doctor search results
- Requires `GOOGLE_MAPS_API_KEY` in `backend/.env`
- Returns facility name, address, rating, opening hours, and phone number

**Geocoding & Reverse Geocoding**
- Converts between address text and geographic coordinates
- Current implementation uses Google Maps services via backend API
- Useful for user-entered address search and map marker placement

---

## Key Features & Implementation

### 1. Live Camera Capture (React 19)
**Component:** `frontend/components/camera-capture.tsx`
**Technology:** HTML5 `navigator.mediaDevices.getUserMedia`
**Features:**
- Real-time video preview at 30fps
- Canvas-based image capture
- Automatic quality optimization (95% JPEG compression)
- Retake functionality
- Async blob storage via `useRef` (prevents timing issues)

**Critical Implementation Detail (The Fix):**
```typescript
// PROBLEM: canvas.toBlob() is asynchronous, blob isn't ready when needed
// SOLUTION: Store blob immediately in useRef during capture

const capturedBlobRef = useRef<Blob | null>(null)

// During capture - blob callback fires and stores immediately
canvasRef.current?.toBlob((blob) => {
  capturedBlobRef.current = blob  // Store NOW, use LATER
}, 'image/jpeg', 0.95)

// During submit - blob already stored, ready to use
const blob = capturedBlobRef.current
```

### 2. Medical Advice Smart Parser
**Component:** `frontend/components/medical-advice.tsx`
**Problem:** Raw medical text displayed as unreadable paragraph
**Solution:** Intelligent multi-delimiter text splitting
**Regex Pattern:** `/(?<=[.!?])\s+(?=[A-Z])|•/`
**Splits On:**
- Bullet points (•)
- Line breaks (\n)
- Sentence boundaries ([.!?] followed by space + uppercase letter)

**Output:** Numbered list with 3-8 distinct advice items

### 3. Interactive Leaflet Map (OSM Tiles)
**Component:** `frontend/components/map-section.tsx`
**Technology:** Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap
**Why Not Google Maps?**
- No API key required for base functionality
- 39KB Leaflet vs 150KB+ Google Maps
- Privacy-respecting, community-maintained
- Offline fallback possible

**Features:**
- Auto-center button (geolocation)
- 15-30 specialist markers (color-coded by type)
- Click popups showing name, address, distance, rating
- Drag to pan, scroll to zoom
- Mobile touch-friendly

**SSR Fix (Critical):**
```typescript
// Leaflet uses window/document - NOT available in SSR!
const MapSection = dynamic(
  () => import("@/components/map-section").then(m => m.MapSection),
  { ssr: false }  // Disable server-side rendering for this component
)
```

### 4. Google Places API Integration
**Endpoint:** `POST /nearby` in backend
**Input:** User latitude, longitude, search radius
**Process:**
1. Call Google Places Nearby Search API
2. Get 20+ results sorted by distance
3. Calculate accurate distance (Haversine formula)
4. Filter by radius
5. Return top 10 with metadata

**Alternative:** Could use OpenStreetMap's Overpass API (free, no key)

### 5. VGG19 Model Inference Pipeline
**Model:** Pre-trained VGG19 + Custom Dense Layers
**Input:** 1×224×224×3 normalized image array
**Processing:**
1. VGG19 feature extraction (frozen weights)
2. Custom Dense(3) layer with softmax
3. Output: 3 probabilities summing to 1.0

**Performance:**
- <100ms on CPU
- <20ms on GPU

### 6. PDF Report Generation
**Technology:** ReportLab
**Sections:**
- Header with burn classification
- Summary table (prediction, confidence, risk level)
- Input image (embedded)
- Probability breakdown (all 3 classes)
- Medical advice (formatted list)
- Legal disclaimer

---

## Installation & Setup (Complete Guide)

### Step 1: Clone Repository
```bash
git clone https://github.com/UtshoDeyTech/Skin-Burn-Detection.git
cd Skin-Burn-Detection
```

### Step 2: Backend Setup (Python + FastAPI)

**Create Virtual Environment:**
```bash
# Windows
python -m venv env
env\Scripts\activate

# macOS/Linux
python3 -m venv env
source env/bin/activate
```

**Install Dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Configure Environment:**
```bash
# Create .env file in backend/ directory
GOOGLE_MAPS_API_KEY=your_actual_key_here
DEBUG=True
SECRET_KEY=dev_secret_key_change_in_production
```

**Get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Places API"
4. Create API key (Credentials → Create Credentials → API Key)
5. Add to `backend/.env`

**Start Backend Server:**
```bash
cd backend
uvicorn app:app --reload --host localhost --port 8000
```

**Verify:**
- Visit http://localhost:8000/docs (Swagger API docs)
- Should show 3 endpoints: `/predict`, `/nearby`, `/health`

### Step 3: Frontend Setup (React + Next.js)

**Install Dependencies:**
```bash
cd frontend
npm install
# or
pnpm install
```

**Configure Environment:**
```bash
# Create .env.local in frontend/ directory
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start Development Server:**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Verify:**
- Visit http://localhost:3000
- Should load with upload/camera components visible

### Step 4: Full-Stack Testing

**Test Image Upload:**
1. Go to http://localhost:3000
2. Click "Upload Image"
3. Select a burn image (JPG/PNG)
4. Click predict
5. Should get classification in <100ms

**Test Camera Capture:**
1. Click "Use Camera"
2. Allow camera permission
3. Take photo
4. Click "Use This Photo"
5. Should submit and predict

**Test Map Feature:**
1. Get classification (any burn)
2. Scroll to map section
3. Enter your latitude/longitude (or use auto-detect)
4. Should show 15-30 nearby hospitals
5. Click markers to see details

### Troubleshooting

**Backend errors:**
- "GOOGLE_MAPS_API_KEY not found": Add to `.env` file
- "Model not found": Ensure `my_model.h5` in project root
- "Port 8000 already in use": Change port in uvicorn command

**Frontend errors:**
- "Can't fetch localhost:8000": Check backend is running
- "window is not defined": Should be fixed with dynamic imports
- "Camera not working": Check browser permissions

---

## API Documentation (v2.0)

### Authentication
No authentication required (open endpoints)

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. POST /predict
**Burn Classification Prediction**

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <binary JPEG/PNG image>
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -F "file=@/path/to/burn_image.jpg"
```

**Response (200 OK):**
```json
{
  "predicted_class": "2nd Degree Burn",
  "confidence": 0.87,
  "risk_level": "Moderate Risk",
  "probabilities": {
    "1st Degree Burn": 0.05,
    "2nd Degree Burn": 0.87,
    "3rd Degree Burn": 0.08
  },
  "medical_advice": "Immerse in cool water (10-15 minutes). Apply antibiotic ointment..."
}
```

**Response Fields:**
- `predicted_class`: String - One of [1st, 2nd, 3rd] Degree Burn
- `confidence`: Float (0-1) - Model confidence in prediction
- `risk_level`: String - Low Risk, Moderate Risk, or High Risk
- `probabilities`: Object - Probability for each class (sum = 1.0)
- `medical_advice`: String - First aid guidance for predicted class

**Error Response (400):**
```json
{
  "detail": "No valid image provided"
}
```

**Performance:**
- Response Time: 50-150ms
- Model Latency: 80ms average
- API Overhead: 10-30ms

---

#### 2. POST /nearby
**Find Nearby Medical Specialists**

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "radius_km": 5.0
}
```

**Required Parameters:**
- `latitude`: Float - User's latitude (-90 to +90)
- `longitude`: Float - User's longitude (-180 to +180)
- `radius_km`: Float - Search radius in kilometers (1-15)

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/nearby" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777, "radius_km": 5}'
```

**Response (200 OK):**
```json
{
  "count": 10,
  "specialists": [
    {
      "name": "Mumbai Central Hospital",
      "address": "Hospital Rd, Mumbai 400001",
      "latitude": 19.0767,
      "longitude": 72.8765,
      "distance_km": 0.12,
      "rating": 4.5,
      "types": ["hospital", "point_of_interest", "establishment"]
    },
    {
      "name": "Dr. Sharma Clinic",
      "address": "Medical Plaza, Mumbai 400002",
      "latitude": 19.0845,
      "longitude": 72.8956,
      "distance_km": 1.25,
      "rating": 4.8,
      "types": ["doctor", "health"]
    }
  ]
}
```

**Response Fields:**
- `count`: Integer - Number of results returned
- `specialists`: Array - List of nearby medical facilities
  - `name`: String - Facility name
  - `address`: String - Full address
  - `latitude`: Float - GPS latitude
  - `longitude`: Float - GPS longitude
  - `distance_km`: Float - Distance from user (accurate to 100m)
  - `rating`: Float (1-5) - Google rating
  - `types`: Array - Facility categories

**Performance:**
- Response Time: 300-800ms (depends on Google API)
- Bottleneck: Google Places API network latency
- Cache: No caching (results change with time)

**Error Response (400):**
```json
{
  "detail": "Invalid latitude/longitude"
}
```

---

#### 3. GET /health
**Health Check / API Status**

**Request:**
```bash
curl "http://localhost:8000/health"
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "api_version": "2.0"
}
```

**Purpose:** Monitor server status, model availability

**Performance:**
- Response Time: <1ms
- no external dependencies

---

## Development Workflow

### Local Development Commands

**Start Everything (Two Terminals):**

Terminal 1 (Backend):
```bash
cd backend
source env/Scripts/activate  # Windows: env\Scripts\activate
uvicorn app:app --reload --host localhost --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Testing

**API Testing (curl):**
```bash
# Test image prediction
curl -X POST "http://localhost:8000/predict" \
  -F "file=@test_burn.jpg"

# Test nearby search
curl -X POST "http://localhost:8000/nearby" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777, "radius_km": 5}'

# Test health
curl "http://localhost:8000/health"
```

**Frontend Testing:**
- Manual UI testing: http://localhost:3000
- Test camera permission prompt
- Test image upload drag-drop
- Test all result displays

### Code Organization

**Backend Best Practices:**
- All routes in `backend/app.py` (keep monolithic for simplicity)
- Use type hints (Pydantic models for requests)
- Separate concerns: preprocessing, inference, response assembly
- Use `@app.post`, `@app.get` decorators for clarity
- Cache expensive operations (model loading)

**Frontend Best Practices:**
- One component per file (image-upload.tsx, camera-capture.tsx, etc.)
- Use hooks for state (useState, useRef, useCallback)
- Type all props with TypeScript interfaces
- Keep components pure and reusable
- Use dynamic imports for large components

### Version Control

**Important .gitignore entries:**
```
env/                    # Python venv
node_modules/          # npm dependencies
.env                   # API keys
.env.local            # Frontend secrets
__pycache__/          # Python cache
.next/                # Next.js build
dist/                 # Build output
*.pyc                 # Compiled Python
.DS_Store             # macOS files
```

---

## Support & Documentation

**Useful Resources:**
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TensorFlow.js vs TensorFlow Python](https://js.tensorflow.org)
- [Leaflet Documentation](https://leafletjs.com)
- [Google Maps Places API](https://developers.google.com/maps/documentation/places)

**Getting Help  :**
- Check `.env` file configuration first
- Verify both servers are running on correct ports
- Check browser console for JavaScript errors
- Check terminal output for Python exceptions
- Review API response status codes (200, 400, 500)

---

## Project Overview

### Hardware Requirements
- **Minimum:** 4GB RAM, 2GHz processor
- **Recommended:** 8GB RAM, GPU (NVIDIA CUDA)
- **Optimal:** 16GB+ RAM, NVIDIA RTX series GPU

### Software Requirements
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Python:** 3.9, 3.10, or 3.11
- **pip:** Latest version (for dependency management)
- **Virtual Environment:** Python venv module

### Network Requirements
- **First Run:** Internet required (download pre-trained weights)
- **Subsequent Runs:** Offline capable
- **Model Size:** ~550MB download

---

## Performance Metrics

### Inference Performance
- **Single Image:** 100-500ms (depending on hardware)
- **GPU Acceleration:** 2-5x faster than CPU
- **Bottleneck:** Data transfer between CPU and GPU

### Training Performance (if retraining)
- **Per Epoch:** 5-15 minutes (GPU dependent)
- **Total (50 epochs):** 4-12 hours
- **Dataset Size:** Affects training time linearly

### Web Application Performance
- **Page Load:** <1 second
- **Prediction + Display:** 1-2 seconds
- **PDF Generation:** 2-5 seconds
- **Total User Experience:** <5 seconds end-to-end

---

## File Manifest

| File | Size | Purpose | Format |
|------|------|---------|--------|
| my_model.h5 | ~550MB | Trained model for inference | HDF5 Binary |
| backend/app.py | ~8KB | FastAPI backend service | Python 3 |
| backend/requirements.txt | ~2KB | Backend dependency list | Text |
| backend/users.json | ~1KB | Legacy local user store | JSON |
| frontend/package.json | ~5KB | Frontend dependencies | JSON |
| frontend/next.config.mjs | ~1KB | Next.js configuration | JavaScript |
| frontend/app/auth/page.tsx | ~10KB | Authentication UI | TypeScript React |
| frontend/app/app/page.tsx | ~15KB | Main app UI | TypeScript React |
| frontend/lib/firebase.ts | ~1KB | Firebase init and Firestore config | TypeScript |
| frontend/lib/report-history.ts | ~2KB | Firestore report history helpers | TypeScript |
| frontend/middleware.ts | ~0.5KB | Route protection middleware | TypeScript |
| firestore.rules | ~1KB | Firestore security rules | Text |
| TECHNICAL_DOCUMENTATION.md | ~40KB | Project documentation | Markdown |

---

## Future Improvements & Roadmap

### Geolocation Feature Enhancements (NEW)
- [ ] Integrate Google Maps Places API for real-time doctor ratings
- [ ] Add appointment booking integration with major hospital systems
- [ ] Implement user location search history
- [ ] Add filtering by hospital type (government/private/NGO)
- [ ] Real-time hospital occupancy/bed availability (API integration)
- [ ] Multi-language support for facility information
- [ ] Offline location caching for areas with no internet
- [ ] Telemedicine consultation links for nearby doctors
- [ ] Hospital emergency services availability status
- [ ] Ambulance service finder integration

### Model Enhancements
- [ ] Implement actual fine-tuning (unfreeze last 2-3 VGG19 layers)
- [ ] Try ResNet50 or EfficientNet architectures
- [ ] Add class weights for imbalanced datasets
- [ ] Ensemble multiple models for higher accuracy

### Application Features
- [ ] Model confidence threshold filtering
- [ ] Batch image processing
- [ ] Historical prediction logging
- [ ] User authentication and profiles
- [ ] Integration with medical databases
- [ ] Multi-language support

### Performance Optimization
- [ ] Model quantization for mobile deployment
- [ ] TensorFlow Lite conversion
- [ ] ONNX format export
- [ ] GPU optimization
- [ ] Parallel batch processing

### Deployment & DevOps
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/Azure/GCP)
- [ ] CI/CD pipeline setup
- [ ] Automated testing suite
- [ ] Model versioning strategy
- [ ] Firebase project configuration
- [ ] Environment variable management
- [ ] SSL certificate setup for production

---

## References & Resources

### Documentation
- [TensorFlow Official Docs](https://www.tensorflow.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [VGG19 Paper](https://arxiv.org/abs/1409.1556)
- [ImageNet Database](http://www.image-net.org/)

### Related Topics
- Transfer Learning: Reusing pre-trained knowledge
- Computer Vision: Image processing and analysis
- Deep Learning: Neural networks with multiple layers
- Web Development: Building interactive applications

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 2.0 | May 11, 2026 | Complete migration from Streamlit to React/Next.js + FastAPI. Added Firebase authentication, JWT tokens, user session management, Firestore database for report history, optimized prediction flow with background saving, route protection middleware | Documentation Team |
| 1.0 | April 8, 2026 | Initial comprehensive documentation | Documentation Team |

---

**Last Updated:** April 8, 2026  
**Maintainer:** UtshoDeyTech  
**License:** MIT (assumed from GitHub repo)

---

*This document serves as the single source of truth for all technical aspects of the Skin Burn Detection project. Keep it updated as the project evolves.*
