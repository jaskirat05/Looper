"use client";

import { useMemo } from "react";
import { nodeDefinitions } from "@/lib/node-definitions";
import { useSearchState } from "@/stores/editor-store";

export function SearchOverlay() {
  const { search, closeSearch, setSearchQuery, insertNode } = useSearchState();

  const results = useMemo(() => {
    const query = search.query.trim().toLowerCase();

    if (!query) {
      return nodeDefinitions;
    }

    return nodeDefinitions.filter((definition) => {
      return (
        definition.label.toLowerCase().includes(query) ||
        definition.description.toLowerCase().includes(query) ||
        definition.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [search.query]);

  if (!search.isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="search-overlay"
      onClick={closeSearch}
      role="dialog"
    >
      <div
        className="search-panel"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <span className="panel-label">Node search</span>
        <h3>Insert a block into the graph</h3>
        <p className="search-hint">
          Search by name, capability, or tag. The node will be inserted at the last double-click
          position.
        </p>

        <input
          autoFocus
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search nodes"
          value={search.query}
        />

        <div className="search-list">
          {results.length === 0 ? (
            <p className="search-empty">No nodes match that query.</p>
          ) : (
            results.map((definition) => (
              <button
                className="search-result"
                key={definition.type}
                onClick={() => insertNode(definition.type)}
                type="button"
              >
                <strong>{definition.label}</strong>
                <span>{definition.description}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
