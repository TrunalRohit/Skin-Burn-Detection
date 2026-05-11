"use client"

import {
  MapPin,
  Search,
  Navigation,
  Star,
  Phone,
  Clock,
  ExternalLink,
  Building2,
  Stethoscope,
  Hospital,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { NearbyPlace } from "@/app/app/page"

interface NearbySpecialistsProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  nearbyPlaces: NearbyPlace[]
  onSearch: () => void
  onUseLocation: () => void
  isSearching: boolean
  searchError?: string | null
}

const iconByType: Record<string, typeof Hospital> = {
  hospital: Hospital,
  clinic: Building2,
  dermatologist: User,
  specialist: Stethoscope,
}
export function NearbySpecialists({
  searchQuery,
  setSearchQuery,
  nearbyPlaces,
  onSearch,
  onUseLocation,
  isSearching,
  searchError,
}: NearbySpecialistsProps) {
  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MapPin className="h-6 w-6 text-primary" />
          Nearby Clinics and Skin Specialists
        </CardTitle>
        <p className="text-muted-foreground mt-1">
          Find medical professionals near you for burn treatment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl bg-muted/30 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onUseLocation}
              disabled={isSearching}
              className="gap-2 shrink-0"
            >
              <Navigation className="h-4 w-4" />
              Use My Location
            </Button>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Enter city, area, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={onSearch} disabled={isSearching} className="gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          {searchError ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {searchError}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUseLocation}
                  className="gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : isSearching ? (
            <div className="rounded-2xl border border-primary/50 bg-primary/10 p-3 text-sm text-primary">
              Fetching your location and nearby specialists...
            </div>
          ) : null}
        </div>

        {nearbyPlaces.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-base font-medium text-foreground">
              No specialists found yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Search by address or use your current location to locate nearby clinics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPlaces.map((place, index) => {
              const normalizedType = place.type.toLowerCase()
              const Icon = iconByType[normalizedType] || Building2
              return (
                <div
                  key={`${place.name}-${index}`}
                  className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {place.name}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {place.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground">
                          {place.rating ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{place.address}</span>
                    </div>
                    {place.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{place.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{place.distance_km.toFixed(1)} km away</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {place.type}
                    </span>
                    {place.rating && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        Rating {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(place.maps_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Maps
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
