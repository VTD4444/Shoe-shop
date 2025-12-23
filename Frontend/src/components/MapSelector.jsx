import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { FiX, FiCheck } from "react-icons/fi";

// Fix leaflet default icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapSelector = ({ isOpen, onClose, onSelect }) => {
  const [position, setPosition] = useState(null); // { lat, lng }
  const [addressDetails, setAddressDetails] = useState(null);
  const [displayAddress, setDisplayAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Component to handle map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        handleReverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  const handleReverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      if (response.data) {
        setAddressDetails(response.data.address);
        setDisplayAddress(response.data.display_name);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setDisplayAddress("Không thể lấy địa chỉ từ vị trí này.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (position && addressDetails) {
      onSelect({
        lat: position.lat,
        lng: position.lng,
        addressDetails: addressDetails,
        fullAddress: displayAddress,
      });
      onClose();
    }
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      // Default to Hanoi if no position (or current user location could be better)
      if (!position) {
        // Optionally get current location here
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-4xl h-[80vh] flex flex-col rounded-lg shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg uppercase">
            Chọn địa chỉ trên bản đồ
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={[21.0285, 105.8542]} // Default center Hanoi
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>

          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[1000]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          )}
        </div>

        {/* Footer / Info Panel */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500 mb-1">Địa chỉ đã chọn:</p>
          <div className="font-medium mb-4 min-h-[1.5rem] break-words">
            {displayAddress || "Vui lòng chọn một điểm trên bản đồ"}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-black font-bold uppercase text-sm hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position || loading}
              className={`px-6 py-2 bg-black text-white font-bold uppercase text-sm flex items-center gap-2 
                ${
                  !position || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
            >
              <FiCheck /> Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
