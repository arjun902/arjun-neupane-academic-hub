"use client";
import { useState } from "react";
import type { Publication } from "@/content/types";
import { asset } from "@/content/site";
export function PublicationList({ items }: { items: Publication[] }) {
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");
  const shown = items
    .filter(
      (p) =>
        (!year || String(p.year) === year) &&
        (!type || p.type === type) &&
        (!topic || p.topics.includes(topic)),
    )
    .sort((a, b) => b.year - a.year);
  const copy = async (p: Publication) => {
    const citation =
      p.authors.join(", ") +
      ". (" +
      p.year +
      "). " +
      p.title +
      ". " +
      p.venue +
      (p.volume ? ", " + p.volume : "") +
      (p.issue ? "(" + p.issue + ")" : "") +
      (p.pages ? ", " + p.pages : "") +
      "." +
      (p.doi ? " https://doi.org/" + p.doi : "");
    try {
      await navigator.clipboard.writeText(citation);
      setMessage("Citation copied.");
      setFallback("");
    } catch {
      setFallback(citation);
      setMessage("Select and copy the citation below.");
    }
  };
  return (
    <>
      <div className="filters filter-grid">
        {[
          [
            "Year",
            year,
            setYear,
            [...new Set(items.map((p) => String(p.year)))].sort().reverse(),
          ],
          ["Type", type, setType, [...new Set(items.map((p) => p.type))]],
          [
            "Topic",
            topic,
            setTopic,
            [...new Set(items.flatMap((p) => p.topics))],
          ],
        ].map(([label, value, set, options]) => (
          <label key={label as string}>
            {label as string}
            <select
              className="form-input"
              value={value as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
            >
              <option value="">All</option>
              {(options as string[]).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p role="status" className="my-4">
        {message || shown.length + " publications"}
      </p>
      {fallback && (
        <textarea
          aria-label="Citation to copy"
          readOnly
          value={fallback}
          className="form-input"
          onFocus={(e) => e.target.select()}
        />
      )}
      <ol>
        {shown.map((p) => (
          <li className="resource-card" key={p.id}>
            <div>
              <p className="eyebrow">
                {p.year} · {p.type}
              </p>
              <h2 className="text-2xl">{p.title}</h2>
              <p>{p.authors.join(", ")}</p>
              <p>
                <em>{p.venue}</em>
                {p.volume && ", " + p.volume}
                {p.issue && " (" + p.issue + ")"}
                {p.pages && ", " + p.pages}
              </p>
              <div className="actions">
                {p.doi && (
                  <a className="text-link" href={"https://doi.org/" + p.doi}>
                    DOI ↗
                  </a>
                )}
                {p.url && (
                  <a className="text-link" href={p.url}>
                    Publisher ↗
                  </a>
                )}
                {p.pdfUrl && (
                  <a
                    className="text-link"
                    href={p.pdfUrl.startsWith("/") ? asset(p.pdfUrl) : p.pdfUrl}
                  >
                    Read PDF →
                  </a>
                )}
                <button className="btn btn-secondary" onClick={() => copy(p)}>
                  Copy citation
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {!shown.length && <p>No publications match these filters.</p>}
    </>
  );
}
