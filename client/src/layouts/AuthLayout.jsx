import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Logo, { TagMark } from "../components/brand/Logo";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1600&q=80";

const TAG_CHIPS = [
  "AF-000133 · allocated",
  "ROOM-B2 · booked",
  "AF-000062 · serviced",
];

export const AuthLayout = () => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-0">
      {/* Left brand panel: abstract image over a gradient fallback */}
      <div className="hidden lg:block relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #1c1917 0%, #78350f 55%, #b45309 100%)",
          }}
        />
        <TagMark
          size={520}
          className="absolute -bottom-24 -right-24 opacity-10 -rotate-12"
        />
        {!imageFailed && (
          <img
            src={HERO_IMAGE_URL}
            alt=""
            aria-hidden="true"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-surface-ink/85 via-surface-ink/30 to-surface-ink/20" />

        <div className="relative z-10 flex flex-col justify-between p-10 h-full">
          <Logo size={32} withWordmark tone="inverse" />

          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-semibold text-text-inverse leading-tight">
                Every asset, accounted for.
              </h2>
              <p className="text-sm text-text-inverse/70 mt-2 max-w-md">
                Register, allocate, book, and maintain your organization's
                equipment from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="border border-white/25 text-text-inverse/80 font-mono text-[11px] rounded-full px-2.5 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
