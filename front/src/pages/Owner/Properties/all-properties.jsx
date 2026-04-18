import { useProperties } from "../../../services/api/useProperties";

export default function AllProperties() {
  const token = localStorage.getItem("access");
  const { data = [], isLoading, isError, error } = useProperties({ token, enabled: Boolean(token) });

  if (!token) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>All Properties</h2>
        <p>Please log in to fetch properties.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>All Properties</h2>

      {isLoading && <p>Loading properties...</p>}
      {isError && (
        <p style={{ color: "red" }}>
          Fetch failed: {error?.message || "Unknown error"}
        </p>
      )}

      {!isLoading && Array.isArray(data) && data.length === 0 && <p>No properties found.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {Array.isArray(data) &&
          data.map((property) => (
            <li
              key={property.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                {property.property_name || property.title || property.name || `Property ${property.id}`}
              </div>
              <div>Price: {property.price ?? "N/A"}</div>
              <div>Status: {property.status ?? "N/A"}</div>
              <div>ID: {property.id}</div>
            </li>
          ))}
      </ul>
    </div>
  );
}
