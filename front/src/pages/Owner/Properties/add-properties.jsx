import { useEffect, useState } from "react";
import { useValuationPreview } from "../../../services/api/useValuationPreview";

export default function AddProperties() {
  const [formData, setFormData] = useState({
    property_size: "",
    property_municipality: "",
    price: "",
  });
  const [debouncedFormData, setDebouncedFormData] = useState(formData);

  // replace with real ID when editing an existing property
  const propertyId = 1;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const { data, isFetching, error } = useValuationPreview({
    propertyId,
    formData: debouncedFormData,
    token,
    enabled: Boolean(propertyId),
  });

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Add Property (Starter)</h2>

      <input
        type="number"
        placeholder="Property size (sqm)"
        value={formData.property_size}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, property_size: e.target.value }))
        }
      />

      <input
        type="number"
        placeholder="Municipality ID"
        value={formData.property_municipality}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, property_municipality: e.target.value }))
        }
      />

      <input
        type="number"
        placeholder="Manual price"
        value={formData.price}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, price: e.target.value }))
        }
      />

      {isFetching && <p>Checking valuation preview...</p>}
      {error && <p style={{ color: "red" }}>Preview failed.</p>}

      {data && (
        <div>
          <p>Base Price: {data.base_price}</p>
          <p>Amenity Impact: {data.amenity_impact}</p>
          <p>Estimated Total: {data.estimated_total}</p>
        </div>
      )}
    </div>
  );
}
