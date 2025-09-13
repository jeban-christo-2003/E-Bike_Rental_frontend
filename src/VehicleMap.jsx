import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

/* ---------- Demo OTP constant (all OTPs are 123456 as requested) ---------- */
const DEMO_OTP = "123456";

/* ---------- Leaflet default icon fix ---------- */
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* ---------- Map utility: center and zoom to coords ---------- */
function Recenter({ lat, lng, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

/* ---------- Component ---------- */
export default function VehicleMap() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // bookingState:
  // { active, vehicleId, otp, verified, remainingSeconds }
  const [bookingState, setBookingState] = useState({
    active: false,
    vehicleId: null,
    otp: null,
    verified: false,
    remainingSeconds: 0,
  });

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const timerRef = useRef(null);

  const defaultCenter = useMemo(() => [37.7749, -122.4194], []);

  useEffect(() => {
    let canceled = false;
    axios.get("http://localhost:8080/vehicles")
      .then(res => {
        if (canceled) return;
        let data = Array.isArray(res.data) ? res.data : [];
        data = data.map((v, i) => {
          if (v.lat == null || v.lng == null) {
            const jitter = (i % 6) * 0.004;
            return { ...v, lat: defaultCenter[0] + 0.01 - jitter, lng: defaultCenter[1] + (i % 4) * 0.008 - 0.01 };
          }
          return v;
        });
        const jwt = localStorage.getItem('jwt');
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
        setVehicles(data);
            })
            .catch((error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access - maybe redirect to login
          console.log('Unauthorized access');
        }
        // fallback demo
        const demo = Array.from({ length: 6 }).map((_, i) => ({
          id: `demo-${i+1}`,
          name: ["City Car", "Sedan", "SUV", "Van", "Coupe", "EV"][i % 6],
          type: ["Compact","Sedan","SUV","Van","Coupe","Electric"][i % 6],
          price: (20 + i * 5),
          capacity: 4 + (i % 3),
          description: "Demo vehicle for interactive map.",
          image: null,
          lat: defaultCenter[0] + (i % 3) * 0.006 - 0.006,
          lng: defaultCenter[1] + Math.floor(i/3) * 0.007 - 0.004,
        }));
        setVehicles(demo);
      })
      .finally(() => { if (!canceled) setLoading(false); });

    return () => { canceled = true; };
  }, [defaultCenter]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectVehicle = (vehicle) => {
    setSelectedId(vehicle.id);
  };

  // Book now: show OTP in app (DEMO_OTP)
  const openBooking = (vehicle) => {
    setBookingState({
      active: false,
      vehicleId: vehicle.id,
      otp: DEMO_OTP,   // fixed OTP visible in-app
      verified: false,
      remainingSeconds: 0,
    });

    // automatically select the vehicle and center map
    setSelectedId(vehicle.id);
  };

  // User indicates they've entered the OTP on the vehicle cluster:
  // open modal to input the OTP (simulating vehicle cluster input verification)
  const openOtpEntryModal = () => {
    setEnteredOtp("");
    setOtpModalOpen(true);
  };

  const verifyOtp = () => {
    // For this simplified demo, correct OTP is DEMO_OTP.
    if (enteredOtp.trim() === bookingState.otp) {
      // Verified: start booking & timer (e.g., 15 minutes)
      const duration = 15 * 60; // seconds
      setBookingState(prev => ({ ...prev, verified: true, active: true, remainingSeconds: duration }));
      setOtpModalOpen(false);
      setEnteredOtp("");

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setBookingState(prev => {
          if (!prev.active) return prev;
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerRef.current);
            return { active: false, vehicleId: null, otp: null, verified: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      alert("Incorrect OTP entered. Please enter the code shown in the app on the vehicle cluster (123456).");
    }
  };

  const endTrip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBookingState({ active: false, vehicleId: null, otp: null, verified: false, remainingSeconds: 0 });
  };

  const formatTime = (sec) => {
    if (!sec || sec <= 0) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedId) || vehicles.find(v => v.id === bookingState.vehicleId) || null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-start justify-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map left */}
        <div className="lg:col-span-8 col-span-1 map-min-width">
          <div className="h-[64vh] lg:h-[78vh] rounded-2xl overflow-hidden shadow-xl">
            <MapContainer
              center={ selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : defaultCenter }
              zoom={13}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedVehicle && <Recenter lat={selectedVehicle.lat} lng={selectedVehicle.lng} zoom={15} />}

              {vehicles.map(v => (
                <Marker key={v.id} position={[v.lat, v.lng]}>
                  <Popup className="text-black">
                    <div className="max-w-xs">
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-xs text-slate-700">{v.type ?? "Vehicle"}</div>
                      <div className="text-sm mt-2">${v.price ?? "--"} / hr</div>
                      {/* If this vehicle is the one we've generated OTP for and not yet verified, show OTP here too */}
                      {bookingState.vehicleId === v.id && !bookingState.verified && bookingState.otp && (
                        <div className="mt-2 text-sm text-red-700 font-semibold">OTP: {bookingState.otp}</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right panel */}
        <aside className="lg:col-span-4 col-span-1 flex flex-col gap-4">
          <div className="auto-panel p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300">Active Booking</div>
                {!bookingState.active ? (
                  <div className="text-lg font-semibold text-white">No active trip</div>
                ) : (
                  <div className="text-lg font-semibold text-green-300">{ selectedVehicle?.name ?? "Your vehicle" }</div>
                )}
              </div>

              <div className="bg-black/40 px-3 py-2 rounded-lg text-right">
                <div className="text-xs text-slate-300">Remaining</div>
                <div className="text-xl font-mono font-semibold">{ formatTime(bookingState.remainingSeconds) }</div>
              </div>
            </div>

            <div className="mt-3">
              { bookingState.vehicleId && !bookingState.verified && bookingState.otp ? (
                <>
                  <div className="text-sm text-slate-300 mb-2">OTP (visible in app) — enter this on the vehicle cluster to unlock:</div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/6 px-4 py-3 rounded-lg font-mono text-lg tracking-widest text-white">
                      {bookingState.otp}
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(bookingState.otp)}
                      className="px-3 py-2 bg-indigo-600 rounded-lg text-sm"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="mt-3 text-sm text-slate-400">
                    After entering the OTP on the vehicle cluster, press the button below and enter the OTP to confirm.
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={openOtpEntryModal}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition"
                    >
                      I entered OTP on vehicle
                    </button>
                    <button
                      onClick={() => { setBookingState({ active: false, vehicleId: null, otp: null, verified: false, remainingSeconds: 0 }); }}
                      className="flex-none bg-red-700 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : bookingState.active && selectedVehicle ? (
                <>
                  <div className="text-sm text-slate-300">Vehicle ID: <span className="font-medium text-white">{selectedVehicle.id}</span></div>
                  <div className="text-sm text-slate-300">Seats: <span className="font-medium text-white">{selectedVehicle.capacity ?? "-"}</span></div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => alert("Navigation launched (demo)")}
                      className="flex-1 bg-indigo-600/90 hover:bg-indigo-500/90 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Start Navigation
                    </button>
                    <button
                      onClick={endTrip}
                      className="flex-none bg-red-600/90 hover:bg-red-500/90 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      End Trip
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">Select a vehicle and click Book now. The OTP will be displayed in the app—enter it on the vehicle cluster to unlock.</div>
              )}
            </div>
          </div>

          {/* Scrollable vehicle list */}
          <div className="auto-panel p-3 rounded-2xl overflow-auto max-h-[62vh] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-300">Nearby Vehicles</div>
              <div className="text-xs text-slate-400">{ vehicles.length } found</div>
            </div>

            <div className="space-y-3">
              { loading ? (
                <div className="text-slate-400">Loading vehicles…</div>
              ) : vehicles.length === 0 ? (
                <div className="text-slate-400">No vehicles nearby.</div>
              ) : vehicles.map(v => {
                const isSelected = selectedId === v.id || bookingState.vehicleId === v.id;
                return (
                  <div
                    key={v.id}
                    className={`relative p-3 rounded-xl transition cursor-pointer ${isSelected ? "card-selected bg-white/6" : "hover:bg-white/2"}`}
                    onClick={() => selectVehicle(v)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold">
                        {v.name?.charAt(0) ?? "V"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{v.name}</div>
                            <div className="text-xs text-slate-400">{v.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">${v.price ?? "--"}</div>
                            <div className="text-xs text-slate-400">{v.capacity ?? "-"} seats</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="flex-1 bg-white text-slate-900 py-2 rounded-lg font-medium hover:scale-[1.01] active:scale-95 transition"
                            onClick={(e) => { e.stopPropagation(); selectVehicle(v); openBooking(v); }}
                          >
                            Book now
                          </button>
                          <button
                            className="flex-none px-3 py-2 border border-white/10 rounded-lg text-sm text-slate-200 hover:bg-white/4"
                            onClick={(e) => { e.stopPropagation(); alert(`Details: ${v.name}\n${v.description}`); }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Persistent OTP badge for the vehicle that just got a booking request (visible until verified) */}
                    { bookingState.vehicleId === v.id && !bookingState.verified && bookingState.otp && (
                      <div className="absolute right-3 top-3 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-black">
                        OTP: {bookingState.otp}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            The OTP shown in the app must be entered into the vehicle's cluster to unlock it. This demo assumes OTP = 123456.
          </div>
        </aside>
      </div>

      {/* OTP Entry Modal (simulate entering OTP on the vehicle cluster) */}
      { otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setOtpModalOpen(false); setEnteredOtp(""); }} />
          <div className="relative max-w-md w-full bg-slate-900 rounded-2xl p-6 shadow-xl modal-fade">
            <h3 className="text-lg font-semibold mb-2">Vehicle Cluster — Enter OTP</h3>
            <p className="text-sm text-slate-400 mb-4">Enter the 6-digit code shown in the app to unlock the vehicle.</p>

            <div className="flex gap-2 items-center">
              <input
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0,6))}
                placeholder="123456"
                inputMode="numeric"
                className="flex-1 bg-white/6 px-4 py-3 rounded-lg text-lg text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={verifyOtp}
                className="px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
              >
                Verify
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <div>
                Didn't receive it?
                <button
                  onClick={() => {
                    // For demo, OTP is fixed; show reminder
                    alert(`Demo OTP is ${DEMO_OTP}. Enter it on the vehicle cluster.`);
                  }}
                  className="ml-2 text-indigo-400 font-medium"
                >
                  Remind
                </button>
              </div>

              <div>
                <button
                  onClick={() => { setOtpModalOpen(false); setEnteredOtp(""); }}
                  className="text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}