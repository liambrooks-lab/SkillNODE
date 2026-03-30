import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";

export function ProfilePage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/api/me")
      .then((r) => {
        if (!alive) return;
        setMe(r.data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error || "Failed to load profile.");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="text-lg font-semibold">Your profile</div>
      <div className="mt-1 text-sm text-white/60">Synced from the server.</div>

      {error ? <div className="mt-4 text-sm text-rose-300">{error}</div> : null}
      {me ? (
        <div className="mt-5 grid gap-3 text-sm text-white/80">
          <div>
            <span className="text-white/50">Name:</span> {me.name}
          </div>
          <div>
            <span className="text-white/50">Email:</span> {me.email}
          </div>
          <div>
            <span className="text-white/50">Phone:</span> {me.phone}
          </div>
          <div>
            <span className="text-white/50">Region:</span> {me.region}
          </div>
          {me.dpUrl ? (
            <div className="pt-2">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                src={me.dpUrl}
                alt="Display picture"
                className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 text-sm text-white/50">Loading…</div>
      )}
    </Card>
  );
}

