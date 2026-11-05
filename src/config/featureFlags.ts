// Build-time kill switches for features that are merged but not ready to
// ship. Public profiles are opt-in; university browsing and dark mode
// are enabled unless explicitly switched off.
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

  /** ON by default. Partner-facing read-only Universities list and details
   *  (/partner/universities). The admin and data-entry university
   *  management screens are a separate feature and stay enabled. */
  partnerUniversities: process.env.NEXT_PUBLIC_ENABLE_PARTNER_UNIVERSITIES !== "false",

  /** Near-black dark mode (docs/unibexs-dark-mode-guide.md). ON unless
   *  NEXT_PUBLIC_ENABLE_DARK_MODE is "false" — a kill switch while the guide
   *  awaits Brand sign-off. Off: everything renders light and the Light /
   *  Dark / System switch is hidden. Colors live in src/styles/tokens/semantic.css. */
  darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== "false",
};
