import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

const App = () => {
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState({ text: "", words: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
    performSearch(searchTerm);
  };

  const performSearch = async (term) => {
    const response = await fetch("http://localhost:9200/mi_indice/_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          match: {
            text_content: term,
          },
        },
      }),
    });

    const data = await response.json();
    setSearchResults(data.hits.hits);
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

  const highlightSearchTerm = (text, term) => {
    const regex = new RegExp(`(${term})`, "gi");
    return text.replace(regex, "<b>$1</b>");
  };

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
      {searchResults.length > 0 && (
        <div style={{ padding: "0 20px" }}>
          <h2>Resultados</h2>
          <ul>
            {searchResults.map((result) => (
              <li key={result._id}>
                <h3>{result._source.name}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(
                      result._source.text_content,
                      searchTerm
                    ),
                  }}
                ></p>
                <a
                  href={result._source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver imagen
                </a>
                <div
                  style={{
                    position: "relative",
                    marginTop: "10px",
                    display: "inline-block",
                  }}
                >
                  <img
                    src={result._source.url}
                    alt={result._source.name}
                    ref={imageRef}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      maxWidth: "100%",
                      maxHeight: "400px",
                      height: "auto",
                    }}
                  />
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
