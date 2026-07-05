import { useState } from "react";

interface AboutSectionProps {
  description: string;
}

export const AboutSection = ({ description }: AboutSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  const shortText = description.slice(0, 150);
  const needsExpansion = description.length > 150;

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>Sobre mim</h2>
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border">
        <p className="text-sm text-foreground leading-relaxed font-normal italic" style={{ }}>
          {expanded || !needsExpansion ? description : shortText}
          {!expanded && needsExpansion && "... "}
          {!expanded && needsExpansion && (
            <button
              onClick={() => setExpanded(true)}
              className="text-primary font-medium"
              style={{ }}
            >
              Ver mais
            </button>
          )}
        </p>
      </div>
    </div>
  );
};
