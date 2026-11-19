import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import Modal from "./Modal";

export default function LocationPickerModal({ location, onConfirm, onClose }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const selectRef = useRef(null);
  const [selected, setSelected] = useState(location);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const initial = location ? [location.latitude, location.longitude] : [20, 0];
    const map = L.map(container.current).setView(initial, location ? 16 : 2);
    mapRef.current = map;
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    tiles.on("tileerror", () => setTileError(true));
    const icon = L.divIcon({ className: "report-map-pin", html: '<span aria-hidden="true"></span>', iconSize: [28, 28], iconAnchor: [14, 14] });
    let marker;
    function select(latlng) {
      const point = { latitude: latlng.lat, longitude: latlng.wrap().lng };
      setSelected(point);
      if (marker) marker.setLatLng([point.latitude, point.longitude]);
      else {
        marker = L.marker([point.latitude, point.longitude], { icon, draggable: true, title: "Selected report location", alt: "Drag to change report location", autoPan: true }).addTo(map);
        marker.on("dragend", () => select(marker.getLatLng()));
      }
    }
    selectRef.current = select;
    if (location) select(L.latLng(initial));
    map.on("click", (event) => select(event.latlng));
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); map.remove(); mapRef.current = null; selectRef.current = null; };
  }, [location]);

  return <Modal onClose={onClose} titleId="report-map-title" className="max-w-2xl">
    <div className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="report-map-title" className="text-xl font-semibold">Choose report location</h2>
        <button type="button" onClick={onClose} aria-label="Close location map" className="p-2 rounded-lg hover:bg-slate-100"><X size={22} /></button>
      </div>
      <p id="report-map-help" className="text-sm text-slate-600">Click the place where you saw the pet, or drag the pin. You can also move the map with the arrow keys and select its centre.</p>
      <div ref={container} role="region" aria-label="Report location map" aria-describedby="report-map-help" className="report-location-map" />
      {tileError && <p role="alert" className="text-sm text-amber-800">Some map tiles could not load. Try reopening the map, or describe the place in your report.</p>}
      <button type="button" className="text-sm text-blue-700 underline" onClick={() => selectRef.current?.(mapRef.current.getCenter())}>Select map centre</button>
      <p role="status" className="text-sm text-slate-600">{selected ? `Selected point: ${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}` : "Choose a point to add to your report."}</p>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-3 border border-slate-300 rounded-lg">Cancel</button>
        <button type="button" disabled={!selected} onClick={() => onConfirm(selected)} className="px-4 py-3 bg-blue-700 text-white rounded-lg disabled:opacity-50">Use selected location</button>
      </div>
    </div>
  </Modal>;
}
