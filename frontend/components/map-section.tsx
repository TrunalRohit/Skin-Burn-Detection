"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { NearbyPlace } from "@/app/app/page"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapSectionProps {
  center: { latitude: number; longitude: number; label: string } | null
  nearbyPlaces: NearbyPlace[]
  searchLabel: string
}

const DEFAULT_POSITION: [number, number] = [20.0, 78.0]

const userIcon = L.divIcon({
  className: "leaflet-user-marker",
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:#0ea5e9;border:3px solid white;box-shadow:0 0 0 6px rgba(14,165,233,0.2);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

const placeIcon = L.divIcon({
  className: "leaflet-place-marker",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#14b8a6;border:2px solid white;box-shadow:0 0 0 4px rgba(20,184,166,0.22);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
})

function MapUpdater({ center, bounds }: { center: [number, number] | null; bounds: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] })
      return
    }
    if (center) {
      map.setView(center, 13)
    }
  }, [map, center, bounds])

  return null
}

export function MapSection({ center, nearbyPlaces, searchLabel }: MapSectionProps) {
  const [isMapReady, setIsMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  const visiblePlaces = useMemo(
    () => nearbyPlaces.filter((place) => place.lat !== undefined && place.lon !== undefined),
    [nearbyPlaces]
  )

  const position = center ? ([center.latitude, center.longitude] as [number, number]) : DEFAULT_POSITION

  const bounds = useMemo(() => {
    const points: [number, number][] = []
    if (center) points.push([center.latitude, center.longitude])
    visiblePlaces.forEach((place) => {
      points.push([place.lat!, place.lon!])
    })
    return points
  }, [center, visiblePlaces])

  useEffect(() => {
    setIsMapReady(true)
  }, [])

  const handleCenterMap = () => {
    if (!center || !mapRef.current) return
    mapRef.current.setView(position, 13, {
      animate: true,
    })
  }

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Map View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              {center
                ? `Showing nearby specialists around ${searchLabel}`
                : "Search a location or use current position to load the map."}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 h-[400px] md:h-[550px]">
            {!isMapReady ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 text-sm text-muted-foreground">
                Loading map...
              </div>
            ) : (
              <MapContainer
                center={position}
                zoom={center ? 13 : 5}
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full"
                style={{ minHeight: 400 }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="topright" />
                <MapUpdater center={center ? position : null} bounds={bounds} />

                {center && (
                  <Marker position={position} icon={userIcon}>
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">Your Search Location</p>
                        <p>{center.label}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {visiblePlaces.map((place, index) => (
                  <Marker
                    key={`${place.name}-${place.lat}-${place.lon}`}
                    position={[place.lat!, place.lon!]}
                    icon={placeIcon}
                  >
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">{place.name}</p>
                        <p className="text-muted-foreground">{place.type}</p>
                        <p>{place.address}</p>
                        {place.rating !== null && <p>Rating: {place.rating.toFixed(1)}</p>}
                        {place.phone && <p>Phone: {place.phone}</p>}
                        <p>Distance: {place.distance_km.toFixed(2)} km</p>
                        <a
                          href={place.maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          Open in Maps
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {center && (
              <div className="absolute bottom-4 right-4 z-10">
                <Button
                  variant="secondary"
                  className="gap-2 shadow-md"
                  onClick={handleCenterMap}
                >
                  <Navigation className="h-4 w-4" />
                  Center on Me
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
