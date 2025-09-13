import React, { useEffect, useState, useRef } from "react";
import axios from "axios";


const colorPalettes = [
  ["from-indigo-400", "to-pink-400"],
  ["from-emerald-400", "to-cyan-400"],
  ["from-rose-400", "to-yellow-400"],
  ["from-blue-400", "to-violet-500"],
  ["from-fuchsia-400", "to-orange-400"],
  ["from-lime-400", "to-green-500"],
];

function useParallaxBlob(blobRef, intensity = 0.03) {
  useEffect(() => {
    const el = blobRef.current;
    if (!el) return;
    function onScroll() {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * intensity}px)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [blobRef, intensity]);
}

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);


  const blobA = useRef(null);
  const blobB = useRef(null);
  useParallaxBlob(blobA, 0.02);
  useParallaxBlob(blobB, -0.015);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("http://localhost:8080/vehicles")
      .then((res) => {
        if (!cancelled) {
          // expect array of vehicles: { id, name, type, capacity, price, image? }
          const data = Array.isArray(res.data) ? res.data : [];
          setVehicles(data);

          // Add search functionality
          const searchInput = document.querySelector('input[type="search"]');
          searchInput?.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = data.filter(vehicle => 
              vehicle.name?.toLowerCase().includes(searchTerm) ||
              vehicle.type?.toLowerCase().includes(searchTerm) ||
              vehicle.description?.toLowerCase().includes(searchTerm)
            );
            setVehicles(filtered);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch vehicles", err);
        setVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // IntersectionObserver to reveal cards with a stagger
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("reveal-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    const els = containerRef.current?.querySelectorAll(".reveal") ?? [];
    els.forEach((el, i) => {
      // optional: set stagger via inline delay
      el.style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [vehicles]);

  const getPalette = (i) => colorPalettes[i % colorPalettes.length];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-indigo-50 via-white to-sky-50 relative overflow-x-hidden">
     
      <div
        ref={blobA}
        className="pointer-events-none absolute -top-40 -left-36 w-96 h-96 rounded-full opacity-80 filter blur-3xl animate-blob"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(236,72,153,0.82))",
        }}
        aria-hidden
      />
      <div
        ref={blobB}
        className="pointer-events-none absolute -bottom-44 -right-36 w-96 h-96 rounded-full opacity-70 filter blur-2xl animate-blob"
        style={{
          background: "linear-gradient(135deg, rgba(99,255,199,0.85), rgba(59,130,246,0.65))",
        }}
        aria-hidden
      />

     
        <header className="w-full max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
          Explore Vehicles
            </h1>
            <p className="mt-1 text-sm text-gray-600">
          Voltride gives you comfort not a Guilt!❤️
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
          <input
            type="search"
            placeholder="Search vehicles..."
            className="w-full rounded-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
            </div>

            <button
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow-lg transform transition hover:scale-[1.02] active:scale-95"
          aria-label="Primary action"
          onClick={() => {
            const token = localStorage.getItem('jwt');
            if (!token) {
              window.location.href = '/login';
            }
          }}
            >
          New Booking
            </button>
          </div>
        </header>

        {/* Grid */}
      <main className="w-full max-w-6xl px-6 pb-16 z-10">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="text-gray-500">Loading vehicles…</div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-16 text-center text-gray-600">No vehicles found.</div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v, i) => {
              const palette = getPalette(i);
              const gradientClass = `bg-gradient-to-br ${palette[0]} ${palette[1]}`;
              return (
                <article
                  key={v.id}
                  className="reveal relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 shadow-xl transform transition hover:shadow-2xl hover:-translate-y-1 active:scale-[0.985] will-change-transform"
                  style={{ minHeight: 200 }}
                >
                  {/* top accent */}
                  <div className={`absolute inset-x-0 top-0 h-28 ${gradientClass} opacity-95 -z-10`} />

                  <div className="p-4 pt-6 relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* avatar / image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-white/30">
                          {v.image ? (
                            // If you have real images, render them responsively
                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-white text-lg font-bold">
                              {v.name?.charAt(0) ?? "V"}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{v.name}</h3>
                          <p className="text-xs text-gray-600">{v.type ?? "Vehicle"}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-sm text-white px-3 py-1 rounded-full font-semibold" style={{
                          background: `linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))`,
                          border: "1px solid rgba(255,255,255,0.12)"
                        }}>
                          {v.capacity ?? "–"} seats
                        </div>
                        <div className="mt-2 text-right">
                          <div className="text-sm text-gray-500">From</div>
                          <div className="text-xl font-bold text-gray-900">${v.price ?? "0"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex-1">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {v.description ?? "Comfortable, reliable, and ready for your journey. Tap for more details."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-900 font-medium shadow hover:translate-y-[-2px] transition transform active:scale-95"
                        onClick={() => alert(`Booked ${v.name} (demo)`)}
                      >
                        Book now
                      </button>

                      <button
                        className="flex-none inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 text-sm text-gray-800 bg-white/40 hover:bg-white/60 active:scale-95 transition"
                        onClick={() => alert(`Details for ${v.name} (demo)`)}
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  {/* subtle corner badge */}
                  <div className="absolute right-4 top-4 px-2 py-1 rounded-full text-xs font-semibold text-white" style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06))`,
                  }}>
                    #{v.id}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating action button for mobile */}
      <button
        className="fixed bottom-6 right-6 z-20 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-2xl hover:-translate-y-1 active:scale-95 transition"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5l-7 7h4v7h6v-7h4l-7-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}