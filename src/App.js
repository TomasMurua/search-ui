import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

const App = () => {
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState({ text: "", words: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const imageRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    }).then(({ data: { text, words } }) => {
      setOcrResult({ text, words });
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const calculateBoundingBox = (
    word,
    imageWidth,
    imageHeight,
    displayedImageWidth,
    displayedImageHeight
  ) => {
    const xScale = displayedImageWidth / imageWidth;
    const yScale = displayedImageHeight / imageHeight;

    return {
      top: `${word.bbox.y0 * yScale}px`,
      left: `${word.bbox.x0 * xScale}px`,
      width: `${(word.bbox.x1 - word.bbox.x0) * xScale}px`,
      height: `${(word.bbox.y1 - word.bbox.y0) * yScale}px`,
      backgroundColor: "yellow",
      opacity: 0.5,
      position: "absolute",
    };
  };

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        img.style.maxWidth = "100%";
        img.style.maxHeight = "80vh"; // Controla la altura máxima
        img.style.height = "auto";
      };
    }
  }, [image]);

  return (
    <div style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Search UI</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          onChange={handleImageChange}
          style={{ marginBottom: "20px" }}
        />
      </div>
      {image && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2>Imagen cargada:</h2>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={image}
              alt="Uploaded"
              ref={imageRef}
              style={{
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                maxWidth: "100%",
                maxHeight: "80vh", // Controla la altura máxima
                height: "auto",
              }}
              id="uploadedImage"
            />
            {searchTerm && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {ocrResult.words.map(
                  (word, index) =>
                    word.text
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) && (
                      <div
                        key={index}
                        style={calculateBoundingBox(
                          word,
                          imageRef.current.naturalWidth,
                          imageRef.current.naturalHeight,
                          imageRef.current.clientWidth,
                          imageRef.current.clientHeight
                        )}
                      />
                    )
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <form
        onSubmit={handleSearchSubmit}
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        <label style={{ fontSize: "18px", fontWeight: "bold" }}>
          Texto de búsqueda:
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "80%",
              padding: "10px",
              fontSize: "16px",
              marginBottom: "20px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>
      {searchTerm && ocrResult.text && (
        <div style={{ padding: "0 20px" }}>
          <h2>Resultados</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {ocrResult.text.split("\n").map((line, index) => (
              <span key={index} style={{ display: "block" }}>
                {line
                  .split(new RegExp(`(${searchTerm})`, "gi"))
                  .map((part, index) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                      <mark key={index} style={{ backgroundColor: "yellow" }}>
                        {part}
                      </mark>
                    ) : (
                      part
                    )
                  )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
