import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaInfoCircle, FaLeaf, FaTemperatureHigh, FaCloudRain, FaSeedling } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function App() {
  const [formData, setFormData] = useState({
    crop_type: "",
    temperature: "",
    rainfall: "",
    soil_ph: "",
    fertilizer_used: "",
    previous_yield: "",
  });

  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (image) data.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: data,
      });

      const response = await res.json();
      setResult(response);
    } catch (err) {
      setResult({ error: "Error connecting to backend" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🌱 Crop Prediction System</h2>
      <form className="card p-4 shadow" onSubmit={handleSubmit}>

        {/* Crop Type as user input */}
        <div className="mb-3">
          <label className="form-label">
            Crop Type{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Enter the type of crop")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="text"
            className="form-control"
            name="crop_type"
            value={formData.crop_type}
            onChange={handleChange}
            placeholder="Enter crop type (e.g., wheat, rice)"
            required
          />
        </div>

        {/* Temperature */}
        <div className="mb-3">
          <label className="form-label">
            Temperature (°C) <FaTemperatureHigh />{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Average temperature in Celsius")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="number"
            className="form-control"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            required
          />
        </div>

        {/* Rainfall */}
        <div className="mb-3">
          <label className="form-label">
            Rainfall (mm) <FaCloudRain />{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Average rainfall in mm")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="number"
            className="form-control"
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            required
          />
        </div>

        {/* Soil pH */}
        <div className="mb-3">
          <label className="form-label">
            Soil pH <FaLeaf />{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Soil pH value (0-14)")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="number"
            step="0.1"
            className="form-control"
            name="soil_ph"
            value={formData.soil_ph}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fertilizer Used */}
        <div className="mb-3">
          <label className="form-label">
            Fertilizer Used (kg) <FaSeedling />{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Amount of fertilizer used per hectare")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="number"
            className="form-control"
            name="fertilizer_used"
            value={formData.fertilizer_used}
            onChange={handleChange}
            required
          />
        </div>

        {/* Previous Yield */}
        <div className="mb-3">
          <label className="form-label">
            Previous Yield (tons/ha){" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Previous yield per hectare")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="number"
            className="form-control"
            name="previous_yield"
            value={formData.previous_yield}
            onChange={handleChange}
            required
          />
        </div>

        {/* Crop Image */}
        <div className="mb-3">
          <label className="form-label">
            Upload Crop Image{" "}
            <OverlayTrigger placement="right" overlay={renderTooltip("Upload an image of your crop")}>
              <FaInfoCircle className="text-info" />
            </OverlayTrigger>
          </label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="card mt-4 p-3 shadow">
          <h4>Prediction Result:</h4>
          {result.error ? (
            <p className="text-danger">{result.error}</p>
          ) : (
            <>
              <p><strong>Crop:</strong> {result.crop}</p>
              <p><strong>Harvest Days:</strong> {result.harvest_days}</p>
              <p><strong>Maturity Stage:</strong> {result.maturity_stage}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
