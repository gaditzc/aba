const TARGET_LOCATION = {
  lat: 31.762,
  lon: 35.203,
};

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) {
    return "--";
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  const km = distanceMeters / 1000;
  const decimals = km < 10 ? 2 : 1;
  return `${km.toFixed(decimals)} km`;
}

function setStatus(message, isError) {
  const statusEl = document.getElementById("distance-status");
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.classList.toggle("error", Boolean(isError));
}

function setDistance(text) {
  const distanceEl = document.getElementById("distance-value");
  if (!distanceEl) {
    return;
  }

  distanceEl.textContent = text;
}

function startDistanceTracking() {
  if (!("geolocation" in navigator)) {
    setDistance("--");
    setStatus(
      "Location Services are not available on this device. Please use a modern browser.",
      true,
    );
    return;
  }

  setStatus("Requesting your location permission...", false);

  navigator.geolocation.watchPosition(
    function (position) {
      const { latitude, longitude, accuracy } = position.coords;
      const distanceMeters = haversineDistanceMeters(
        latitude,
        longitude,
        TARGET_LOCATION.lat,
        TARGET_LOCATION.lon,
      );

      setDistance(formatDistance(distanceMeters));

      const accuracyText = Number.isFinite(accuracy)
        ? ` (accuracy ±${Math.round(accuracy)} m)`
        : "";
      setStatus(`GPS tracking is live${accuracyText}.`, false);
    },
    function (error) {
      setDistance("--");

      if (error.code === error.PERMISSION_DENIED) {
        setStatus(
          "Please enable Location Services in your browser settings to see live distance.",
          true,
        );
        return;
      }

      setStatus(
        "We could not read your location right now. Please enable Location Services and try again.",
        true,
      );
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    },
  );
}

window.addEventListener("DOMContentLoaded", startDistanceTracking);
