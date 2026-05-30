import { SERVICES, PROJECTS, STATIONS, TESTIMONIALS, ABOUT_STATS } from '@/utils/config';

/**
 * Crawler- and no-JS-friendly content. Visually hidden (off-screen, not
 * display:none) so search engines and screen readers still get the full
 * site copy even though the experience itself is a 3D canvas.
 */
export function SeoContent() {
  return (
    <div className="sr-only-seo" aria-hidden={false}>
      <style>{`.sr-only-seo{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`}</style>

      <header>
        <h1>Pixel Web Developers — We Build Digital Experiences That Move</h1>
        <p>
          Pixel Web Developers is a digital agency specializing in immersive web
          experiences, e-commerce, mobile apps, product design, AI integration and
          automation. Explore our interactive 3D world by driving a car between zones.
        </p>
        <nav aria-label="Sections">
          <ul>
            {STATIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section id="services">
        <h2>Services</h2>
        <ul>
          {SERVICES.map((s) => (
            <li key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <ul>
                {s.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section id="portfolio">
        <h2>Portfolio</h2>
        {PROJECTS.map((p) => (
          <article key={p.id}>
            <h3>
              {p.title} — {p.client}
            </h3>
            <p>
              <strong>Problem:</strong> {p.problem}
            </p>
            <p>
              <strong>Solution:</strong> {p.solution}
            </p>
            <p>
              <strong>Tech:</strong> {p.tech.join(', ')}
            </p>
            <ul>
              {p.results.map((r) => (
                <li key={r.label}>
                  {r.label}: {r.value}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section id="about">
        <h2>About Pixel Web Developers</h2>
        <ul>
          {ABOUT_STATS.map((s) => (
            <li key={s.label}>
              {s.label}: {s.value}
              {s.suffix}
            </li>
          ))}
        </ul>
      </section>

      <section id="testimonials">
        <h2>Testimonials</h2>
        {TESTIMONIALS.map((t) => (
          <blockquote key={t.id}>
            <p>{t.quote}</p>
            <cite>
              {t.name}, {t.role}
            </cite>
          </blockquote>
        ))}
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Ready to start a project? Reach Pixel Web Developers at{' '}
          <a href="mailto:hello@pixelwebdevelopers.com">hello@pixelwebdevelopers.com</a>.
        </p>
      </section>
    </div>
  );
}
