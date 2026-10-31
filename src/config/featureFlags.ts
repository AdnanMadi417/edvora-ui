// Build-time kill switches for features that are merged but not ready to
// ship. Each one is OFF unless its variable is explicitly "true", so a
// deploy that sets nothing keeps the feature hidden — the safe default for
// a release branch.
//
// These are NEXT_PUBLIC_* because the same flag is read from three
// runtimes: the partner sidebar (client) and the
// server-rendered /p/[slug] page. Next.js inlines NEXT_PUBLIC_* values at
// build time, so flipping one needs a rebuild, not just an env change on
// the host.

const enabled = (value: string | undefined) => value === "true";

export const FEATURES = {
  /** Partner "My Public Profile" editor (/partner/public-profile) and the
   *  shareable public page it links to (/p/[slug]). UBX-317/331. */
  partnerPublicProfile: enabled(process.env.NEXT_PUBLIC_ENABLE_PARTNER_PUBLIC_PROFILE),

  /** Partner-facing read-only Universities list and details
   *  (/partner/universities). The admin and data-entry university
   *  management screens are a separate feature and stay enabled. */
  partnerUniversities: enabled(process.env.NEXT_PUBLIC_ENABLE_PARTNER_UNIVERSITIES),

  /** Near-black dark mode (docs/unibexs-dark-mode-guide.md). ON unless
   *  NEXT_PUBLIC_ENABLE_DARK_MODE is "false" — a kill switch while the guide
   *  awaits Brand sign-off. Off: everything renders light and the Light /
   *  Dark / System switch is hidden. Colors live in src/styles/tokens/semantic.css. */
  darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== "false",
};
