# GioLina navigation pattern

Breadcrumbs express hierarchy; contextual CTAs help visitors move forward.

- Home, Cinematography, Photography, Reviews, Experience, About Us and Contact Us use the main header/footer and contextual CTAs. Do not enable breadcrumbs on these top-level pages.
- Sweet Sixteen uses the full main header for orientation; it has no visible breadcrumb. Compact contextual links move between film, photography and presentation.
- Events retains its existing EventsNav hierarchy and Back to GioLina treatment. The generic component is not rendered on Events routes, preventing duplicate navigation.
- For a real future deeper route, add ordered `{label, href}` ancestor items and a final `{label}` current item to that route’s content JSON. Use existing, verified internal paths only. Never create routes solely for breadcrumbs.
- Keep breadcrumb typography small, spacing compact, links underlined, focus visible and targets usable on mobile. Use the blush tone for Sweet Sixteen and established wedding colors elsewhere.
- At major section transitions, use a descriptive CTA to an existing anchor or Contact route. Never use a bare `#` or invent a presentation destination.

Current Sweet Sixteen movement: `#sweet-films`, `#sweet-photography`, Cinematography presentation at `https://mediazilla.com/62aYiGyhwV`, then Photography coverage inquiry at `/contact-us-2/?occasion=sweet-sixteen`. The Photography presentation uses the supplied `https://clients.giolinafilms.com/GabriellasUn-Sweet16`, reached through `#sweet-photo-presentation`.
