import os
import math
import re
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
PROJECT_ROOT = os.path.dirname(BASE_DIR)  # Parent directory (project root)
MODEL_PATH = os.path.join(PROJECT_ROOT, 'my_model.h5')
USERS_PATH = os.path.join(BASE_DIR, 'users.json')

import json
import io
import urllib.parse
from functools import lru_cache
from typing import List, Optional

import numpy as np
import requests
import tensorflow as tf
from fastapi import FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Image as RLImage, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# Constants
IMG_SIZE = (224, 224)
CLASSES = ['1st Degree Burn', '2nd Degree Burn', '3rd Degree Burn']
GOOGLE_MAPS_API_KEY_ENV = 'GOOGLE_MAPS_API_KEY'
GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
GOOGLE_NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'
SEARCH_KEYWORDS = 'hospital clinic doctor dermatologist skin care medical center'
SEARCH_RADIUS_KM = 5
MAX_SEARCH_RESULTS = 10
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
ALGORITHM = 'HS256'
DEFAULT_FRONTEND_ORIGINS = (
    'http://localhost:3000,'
    'http://127.0.0.1:3000,'
    'https://*.vercel.app'
)


def get_allowed_origins() -> list[str]:
    configured_origins = os.environ.get('FRONTEND_ORIGINS', DEFAULT_FRONTEND_ORIGINS)
    return [origin.strip() for origin in configured_origins.split(',') if origin.strip() and '*' not in origin]


def get_allowed_origin_regex() -> Optional[str]:
    configured_origins = os.environ.get('FRONTEND_ORIGINS', DEFAULT_FRONTEND_ORIGINS)
    wildcard_origins = [origin.strip() for origin in configured_origins.split(',') if '*' in origin]
    if not wildcard_origins:
        return None

    patterns = []
    for origin in wildcard_origins:
        escaped = origin.replace('.', r'\.').replace('*', r'[^.]+')
        patterns.append(escaped)
    return '^(' + '|'.join(patterns) + ')$'

app = FastAPI(title='Skin Burn Detection API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=get_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.middleware('http')
async def add_explicit_cors_headers(request: Request, call_next):
    origin = request.headers.get('origin')
    allowed_origins = set(get_allowed_origins())
    allowed_origin_regex = get_allowed_origin_regex()
    allow_origin = None

    if origin:
        if origin in allowed_origins:
            allow_origin = origin
        elif allowed_origin_regex and re.match(allowed_origin_regex, origin):
            allow_origin = origin

    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': allow_origin or '',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Origin, User-Agent, Referer, Accept-Encoding',
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
        }
        return Response(status_code=204, headers=headers)

    response = await call_next(request)
    if allow_origin:
        response.headers['Access-Control-Allow-Origin'] = allow_origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept, Origin, User-Agent, Referer, Accept-Encoding'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Vary'] = 'Origin'
    return response

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def get_secret_key() -> str:
    return os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')


def get_google_api_key() -> str:
    api_key = os.environ.get(GOOGLE_MAPS_API_KEY_ENV, '').strip()
    if not api_key:
        raise HTTPException(status_code=500, detail='Google Maps API key is not configured.')
    return api_key


@lru_cache(maxsize=1)
def load_model() -> tf.keras.Model:
    return tf.keras.models.load_model(MODEL_PATH)


def preprocess_image(img: Image.Image) -> np.ndarray:
    image = img.convert('RGB').resize(IMG_SIZE)
    image_array = tf.keras.utils.img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = image_array / 255.0
    return image_array


def get_risk_label(class_name: str) -> str:
    if class_name == '1st Degree Burn':
        return 'Low Risk'
    if class_name == '2nd Degree Burn':
        return 'Moderate Risk'
    if class_name == '3rd Degree Burn':
        return 'High Risk'
    return 'Unknown'


def get_risk_level(class_name: str) -> str:
    if class_name == '1st Degree Burn':
        return 'low'
    if class_name == '2nd Degree Burn':
        return 'moderate'
    if class_name == '3rd Degree Burn':
        return 'high'
    return 'unknown'


def get_medical_advice(class_name: str) -> str:
    if class_name == '1st Degree Burn':
        return (
            'First aid:\n'
            '• Cool the burn under running water for 10 to 15 minutes.\n'
            '• Do not use ice directly on the skin.\n'
            '• Gently remove rings, bracelets, or tight clothing near the area.\n'
            '• Apply a soothing lotion or aloe vera if the skin is not open.\n\n'
            'Watch for:\n'
            '• Increasing redness, swelling, or pain.\n'
            '• Burn on face, hands, feet, genitals, or a large area.\n'
            '• Fever or pus, which may indicate infection.'
        )

    if class_name == '2nd Degree Burn':
        return (
            'First aid:\n'
            '• Cool the burn with running water for 10 to 15 minutes.\n'
            '• Cover the area with a clean, non-stick cloth or sterile dressing.\n'
            '• Do not burst blisters.\n'
            '• Keep the area clean and avoid applying ice, butter, or toothpaste.\n\n'
            'Medical attention:\n'
            '• Seek medical help if the burn is large, deep, or on sensitive areas.\n'
            '• Watch for signs of infection like pus, bad smell, fever, or increasing pain.'
        )

    if class_name == '3rd Degree Burn':
        return (
            'Emergency care:\n'
            '• Call emergency services or go to the hospital immediately.\n'
            '• Cover the burn loosely with a clean, dry cloth or sterile dressing.\n'
            '• Do not apply ice, creams, ointments, or home remedies.\n'
            '• Do not remove clothing stuck to the burn.\n\n'
            'Important:\n'
            '• Watch for shock signs like weakness, pale skin, fast breathing, or confusion.\n'
            '• This is a severe burn and needs urgent medical treatment.'
        )

    return 'Medical advice not available.'


class PredictionResponse(BaseModel):
    class_name: str
    confidence: float
    probabilities: List[float]
    risk: str
    risk_level: str
    advice: str


class NearbyPlace(BaseModel):
    name: str
    type: str
    address: str
    phone: str
    rating: Optional[float]
    distance_km: float
    maps_url: str
    lat: Optional[float]
    lon: Optional[float]


class NearbyResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    places: List[NearbyPlace]


class NearbyRequest(BaseModel):
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AuthRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


def load_users() -> dict:
    if not os.path.exists(USERS_PATH):
        return {}
    try:
        with open(USERS_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def save_users(users: dict) -> None:
    with open(USERS_PATH, 'w', encoding='utf-8') as file:
        json.dump(users, file, indent=2)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_auth_input(payload: AuthRequest) -> tuple[str, str]:
    email = normalize_email(payload.email)
    password = payload.password.strip()

    if not email:
        raise HTTPException(status_code=400, detail='Email is required.')
    if '@' not in email:
        raise HTTPException(status_code=400, detail='Please provide a valid email address.')
    if len(password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters long.')
    return email, password


def create_access_token(email: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        'sub': email,
        'exp': expires_at,
    }
    return jwt.encode(payload, get_secret_key(), algorithm=ALGORITHM)


def geocode_address(address: str, api_key: str) -> Optional[dict]:
    params = {'address': address, 'key': api_key}
    response = requests.get(GOOGLE_GEOCODE_URL, params=params, timeout=10)
    data = response.json()
    if data.get('status') == 'OK' and data.get('results'):
        result = data['results'][0]
        location = result['geometry']['location']
        return {
            'latitude': location['lat'],
            'longitude': location['lng'],
            'formatted_address': result.get('formatted_address', address),
        }
    raise HTTPException(status_code=400, detail=f"Geocoding error: {data.get('status')} - {data.get('error_message', 'Unknown')}")


def fetch_place_details(place_id: str, api_key: str) -> dict:
    params = {
        'place_id': place_id,
        'fields': 'name,formatted_address,formatted_phone_number,rating,website,types',
        'key': api_key,
    }
    response = requests.get(GOOGLE_PLACE_DETAILS_URL, params=params, timeout=10)
    data = response.json()
    if data.get('status') == 'OK':
        return data.get('result', {})
    return {}


def format_place_type(types: List[str]) -> str:
    if not types:
        return 'Medical Facility'
    type_map = {
        'hospital': 'Hospital',
        'doctor': 'Doctor',
        'clinic': 'Clinic',
        'dermatologist': 'Dermatologist',
        'medical_center': 'Medical Center',
        'health': 'Healthcare',
    }
    for t in types:
        if t in type_map:
            return type_map[t]
    return types[0].replace('_', ' ').title()


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in kilometers using the Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def fetch_nearby_places(latitude: float, longitude: float, api_key: str) -> List[dict]:
    params = {
        'location': f'{latitude},{longitude}',
        'radius': int(SEARCH_RADIUS_KM * 1000),
        'keyword': SEARCH_KEYWORDS,
        'key': api_key,
    }
    response = requests.get(GOOGLE_NEARBY_SEARCH_URL, params=params, timeout=10)
    data = response.json()
    if data.get('status') != 'OK':
        if data.get('status') == 'ZERO_RESULTS':
            return []
        raise HTTPException(status_code=400, detail=f"Nearby search error: {data.get('status')} - {data.get('error_message', 'Unknown')}")

    places = []
    for result in data.get('results', [])[:MAX_SEARCH_RESULTS]:
        place_id = result.get('place_id')
        details = fetch_place_details(place_id, api_key) if place_id else {}
        place_lat = result.get('geometry', {}).get('location', {}).get('lat')
        place_lon = result.get('geometry', {}).get('location', {}).get('lng')
        address = details.get('formatted_address') or result.get('vicinity', 'Address not available')
        phone = details.get('formatted_phone_number', 'N/A')
        rating = details.get('rating', None)
        types = details.get('types', result.get('types', []))
        place_type = format_place_type(types)
        distance = calculate_distance(latitude, longitude, place_lat, place_lon) if place_lat and place_lon else 0.0
        maps_url = (
            f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(address)}"
            f"&query_place_id={place_id}"
        )
        places.append({
            'name': details.get('name', result.get('name', 'Unknown place')),
            'type': place_type,
            'address': address,
            'phone': phone,
            'rating': rating,
            'lat': place_lat,
            'lon': place_lon,
            'distance_km': round(distance, 2),
            'maps_url': maps_url,
        })

    return sorted([p for p in places if p['distance_km'] is not None], key=lambda x: x['distance_km'])


@app.get('/')
def root():
    return {'status': 'ok', 'service': 'Skin Burn Detection API'}


@app.get('/health')
def health():
    """Health check endpoint to verify backend is running."""
    return {'status': 'ok'}


@app.post('/register', response_model=UserResponse, status_code=201)
def register(payload: AuthRequest):
    email, password = validate_auth_input(payload)
    users = load_users()

    if email in users:
        raise HTTPException(status_code=400, detail='An account with this email already exists.')

    users[email] = {
        'email': email,
        'password_hash': pwd_context.hash(password),
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    save_users(users)
    return UserResponse(email=email)


@app.post('/login', response_model=TokenResponse)
def login(payload: AuthRequest):
    email, password = validate_auth_input(payload)
    users = load_users()
    user = users.get(email)

    if not user or not pwd_context.verify(password, user['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid email or password.')

    token = create_access_token(email)
    return TokenResponse(
        access_token=token,
        token_type='bearer',
        user=UserResponse(email=email),
    )


@app.post('/predict', response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read()))
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid image file.')

    model = load_model()
    img_array = preprocess_image(image)
    prediction = model.predict(img_array, verbose=0)
    prediction = prediction[0]
    class_name = CLASSES[int(np.argmax(prediction))]
    confidence = float(np.max(prediction) * 100.0)
    advice = get_medical_advice(class_name)
    return PredictionResponse(
        class_name=class_name,
        confidence=round(confidence, 2),
        probabilities=[float(x * 100.0) for x in prediction.tolist()],
        risk=get_risk_label(class_name),
        risk_level=get_risk_level(class_name),
        advice=advice,
    )


@app.post('/nearby', response_model=NearbyResponse)
def nearby(search: NearbyRequest):
    api_key = get_google_api_key()
    if search.latitude is not None and search.longitude is not None:
        latitude = search.latitude
        longitude = search.longitude
        location_name = 'Current location'
    elif search.address:
        location = geocode_address(search.address, api_key)
        latitude = location['latitude']
        longitude = location['longitude']
        location_name = location['formatted_address']
    else:
        raise HTTPException(status_code=400, detail='Please provide an address or coordinates.')

    places = fetch_nearby_places(latitude, longitude, api_key)
    return NearbyResponse(
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        places=[NearbyPlace(**place) for place in places],
    )


@app.post('/report')
async def report(
    file: UploadFile = File(...),
    class_name: str = Form(...),
    confidence: float = Form(...),
    probabilities: str = Form(...),
    advice: str = Form(...),
):
    try:
        probs = json.loads(probabilities)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid probabilities format.')

    try:
        image = Image.open(io.BytesIO(await file.read()))
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid image file.')

    buffer = generate_pdf_report(image, class_name, confidence, probs, advice)
    return StreamingResponse(buffer, media_type='application/pdf', headers={'Content-Disposition': 'attachment; filename=burn_report.pdf'})


def generate_pdf_report(image: Image.Image, class_name: str, confidence: float, probabilities: List[float], advice: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleCenter', parent=styles['Title'], alignment=TA_CENTER, textColor=colors.HexColor('#1f3c88'), fontSize=22, leading=28, spaceAfter=10)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], alignment=TA_CENTER, textColor=colors.HexColor('#555555'), fontSize=10, leading=13, spaceAfter=14)
    heading_style = ParagraphStyle('HeadingBlue', parent=styles['Heading2'], textColor=colors.HexColor('#1f3c88'), spaceBefore=10, spaceAfter=8)
    normal_style = ParagraphStyle('NormalBody', parent=styles['BodyText'], fontSize=10.5, leading=15, spaceAfter=6)
    small_style = ParagraphStyle('SmallBody', parent=styles['BodyText'], fontSize=9, leading=12, textColor=colors.grey)

    content = []
    content.append(Paragraph('Skin Burn Detection Report', title_style))
    content.append(Paragraph('AI-based burn classification summary', subtitle_style))
    content.append(Spacer(1, 8))

    risk = get_risk_label(class_name)
    summary_data = [
        ['Report Type', 'Burn Classification'],
        ['Model', 'AI CNN Model'],
        ['Prediction', class_name],
        ['Confidence', f'{confidence:.2f}%'],
        ['Risk Level', risk],
    ]
    summary_table = Table(summary_data, colWidths=[140, 320])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f2f6ff')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10.5),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('GRID', (0, 0), (-1, -1), 0.6, colors.HexColor('#d0d7e2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#aab7c4')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f7f9fc')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    content.append(summary_table)
    content.append(Spacer(1, 16))

    content.append(Paragraph('Input Image', heading_style))
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    pdf_image = RLImage(img_buffer)
    pdf_image._restrictSize(320, 320)
    content.append(pdf_image)
    content.append(Spacer(1, 16))

    content.append(Paragraph('Detailed Probabilities', heading_style))
    prob_data = [['Class', 'Probability']]
    for i, prob in enumerate(probabilities):
        prob_data.append([CLASSES[i], f'{prob:.2f}%'])
    prob_table = Table(prob_data, colWidths=[240, 220])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f3c88')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d0d7e2')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7f9fc')]),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ]))
    content.append(prob_table)
    content.append(Spacer(1, 16))

    content.append(Paragraph('Medical Advice', heading_style))
    content.append(Paragraph(advice.replace('\n', '<br/>'), normal_style))
    content.append(Spacer(1, 14))
    content.append(Paragraph('Disclaimer', heading_style))
    content.append(Paragraph(
        'This report is generated by an AI model for academic/demo use only and is not a medical diagnosis. '
        'Please consult a qualified healthcare professional for any burn injury.',
        small_style
    ))
    doc.build(content)
    buffer.seek(0)
    return buffer
