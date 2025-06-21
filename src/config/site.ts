export const siteConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  social: {
    github: "https://github.com/FbW-WD-24-D08/canban",
  },
  meta: {
    index: {
      title: "Canban | Home",
      desc: "Willkommen bei Canban!",
      bots: true,
      keywords: "canban, home, startseite, kanban, board, projektmanagement",
    },
    dashboard: {
      title: "Canban | Dashboard",
      desc: "Dein persönliches Kanban-Board für effizientes Projektmanagement.",
      bots: true,
      keywords:
        "canban, dashboard, projektmanagement, kanban board, aufgabenverwaltung",
    },
    about: {
      title: "Canban | About",
      desc: "Erfahre mehr über Canban.",
      bots: true,
      keywords: "canban, about, über uns, projektmanagement, kanban",
    },
    signin: {
      title: "Canban | SignIn",
      desc: "Melde dich bei deinem Konto an.",
      bots: true,
      keywords: "Anmeldung, Login, Konto einloggen",
    },
    signup: {
      title: "Canban | SignUp",
      desc: "Erstelle dein Konto.",
      bots: true,
      keywords: "Registrierung, Konto erstellen",
    },
    notfound: {
      title: "Canban | 404 - Page Not Found",
      desc: "Die Seite, die du suchst, existiert nicht.",
      bots: false,
      keywords: "404, not found, error",
    },
  },
};
