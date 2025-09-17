import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export type Venue = {
  id: number
  name: string
  lat: number
  lng: number
  cheapestBeer: number
  happyHourEnd: string
  address: string
}

function isHappyHourActive(happyHourEnd: string, now: Date = new Date()): boolean {
  const [hh, mm] = happyHourEnd.split(':').map(Number)
  const end = new Date(now)
  end.setHours(hh, mm, 0, 0)
  return now.getTime() <= end.getTime()
}

function createBeerSvg(color: string): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <circle cx="18" cy="18" r="16" fill="${color}"/>
    </g>
    <g transform="translate(10,9)">
      <rect x="3" y="6" width="9" height="9" rx="2" fill="#fff" stroke="#fff" stroke-width="1.5"/>
      <rect x="0.5" y="5" width="11" height="8" rx="2" fill="#fff" stroke="#fff" stroke-width="1.5"/>
      <rect x="2" y="7" width="7" height="6" rx="1" fill="#ffcc00"/>
      <rect x="11.5" y="6.5" width="3.5" height="5" rx="1.75" fill="#fff" stroke="#fff"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

export default function GoogleMapsBeerMap() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [selected, setSelected] = useState<Venue | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Env anahtarı
  const apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || (process as any)?.env?.VITE_GOOGLE_MAPS_API_KEY) as string

  useEffect(() => {
    async function init() {
      try {
        if (!mapRef.current) return

        // JSON dosyasını yükle
        const dataResp = await fetch('/data/data.json')
        const list: Venue[] = await dataResp.json()
        setVenues(list)

        // Google Maps yükleyici
        const loader = new Loader({ apiKey, version: 'weekly' })
        await loader.load()

        const center = { lat: list[0]?.lat ?? 41.015137, lng: list[0]?.lng ?? 28.97953 }
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false,
        })
        mapInstanceRef.current = map

        // Marker ekleme
        const created: google.maps.Marker[] = []
        list.forEach((v) => {
          const active = isHappyHourActive(v.happyHourEnd)
          const color = active ? '#FFD700' : '#0B3D91'
          const marker = new google.maps.Marker({
            position: { lat: v.lat, lng: v.lng },
            map,
            title: v.name,
            icon: {
              url: createBeerSvg(color),
              scaledSize: new google.maps.Size(36, 36),
            },
          })
          marker.addListener('click', () => {
            map.panTo({ lat: v.lat, lng: v.lng })
            setSelected(v)
          })
          created.push(marker)
        })
        markersRef.current = created
      } catch (err) {
        console.error('Map init error:', err)
      }
    }

    if (apiKey) init()
  }, [apiKey])

  return (
    <div className="flex w-full h-[calc(100vh-64px)]">
      <div className="w-2/3 h-full min-h-[500px]" ref={mapRef} />
      <div className="w-1/3 h-full border-l border-gray-200 p-6 overflow-y-auto bg-white">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{selected.name}</h2>
                <div className="text-sm text-gray-600 mt-1">{selected.address}</div>
              </div>
              {isHappyHourActive(selected.happyHourEnd) ? (
                <span className="inline-block px-2 py-1 rounded bg-yellow-200 text-yellow-900 text-xs font-medium whitespace-nowrap">Happy hour devam ediyor</span>
              ) : (
                <span className="inline-block px-2 py-1 rounded bg-blue-900 text-white text-xs font-medium whitespace-nowrap">Happy hour geçti</span>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">En ucuz bira</dt>
                  <dd className="font-medium text-gray-900">{selected.cheapestBeer} ₺</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Happy hour bitiş</dt>
                  <dd className="font-medium text-gray-900">{selected.happyHourEnd}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Adres Linki</dt>
                  <dd className="font-medium text-gray-900">{selected.address}</dd>
                </div>
              </dl>
            </div>

            <div className="text-xs text-gray-400">Bir işaretçiye tıkladığınızda harita o konuma odaklanır.</div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-base font-medium text-gray-900 mb-1">Mekan seçilmedi</div>
              <div className="text-sm text-gray-500">Haritadaki bir işaretçiye tıklayarak detayları görün.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
