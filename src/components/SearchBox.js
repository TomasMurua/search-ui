import React from "react";
import { SearchBox } from "@elastic/react-search-ui";

function CustomSearchBox() {
  return (
    <SearchBox
      autocompleteMinimumCharacters={3}
      autocompleteResults={{
        titleField: "title",
        urlField: "nps_link",
      }}
      autocompleteSuggestions={true}
      debounceLength={300}
    />
  );
}

export default CustomSearchBox;
