import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Swords, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { skillTracks } from "../data/skillTracks";

const CATEGORIES = ["All", "Speed", "Logic", "Language", "Developer"];
const TRACK_CATEGORY = {
  typing: "Speed", math: "Logic", guess: "Logic",
  code: "Developer", grammar: "Language", comprehension: "Language",
};

const labHighlights = [
  "Typing speed and rhythm testing",
  "Coding challenge workflows and test execution",
  "Math pressure drills with level progression",
  "Word and number guessing for lighter game loops",
  "Grammar and comprehension for language improvement",
  "AI hints, profile sharing, and multiplayer foundations",
];

export function ActivitiesPage() {
  const [activeCat, setActiveCat] = useState("All");

  const filtered = activeCat === "All"
    ? skillTracks
    : skillTracks.filter((t) => TRACK_CATEGORY[t.slug] === activeCat);

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Header card ── */}
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Skill Labs</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Different dynamic pages for every kind of player.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              Each module below opens its own screen with its own interactions, stats, and flow.
              That makes the platform feel like a real product suite instead of a single hero page with buttons.
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Button as={Link} to="/activities/code">Open Code Arena</Button>
              <Button as={Link} to="/multiplayer" variant="secondary">View social rooms</Button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {labHighlights.map((item) => (
              <div key={item} style={{
                borderRadius: 8, border: "1px solid var(--border-subtle)",
                background: "var(--surface-2)", padding: "10px 12px",
                fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.55,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Filter tabs ── */}
      <div className="page-tabs" style={{ flexShrink: 0 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`page-tab${activeCat === c ? " active" : ""}`}
            onClick={() => setActiveCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Track grid ── */}
      <div
        className="inner-scroll"
        style={{
          flex: 1, minHeight: 0,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10, alignContent: "start",
        }}
      >
        {filtered.map((track) => (
          <Link key={track.slug} to={track.route} className="group" style={{ textDecoration: "none" }}>
            <Card style={{ height: "100%", padding: "18px" }}>
              <div style={{
                height: 72, borderRadius: 8,
                background: "var(--btn-bg)",
                marginBottom: 14, opacity: 0.85,
              }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 4 }}>{track.eyebrow}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{track.title}</div>
                </div>
                <ArrowUpRight size={17} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 2 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: "0.825rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
                {track.summary}
              </div>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[track.duration, track.multiplayer, track.ai].map((tag) => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Promo row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flexShrink: 0 }}>
        <PromoCard
          icon={Sparkles}
          title="AI hints where they matter"
          copy="Typing, math, coding, grammar, and reading pages can call the backend hint service for lightweight coaching."
        />
        <PromoCard
          icon={Swords}
          title="Competition-ready surfaces"
          copy="Use challenge pages for practice now, then extend them into duels, tournaments, and coding contests."
        />
        <PromoCard
          icon={Users}
          title="Built for connections"
          copy="Profiles, room presence, and public sharing make it easy to connect learning with community."
        />
      </div>
    </div>
  );
}

function PromoCard({ icon: Icon, title, copy }) {
  return (
    <Card style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div className="accent-block" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}>
        <Icon size={16} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: "0.775rem", lineHeight: 1.6, color: "var(--text-muted)" }}>{copy}</div>
      </div>
    </Card>
  );
}
