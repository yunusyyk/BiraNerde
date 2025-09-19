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
  rating: number
  description?: string
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

function StarRating({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, value))
  const roundedToHalf = Math.round(clamped * 2) / 2
  const fullStars = Math.floor(roundedToHalf)
  const hasHalfStar = roundedToHalf - fullStars === 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const Star = ({ filled }: { filled: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'text-amber-500' : 'text-gray-300'}>
      <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  )

  const HalfStar = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-amber-500">
      <defs>
        <linearGradient id="halfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="currentColor"/>
          <stop offset="50%" stopColor="transparent"/>
        </linearGradient>
      </defs>
      <path fill="url(#halfGrad)" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      <path fill="none" stroke="currentColor" strokeWidth="1" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  )

  return (
    <div className="flex items-center" aria-label={`Puan: ${roundedToHalf} / 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} filled={true} />
      ))}
      {hasHalfStar && <HalfStar />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} filled={false} />
      ))}
    </div>
  )
}

export default function GoogleMapsBeerMap() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const [displayedVenues, setDisplayedVenues] = useState<Venue[]>([])
  const [selected, setSelected] = useState<Venue | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [sortByPriceAsc, setSortByPriceAsc] = useState<boolean>(false)
  const [showOnlyHappyHour, setShowOnlyHappyHour] = useState<boolean>(false)

  // Env anahtarı
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    async function init() {
      try {
        if (!mapRef.current) return

        // JSON dosyasını yükle
        const dataResp = await fetch('/data/data.json')
        const list: Venue[] = await dataResp.json()
        setAllVenues(list)
        setDisplayedVenues(list)

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

  // Listeyi buton durumlarına göre hesapla
  useEffect(() => {
    let next = [...allVenues]
    if (showOnlyHappyHour) {
      next = next.filter(v => isHappyHourActive(v.happyHourEnd))
    }
    if (sortByPriceAsc) {
      next.sort((a, b) => a.cheapestBeer - b.cheapestBeer)
    }
    setDisplayedVenues(next)
  }, [allVenues, sortByPriceAsc, showOnlyHappyHour])

  return (
    <div className="flex w-full h-[calc(100vh-64px)] flex-col md:flex-row">
      <div className="w-full md:w-2/3 h-80 md:h-full min-h-[320px]" ref={mapRef} />
      <div className="w-full md:w-1/3 md:h-full border-t md:border-t-0 md:border-l border-gray-200 p-4 md:p-6 overflow-y-auto bg-white">
        {selected ? (
          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={selected.rating} />
                  <span className="text-sm text-gray-600">{selected.rating.toFixed(1)}</span>
                </div>
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
                {selected.description && (
                  <div className="text-gray-800 leading-relaxed -mt-1">
                    {selected.description}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Happy hour bitiş</dt>
                  <dd className="font-medium text-gray-900">{selected.happyHourEnd}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Adres Linki</dt>
                  <dd className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2">
                    <a href={selected.address} target="_blank" rel="noopener noreferrer">Haritada aç</a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="text-xs text-gray-400">Bir işaretçiye tıkladığınızda harita o konuma odaklanır.</div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 mb-4 sticky top-0 bg-white/90 backdrop-blur z-10 py-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-md text-sm font-medium border ${sortByPriceAsc ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setSortByPriceAsc(v => !v)}
          >
            Fiyata göre sırala
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded-md text-sm font-medium border ${showOnlyHappyHour ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setShowOnlyHappyHour(v => !v)}
          >
            Sadece Happy Hour
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {displayedVenues.map(v => (
            <button
              key={v.id}
              onClick={() => {
                setSelected(v)
                const map = mapInstanceRef.current
                if (map) {
                  map.panTo({ lat: v.lat, lng: v.lng })
                  map.setZoom(Math.max(map.getZoom() ?? 12, 14))
                }
              }}
              className={`w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition ${selected?.id === v.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{v.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{isHappyHourActive(v.happyHourEnd) ? 'Happy hour aktif' : `Happy hour: ${v.happyHourEnd}`}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{v.cheapestBeer} ₺</div>
              </div>
            </button>
          ))}
          {displayedVenues.length === 0 && (
            <div className="text-sm text-gray-500">Kriterlere uyan mekan bulunamadı.</div>
          )}
        </div>
        {!selected && (
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
