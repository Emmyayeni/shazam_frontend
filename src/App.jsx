// ShazamForFood.jsx
import React, { useState } from "react";
import { Camera, ChefHat, Clock, Users, X } from "lucide-react";
import "./App.css";
import { getRecipe } from "./data/recipes";

export default function ShazamForFood() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // e.g., https://www.naijafood.live/predict
  const recipe = prediction ? getRecipe(prediction) : null;

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      setLoading(true);
      reader.onload = function (e) {
        setImagePreview(e.target.result);
        setPrediction(null);
        setConfidence(null);
        setAccuracy(null);
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Send file to backend for prediction
  const predictImage = async () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(`Prediction failed: ${data.error}`);
        setPrediction("Unknown");
        setConfidence(0);
        setAccuracy(0);
      } else {
        setPrediction(data.prediction || "Unknown");
        setConfidence(data.confidence || 0);
        setAccuracy(data.confidence ? (data.confidence * 100).toFixed(0) : 0);
      }
    } catch (err) {
      alert("Prediction failed. Check your network or backend.");
    } finally {
      setLoading(false);
    }
  };

  const showPreview = imagePreview && !prediction;

  const resetForm = () => {
    setFile(null);
    setImagePreview(null);
    setPrediction(null);
    setConfidence(null);
    setAccuracy(null);
    setShowRecipe(false);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">🍲</div>
          <div>
            <h1 className="app-title">Shazam for Food</h1>
            <p className="app-subtitle">Identify Nigerian dishes & get recipes</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!prediction ? (
          <div className="upload-section">
            <div className="upload-card">
              <label htmlFor="imageInput" className="upload-label">
                <div className="upload-icon">
                  <Camera size={48} />
                </div>
                <p className="upload-text">Click to upload or drag and drop</p>
                <p className="upload-hint">PNG, JPG up to 16MB</p>
              </label>
              <input
                type="file"
                id="imageInput"
                accept="image/*" // allow any image (gallery + camera on mobile)
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {showPreview && (
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                </div>
              )}

              {loading && <div className="loading-spinner">Analyzing...</div>}

              <button
                onClick={predictImage}
                disabled={!file || loading}
                className="btn-identify"
              >
                {loading ? "Analyzing..." : "Identify Food"}
              </button>
            </div>
          </div>
        ) : (
          <div className="result-section">
            <button onClick={resetForm} className="btn-back" title="Start over">
              <X size={20} /> New Search
            </button>

            <div className="result-card">
              <div className="result-image-container">
                <img src={imagePreview} alt="Identified Food" className="result-image" />
              </div>

              <div className="result-info">
                <h2 className="result-name">{prediction}</h2>
                <p className="result-confidence">
                  Confidence: <strong>{accuracy}%</strong>
                </p>

                {recipe ? (
                  <button
                    onClick={() => setShowRecipe(!showRecipe)}
                    className="btn-recipe"
                  >
                    <ChefHat size={20} />
                    {showRecipe ? "Hide Recipe" : "View Recipe"}
                  </button>
                ) : (
                  <p className="no-recipe">Recipe not available for this dish</p>
                )}
              </div>
            </div>

            {showRecipe && recipe && (
              <div className="recipe-section">
                <h3 className="recipe-title">How to Make {prediction}</h3>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <Clock size={18} />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={18} />
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>

                <div className="recipe-content">
                  <div className="recipe-part">
                    <h4 className="recipe-subtitle">Ingredients</h4>
                    <ul className="ingredients-list">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="ingredient-item">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="recipe-part">
                    <h4 className="recipe-subtitle">Instructions</h4>
                    <ol className="instructions-list">
                      {recipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="instruction-item">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with <span className="heart">❤️</span> by Ayeni Emmanuel</p>
      </footer>
    </div>
  );
}
