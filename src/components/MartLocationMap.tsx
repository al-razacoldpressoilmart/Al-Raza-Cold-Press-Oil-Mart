import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Clock, Phone, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

interface MartLocationMapProps {
  storeConfig: StoreConfig;
  className?: string;
  isQuotaExceeded?: boolean;
}

interface StoreLocation {
  id: string;
  name: string;
  title: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  timings: string;
  schedule: string;
  phone: string;
}

const MART_LOCATIONS: StoreLocation[] = [
  {
    id: "lahore-flagship",
    name: "Al Raza Mart - Flagship Store & Live Pressing Mill",
    title: "Lahore Flagship Branch",
    address: "Shop #12-15, Main Organic Market Arcade, Commercial Area, Gulberg III",
    city: "Lahore, Punjab",
    lat: 31.5204,
    lng: 74.3587,
    timings: "Monday – Saturday: 9:00 AM – 9:00 PM (Sunday Closed)",
    schedule: "Daily 10:00 AM & 4:00 PM Live Machine Pressing (Sarson & Zaitoon)",
    phone: "0329-2832225",
  },
  {
    id: "karachi-hub",
    name: "Al Raza Pure Mart - South Regional Distribution Hub",
    title: "Karachi Distribution Hub",
    address: "Plot 42-B, Phase 2 Commercial Extension, DHA",
    city: "Karachi, Sindh",
    lat: 24.8607,
    lng: 67.0011,
    timings: "Monday – Saturday: 10:00 AM – 8:00 PM",
    schedule: "Daily Fresh Stock Arrivals & Direct Customer Pickup",
    phone: "0329-2832225",
  },
];

export const MartLocationMap: React.FC<MartLocationMapProps> = ({
  storeConfig,
  className = "",
  isQuotaExceeded = false,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation>(MART_LOCATIONS[0]);
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();

  const handleSelectLocation = (loc: StoreLocation) => {
    setSelectedLocation(loc);
    setInfoWindowOpen(true);
  };

  const getGoogleMapsDirectionsUrl = (loc: StoreLocation) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&destination_place_id=&travelmode=driving`;
  };

  return (
    <section id="store-locations" className={`py-12 sm:py-16 bg-white border-b border-slate-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visit Our Physical Marts & Live Pressing Mill</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Google Maps Store Locator
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Experience our 100% natural, slow wood-pressed extraction in person. Visit our certified food-grade oil pressing mill and stone flour chakki in Lahore & Karachi.
          </p>
        </div>

        {/* Quota Exceeded In-App Notice */}
        {isQuotaExceeded && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 text-xs sm:text-sm text-center rounded-xl shadow-xs">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{" "}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{" "}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Store Location Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {MART_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <MapPin className={`w-4 h-4 ${isSelected ? "text-emerald-200" : "text-emerald-600"}`} />
                <span>{loc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Google Map & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Map Container (7 Cols) */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 min-h-[380px] sm:min-h-[460px] relative">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  style={{ width: "100%", height: "100%", minHeight: "420px" }}
                  center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  zoom={14}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="cooperative"
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                >
                  {MART_LOCATIONS.map((loc) => (
                    <AdvancedMarker
                      key={loc.id}
                      position={{ lat: loc.lat, lng: loc.lng }}
                      onClick={() => handleSelectLocation(loc)}
                      title={loc.name}
                    >
                      <Pin
                        background="#047857"
                        borderColor="#064e3b"
                        glyphColor="#fef3c7"
                        scale={1.15}
                      />
                    </AdvancedMarker>
                  ))}

                  {infoWindowOpen && (
                    <InfoWindow
                      position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                      onCloseClick={() => setInfoWindowOpen(false)}
                    >
                      <div className="p-1 max-w-xs text-xs space-y-1.5 text-slate-900">
                        <div className="font-bold text-emerald-800 text-sm flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{selectedLocation.name}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {selectedLocation.address}
                        </p>
                        <div className="text-[10px] text-amber-900 font-semibold bg-amber-50 p-1 rounded">
                          🕒 {selectedLocation.schedule}
                        </div>
                        <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                          <span className="font-bold text-slate-800">📞 {selectedLocation.phone}</span>
                          <a
                            href={getGoogleMapsDirectionsUrl(selectedLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                          >
                            <span>Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 h-full min-h-[380px] text-center space-y-3 text-slate-600">
                <AlertCircle className="w-10 h-10 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-base">Google Maps API Key Initializing</h4>
                <p className="text-xs max-w-md">
                  Please verify your VITE_GOOGLE_MAPS_API_KEY environment variable. Once configured, interactive Google Maps will render here.
                </p>
              </div>
            )}
          </div>

          {/* Location Info Card (5 Cols) */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Selected Location
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedLocation.name}
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Address:</span>
                    <span>{selectedLocation.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Timings:</span>
                    <span>{selectedLocation.timings}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Live Pressing Mill:</span>
                    <span className="text-amber-900 font-medium">{selectedLocation.schedule}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">Call / WhatsApp:</span>
                    <span>{selectedLocation.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <a
                href={getGoogleMapsDirectionsUrl(selectedLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps / حاصل کریں ڈائریکشنز</span>
              </a>

              <a
                href={`https://wa.me/${(storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello! I want to visit ${selectedLocation.name} for live oil extraction.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Ask via WhatsApp before visiting</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
