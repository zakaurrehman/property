"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#070b14",
          color: "#f3f5f8",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Estate Bureau hit a critical error
        </h1>
        <p style={{ color: "#b7c0cf", maxWidth: 420 }}>
          Please refresh the page. If this keeps happening, contact support.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#c9a227",
            color: "#0b1f3a",
            border: "none",
            borderRadius: 8,
            padding: "0.5rem 1.25rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
