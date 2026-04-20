import React from 'react';
import { useProperties } from '../../../services/api/useProperties';

export default function Apartment() {
  const token = localStorage.getItem("access");
  const { data, isLoading, isError, error } = useProperties({
    page: 1,
    enabled: Boolean(token),
  });

  const properties = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];

  // Filter for apartments only
  const apartments = properties.filter(
    (property) => property.type === "SALE" || property.type === "RENT"
  );

  if (!token) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Apartment Listings</h1>
        <p>Please log in to view apartment listings.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Apartment Listings</h1>

      {isLoading && <p>Loading apartment listings...</p>}
      {isError && (
        <p style={{ color: "red" }}>
          Failed to load listings: {error?.message || "Unknown error"}
        </p>
      )}

      {!isLoading && apartments.length === 0 && <p>No apartment listings found.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {apartments.map((property) => (
          <div
            key={property.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              padding: "1rem",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {property.property_name || `Apartment ${property.id}`}
            </h3>
            <p><strong>Address:</strong> {property.property_address}</p>
            <p><strong>Type:</strong> {property.type}</p>
            <p><strong>Price:</strong> ₱{property.price?.toLocaleString() ?? "N/A"}</p>
            <p><strong>Status:</strong> {property.status}</p>
            <p><strong>Size:</strong> {property.property_size} sqm</p>
            <p><strong>Bedrooms:</strong> {property.num_bedrooms}</p>
            <p><strong>Bathrooms:</strong> {property.num_bathrooms}</p>
            {property.images && property.images.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {property.images.slice(0, 3).map((image, idx) => (
                    <img
                      key={idx}
                      src={image.image}
                      alt={image.alt_text || `Apartment image ${idx + 1}`}
                      style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "0.25rem" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
