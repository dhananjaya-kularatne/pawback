import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Check, Crosshair, X } from "lucide-react";
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
    <div className="dialog-header">
      <h2 id="report-map-title">Report location</h2>
      <button type="button" onClick={onClose} aria-label="Close location map" className="icon-button"><X size={20} /></button>
    </div>
    <div className="map-dialog">
      <p id="report-map-help" className="text-sm text-slate-600">Tap the map or drag the pin to where you saw the pet. You can also pan with the arrow keys and use the map centre.</p>
      <div ref={container} role="region" aria-label="Report location map" aria-describedby="report-map-help" className="report-location-map" />
      {tileError && <p role="alert" className="text-sm text-amber-800">Some map tiles could not load. Try reopening the map, or describe the place in your report.</p>}
      <div className="map-point-row">
        <p role="status" className="text-sm text-slate-600">{selected ? `Selected point: ${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}` : "Choose a point to add to your report."}</p>
        <button type="button" className="button-quiet button-small" onClick={() => selectRef.current?.(mapRef.current.getCenter())}><Crosshair size={17} /> Use map centre</button>
      </div>
      <div className="map-actions">
        <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
        <button type="button" disabled={!selected} onClick={() => onConfirm(selected)} className="button-primary"><Check size={18} /> Use selected location</button>
      </div>
    </div>
  </Modal>;
}
