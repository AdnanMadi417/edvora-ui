// All copy, links and data for the studio landing page
// (/landing-template). Every value here is a placeholder: replace
// names, numbers, prices, quotes and contact details with your own.

export const site = {
  name: "Unibexs",
  tagline: "We design and build software that ships.",
  description:
    "Unibexs is a software studio that designs and builds web apps, mobile apps, SaaS products and AI integrations for startups and enterprises worldwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  path: "/landing-template",
  location: "[CITY, COUNTRY]",
  email: "hello@example.com",
  phone: "+00 000 000 000",
  address: "[STREET ADDRESS], [CITY, COUNTRY]",
  calendlyUrl: "", // e.g. "https://calendly.com/your-team/30min" — embeds when set
  ogImage: "/placeholders/og.svg",
};

export const nav = {
  links: [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "Process", href: "#process" },
    { label: "About", href: "#about" },
    { label: "Blog", href: "#" },
  ],
  cta: { label: "Book a call", href: "#contact" },
};

export const hero = {
  badge: "Available for new projects — Q1",
  headline: ["We build software that", "moves your business forward"],
  subheadline:
    "A senior team of designers and engineers turning ambitious ideas into fast, reliable products — from first sketch to scale.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "See our work", href: "#work" },
  showreel: {
    label: "Watch showreel",
    // MP4/WebM URL or an embeddable (YouTube/Vimeo) URL. Empty shows a placeholder.
    src: "",
  },
};

export const clientLogos = {
  heading: "Trusted by startups and enterprises",
  logos: ["northwind", "acme", "globex", "initech", "umbrella", "hooli", "stark", "wayne"].map((slug) => ({
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    src: `/placeholders/logos/${slug}.svg`,
  })),
};

export type IconKey =
  | "web"
  | "mobile"
  | "rocket"
  | "design"
  | "ai"
  | "api"
  | "discovery"
  | "build"
  | "launch"
  | "support";

export const services = {
  eyebrow: "Services",
  heading: "Everything you need to ship",
  subheading: "One team across product, design and engineering — so nothing gets lost between handoffs.",
  items: [
    { icon: "web", title: "Web apps", description: "Fast, accessible web applications built on modern frameworks and designed to scale with you.", href: "#contact" },
    { icon: "mobile", title: "Mobile apps", description: "Native-feel iOS and Android apps from a single codebase, shipped to both stores.", href: "#contact" },
    { icon: "rocket", title: "SaaS & MVP development", description: "From idea to paying users in weeks: auth, billing, dashboards and analytics done right.", href: "#contact" },
    { icon: "design", title: "UI/UX design", description: "Research-led product design and design systems that make complex workflows feel simple.", href: "#contact" },
    { icon: "ai", title: "AI integrations", description: "LLM features, copilots and automations wired into your product with evals and guardrails.", href: "#contact" },
    { icon: "api", title: "API & system integrations", description: "Payments, CRMs, ERPs and legacy systems connected through reliable, well-documented APIs.", href: "#contact" },
  ] satisfies { icon: IconKey; title: string; description: string; href: string }[],
};

export const caseStudies = {
  eyebrow: "Selected work",
  heading: "Products we've shipped",
  viewAll: { label: "View all projects", href: "#" },
  items: [
    {
      client: "Northwind Health",
      industry: "Healthcare",
      title: "Patient portal rebuilt for speed and trust",
      metric: "+38% conversion",
      tags: ["Next.js", "Node.js", "PostgreSQL"],
      cover: "/placeholders/case-1.svg",
    },
    {
      client: "Globex Logistics",
      industry: "Logistics",
      title: "Real-time fleet tracking across 12 countries",
      metric: "−42% delivery delays",
      tags: ["React Native", "Go", "AWS"],
      cover: "/placeholders/case-2.svg",
    },
    {
      client: "Initech Finance",
      industry: "Fintech",
      title: "AI-assisted underwriting for SME loans",
      metric: "3× faster approvals",
      tags: ["Python", "OpenAI", "Django"],
      cover: "/placeholders/case-3.svg",
    },
    {
      client: "Hooli Learn",
      industry: "EdTech",
      title: "A learning platform that scaled to 200k students",
      metric: "200k active users",
      tags: ["Flutter", "Laravel", "GCP"],
      cover: "/placeholders/case-4.svg",
    },
  ],
};

export const processSteps = {
  eyebrow: "Process",
  heading: "How we work",
  subheading: "A clear path from idea to launch, with a working demo every week.",
  steps: [
    { title: "Discovery", description: "Workshops to align on goals, users, scope and success metrics.", duration: "1–2 weeks" },
    { title: "Design", description: "Flows, prototypes and a design system validated with real users.", duration: "2–4 weeks" },
    { title: "Build", description: "Iterative sprints with weekly demos, CI/CD and automated tests.", duration: "6–16 weeks" },
    { title: "Launch", description: "Hardening, performance tuning, store submissions and go-live.", duration: "1–2 weeks" },
    { title: "Support", description: "Monitoring, SLAs and a roadmap for what comes next.", duration: "Ongoing" },
  ],
};

export type TechKey =
  | "react" | "next" | "typescript" | "tailwind" | "vue"
  | "node" | "laravel" | "django" | "go" | "postgres" | "redis" | "graphql"
  | "flutter" | "reactnative" | "swift" | "kotlin" | "expo"
  | "aws" | "gcp" | "azure" | "docker" | "kubernetes" | "vercel"
  | "openai" | "python" | "pytorch" | "mongodb";

export const techStack = {
  eyebrow: "Tech stack",
  heading: "Proven tools, chosen for your problem",
  subheading: "We pick boring, battle-tested technology by default and reach for the new when it earns its place.",
  categories: [
    { name: "Frontend", items: [["react", "React"], ["next", "Next.js"], ["typescript", "TypeScript"], ["tailwind", "Tailwind CSS"], ["vue", "Vue"]] },
    { name: "Backend", items: [["node", "Node.js"], ["laravel", "Laravel"], ["django", "Django"], ["go", "Go"], ["postgres", "PostgreSQL"], ["redis", "Redis"], ["graphql", "GraphQL"]] },
    { name: "Mobile", items: [["flutter", "Flutter"], ["reactnative", "React Native"], ["expo", "Expo"], ["swift", "Swift"], ["kotlin", "Kotlin"]] },
    { name: "Cloud", items: [["aws", "AWS"], ["gcp", "Google Cloud"], ["azure", "Azure"], ["docker", "Docker"], ["kubernetes", "Kubernetes"], ["vercel", "Vercel"]] },
    { name: "AI", items: [["openai", "OpenAI"], ["python", "Python"], ["pytorch", "PyTorch"], ["mongodb", "Vector DBs"]] },
  ] as { name: string; items: [TechKey, string][] }[],
};

export const whyUs = {
  eyebrow: "Why us",
  heading: "Built different, on purpose",
  team: { title: "Senior team only", description: "Every engineer and designer on your project has 7+ years of experience.", avatars: ["/placeholders/avatar-1.svg", "/placeholders/avatar-2.svg", "/placeholders/avatar-3.svg", "/placeholders/avatar-4.svg"], extra: "+18" },
  demos: { title: "Weekly demos", description: "See working software every Friday — no slideware.", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  pricing: { title: "Transparent pricing", description: "Itemised estimates and no surprise invoices.", lines: [["Discovery", "$4,000"], ["Design", "$12,000"], ["Build (8 sprints)", "$48,000"]], total: "$64,000" },
  uptime: { title: "99.9% uptime", description: "Monitored, alerting infrastructure on every launch.", value: "99.9%", sparkline: [12, 14, 13, 16, 15, 17, 16, 18, 17, 19, 18, 20] },
  security: { title: "Security first", description: "Secure by default, audited before launch.", checks: ["OWASP Top 10 reviewed", "SSO & role-based access", "Encrypted at rest & in transit", "Pen-test before launch"] },
  support: { title: "Post-launch support", description: "A real team on a shared channel, not a ticket queue.", messages: [["client", "Checkout feels slow on Android. Can you take a look?"], ["team", "On it — fix shipping in the next release."], ["team", "Deployed. p95 is down 61%."]] as ["client" | "team", string][] },
};

export const stats = {
  items: [
    { value: 150, suffix: "+", label: "Projects delivered" },
    { value: 80, suffix: "+", label: "Clients worldwide" },
    { value: 10, suffix: "", label: "Years in business" },
    { value: 94, suffix: "%", label: "Client retention" },
  ],
};

export const testimonials = {
  eyebrow: "Testimonials",
  heading: "Teams that ship with us, stay with us",
  items: [
    { quote: "They took us from a Figma file to a live product in ten weeks. The weekly demos meant we were never surprised.", name: "Sarah Chen", role: "CEO", company: "Northwind Health", avatar: "/placeholders/avatar-1.svg", logo: "/placeholders/logos/northwind.svg", rating: 5 },
    { quote: "The most senior team we've worked with. They challenged our assumptions and the product is better for it.", name: "Marcus Okafor", role: "VP Engineering", company: "Globex Logistics", avatar: "/placeholders/avatar-2.svg", logo: "/placeholders/logos/globex.svg", rating: 5 },
    { quote: "Our AI underwriting feature went from prototype to production with proper evals and guardrails. Rock solid.", name: "Priya Raman", role: "Head of Product", company: "Initech Finance", avatar: "/placeholders/avatar-3.svg", logo: "/placeholders/logos/initech.svg", rating: 5 },
    { quote: "Transparent pricing, clear communication and code we actually own. Exactly what a development partner should be.", name: "Daniel Novak", role: "Founder", company: "Hooli Learn", avatar: "/placeholders/avatar-4.svg", logo: "/placeholders/logos/hooli.svg", rating: 5 },
    { quote: "They plugged into our team seamlessly and doubled our release velocity within a quarter.", name: "Amina Yusuf", role: "CTO", company: "Umbrella Retail", avatar: "/placeholders/avatar-5.svg", logo: "/placeholders/logos/umbrella.svg", rating: 4 },
  ],
};

export const engagementModels = {
  eyebrow: "Engagement models",
  heading: "Work with us the way that fits",
  items: [
    {
      name: "Fixed-price project",
      for: "Clear scope and a deadline — MVPs, redesigns, new features.",
      includes: ["Discovery & scoping workshop", "Fixed timeline and budget", "Design, build and launch", "30 days of post-launch fixes"],
      price: "Starting from $15k",
      cta: { label: "Get an estimate", href: "#contact" },
      highlighted: false,
    },
    {
      name: "Dedicated team",
      for: "Long-term products that need a full squad that scales with you.",
      includes: ["PM, designers and engineers", "Weekly demos and roadmap reviews", "Scale the team up or down monthly", "Shared Slack & full code ownership"],
      price: "Starting from $12k / month",
      cta: { label: "Build my team", href: "#contact" },
      highlighted: true,
    },
    {
      name: "Hourly / Retainer",
      for: "Ongoing improvements, audits and support for existing products.",
      includes: ["Flexible hours bank", "Priority support SLA", "Monthly reporting", "Architecture & code audits"],
      price: "Starting from $90 / hour",
      cta: { label: "Talk to us", href: "#contact" },
      highlighted: false,
    },
  ],
};

export const faq = {
  eyebrow: "FAQ",
  heading: "Questions, answered",
  items: [
    { q: "How long does a typical project take?", a: "Most MVPs launch in 8–12 weeks. Larger platforms run 3–6 months, delivered in iterative releases so you see value early." },
    { q: "How do you price projects?", a: "Fixed-price for well-defined scopes, monthly for dedicated teams, and hourly for retainers. Every estimate is itemised." },
    { q: "Who owns the code?", a: "You do. All code, designs and IP are transferred to you, and everything lives in your repositories from day one." },
    { q: "Will you sign an NDA?", a: "Yes — we're happy to sign your NDA before any detailed conversation, or provide our own." },
    { q: "How do you choose the tech stack?", a: "Based on your product, team and budget. We favour proven, well-supported technology and explain every trade-off." },
    { q: "Can you work with our in-house team?", a: "Absolutely. We often embed alongside internal teams, follow your processes and leave thorough documentation." },
    { q: "What happens after launch?", a: "We offer support plans with monitoring, SLAs and ongoing development — or a clean handover to your team." },
    { q: "Do you work with clients outside your timezone?", a: "Yes. We serve clients worldwide and guarantee at least four hours of daily overlap with your team." },
  ],
};

export const contact = {
  eyebrow: "Contact",
  heading: "Have a project in mind?",
  subheading: "Tell us a bit about it and we'll reply within one business day.",
  budgets: ["< $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"],
  call: {
    title: "Book a 30-min call",
    description: "Prefer to talk? Pick a time that suits you and meet the team.",
    cta: "Choose a time",
  },
  success: "Thanks — we've received your message and will be in touch within one business day.",
};

export const footer = {
  columns: [
    { title: "Services", links: services.items.map((s) => ({ label: s.title, href: "#services" })) },
    { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Work", href: "#work" }, { label: "Process", href: "#process" }, { label: "Careers", href: "#" }] },
    { title: "Resources", links: [{ label: "Blog", href: "#" }, { label: "FAQ", href: "#faq" }, { label: "Case studies", href: "#work" }] },
    { title: "Legal", links: [{ label: "Privacy policy", href: "#" }, { label: "Terms of service", href: "#" }, { label: "Cookie policy", href: "#" }] },
  ],
  socials: [
    { key: "linkedin", label: "LinkedIn", href: "#" },
    { key: "x", label: "X", href: "#" },
    { key: "github", label: "GitHub", href: "#" },
    { key: "dribbble", label: "Dribbble", href: "#" },
    { key: "instagram", label: "Instagram", href: "#" },
  ] as { key: "linkedin" | "x" | "github" | "dribbble" | "instagram"; label: string; href: string }[],
};
