import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/store/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center panel rounded-2xl p-8 corner-frame">
        <h1 className="font-display text-7xl text-primary text-glow-cyan">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist on the Make-a-Thon network.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Return to base
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Make-a-Thon 7.0 — ECE Department, SVCE" },
      {
        name: "description",
        content:
          "Final-round registration portal for Make-a-Thon 7.0, the flagship hackathon of the ECE Department, Sri Venkateswara College of Engineering.",
      },
      { property: "og:title", content: "Make-a-Thon 7.0 — ECE Department, SVCE" },
      { property: "og:description", content: "A secure, full-stack portal for final round hackathon registration." },
      { property: "og:type", content: "website" },
      {
        httpEquiv: "Content-Security-Policy",
        content:
          "default-src 'self'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
      },
      { name: "twitter:title", content: "Make-a-Thon 7.0 — ECE Department, SVCE" },
      { name: "description", content: "A secure, full-stack portal for final round hackathon registration." },
      { name: "twitter:description", content: "A secure, full-stack portal for final round hackathon registration." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pZIfe54UMSSR4LpFZdncTXa8zud2/social-images/social-1776618750513-MAKEATHON_LOGO.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pZIfe54UMSSR4LpFZdncTXa8zud2/social-images/social-1776618750513-MAKEATHON_LOGO.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
