import React from "react";
import {
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Facet,
} from "@elastic/react-search-ui";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

const connector = new ElasticsearchAPIConnector({
  host: "http://localhost:9200",
  index: "mi_indice",
});

const App = () => {
  return (
    <SearchProvider
      config={{
        apiConnector: connector,
        searchQuery: {
          facets: {
            categoria: { type: "value", size: 10 },
          },
        },
        alwaysSearchOnInitialLoad: true,
      }}
    >
      <div
        className="App"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <h1 style={{ textAlign: "center" }}>Search UI</h1>
        <SearchBox searchAsYouType={true} debounceLength={300} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Facet field="categoria" label="Categoría" />
        </div>
        <PagingInfo />
        <ResultsPerPage />
        <Results
          titleField="name"
          urlField="url"
          shouldTrackClickThrough={true}
          resultView={({ result }) => (
            <div key={result.id.raw}>
              <h3>{result.name.raw}</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: result.text_content.snippet,
                }}
              />
              <a
                href={result.url.raw}
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
                  src={result.url.raw}
                  alt={result.name.raw}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxWidth: "100%",
                    maxHeight: "400px",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          )}
        />
        <Paging />
      </div>
    </SearchProvider>
  );
};

export default App;
