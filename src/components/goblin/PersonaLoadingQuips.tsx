import React, { useEffect, useState } from "react";

const personaQuips = {
  clarity: [
    "🧠 Thinking deeply about your design sins...",
    "🧠✨ Filing a UX restraining order against poor alignment...",
    "😈 Roasting inconsistencies with loving brutality...",
    "🧠⚖️ Delivering 3% wisdom, 97% sass...",
    "📜 Scrolling the scroll of UX judgment..."
  ],
  strategic: [
    "📊 Formulating your 5-year UX battle plan...",
    "🧭 Calculating the ROI of your button spacing...",
    "📈 Repositioning elements to align with North Star metrics...",
    "📌 Pinning down strategic friction...",
    "🧠 Architecting intent with precision..."
  ],
  mirror: [
    "🪞 Reflecting your own choices back at you...",
    "💬 Echoing design intent with interpretive dance...",
    "🧘‍♂️ Meditating on whitespace decisions...",
    "👁️ Asking: Is that hierarchy or hubris?",
    "🤔 Whispering insights you already knew... just louder."
  ],
  mad: [
    "🧪 Injecting UX with controlled chaos...",
    "💥 Exploding button gradients for science...",
    "🔬 Synthesizing delightful nonsense into radical patterns...",
    "🤖 Bribing the interface gremlins with post-its...",
    "🧬 Rewiring affordances into delightful monstrosities..."
  ],
  exec: [
    "📋 Rewriting your OKRs based on button contrast...",
    "💼 Reclassifying font size as a business risk...",
    "📣 Turning ROI into RUX (Return on UX)...",
    "📎 Clippy is reviewing your stakeholder alignment...",
    "🚨 Escalating UX debt to a board-level concern..."
  ]
};

const jitter = (text: string) =>
  text.split("").map((char, i) => (
    <span
      key={i}
      className="inline-block animate-jitter"
      style={{ animationDelay: `${i * 30}ms` }}
    >
      {char}
    </span>
  ));

interface PersonaLoadingQuipsProps {
  persona?: "clarity" | "strategic" | "mirror" | "mad" | "exec";
}

const PersonaLoadingQuips: React.FC<PersonaLoadingQuipsProps> = ({ persona = "clarity" }) => {
  const [quipIndex, setQuipIndex] = useState(0);
  const quips = personaQuips[persona] || personaQuips.clarity;

  useEffect(() => {
    const interval = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % quips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quips]);

  return (
    <div className="text-center text-lg font-medium text-muted-foreground p-4">
      {jitter(quips[quipIndex])}
    </div>
  );
};

export default PersonaLoadingQuips;