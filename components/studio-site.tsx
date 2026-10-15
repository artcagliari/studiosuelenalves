"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Camera,
  MapPin,
  Menu,
  MoveHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { gallerySlots, navigation, services, studio, timeline } from "@/lib/site-data";

function ContactLink({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const href = studio.whatsappUrl ?? studio.instagramUrl;
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function WordReveal({ children }: { children: string }) {
  return (
    <span aria-label={children} className="word-reveal">
      {children.split(" ").map((word, index) => (
        <span aria-hidden="true" className="word-clip" key={`${word}-${index}`}>
          <span style={{ "--word-index": index } as React.CSSProperties}>{word}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

function MediaPlaceholder({
  file,
  label,
  tone = "sand",
  className = "",
}: {
  file: string;
  label: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div className={`media-placeholder tone-${tone} ${className}`} data-cursor="view">
      <div className="media-grain" />
      <span className="media-number">SV</span>
      <div className="media-label">
        <span>{label}</span>
        <small>Mídia oficial · {file}</small>
      </div>
    </div>
  );
}

function OfficialMedia({
  file,
  label,
  tone,
  className = "",
}: {
  file: string;
  label: string;
  tone: string;
  className?: string;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return <MediaPlaceholder file={file} label={label} tone={tone} className={className} />;
  return (
    <div className={`official-media ${className}`} data-cursor="view">
      <Image
        alt={`${label} — Studio Suelen Vaes`}
        fill
        onError={() => setMissing(true)}
        sizes="(max-width: 680px) 100vw, 50vw"
        src={`/images/official/${file}`}
      />
      <span>{label}</span>
    </div>
  );
}

function BeforeAfter() {
  const [position, setPosition] = useState(52);
  return (
    <div className="comparison" style={{ "--position": `${position}%` } as React.CSSProperties}>
      <div className="compare-layer before">
        <OfficialMedia file="antes-01.webp" label="Antes" tone="stone" />
      </div>
      <div className="compare-layer after">
        <OfficialMedia file="depois-01.webp" label="Depois" tone="bronze" />
      </div>
      <input
        aria-label="Comparar antes e depois"
        className="comparison-range"
        max="100"
        min="0"
        onChange={(event) => setPosition(Number(event.target.value))}
        type="range"
        value={position}
      />
      <div className="comparison-line" aria-hidden="true">
        <span><MoveHorizontal size={17} /></span>
      </div>
      <span className="compare-tag tag-before">Antes</span>
      <span className="compare-tag tag-after">Depois</span>
      <span className="comparison-note">Transformação real publicada pelo Studio</span>
    </div>
  );
}

function Gallery() {
  const [filter, setFilter] = useState("Todos");
  const [active, setActive] = useState<number | null>(null);
  const filters = ["Todos", "Mega hair", "Coloração", "Cabelo", "Studio"];
  const items = useMemo(
    () => (filter === "Todos" ? gallerySlots : gallerySlots.filter((item) => item.category === filter)),
    [filter],
  );

  const move = (direction: number) => {
    if (active === null) return;
    const current = items.findIndex((item) => item.id === active);
    setActive(items[(current + direction + items.length) % items.length].id);
  };

  const activeItem = items.find((item) => item.id === active);

  return (
    <>
      <div className="gallery-filters" role="group" aria-label="Filtrar galeria">
        {filters.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="masonry-grid">
        {items.map((item, index) => (
          <button
            aria-label={`Ampliar espaço para ${item.category}`}
            className={`gallery-item gallery-item-${index % 5}`}
            key={item.id}
            onClick={() => setActive(item.id)}
            type="button"
          >
            <OfficialMedia file={item.file} label={item.category} tone={item.tone} />
          </button>
        ))}
      </div>
      {activeItem && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada">
          <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Fechar" type="button">
            <X />
          </button>
          <button className="lightbox-arrow left" onClick={() => move(-1)} aria-label="Anterior" type="button">
            <ChevronLeft />
          </button>
          <OfficialMedia file={activeItem.file} label={activeItem.category} tone={activeItem.tone} />
          <button className="lightbox-arrow right" onClick={() => move(1)} aria-label="Próxima" type="button">
            <ChevronRight />
          </button>
        </div>
      )}
    </>
  );
}

export default function StudioSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let cleanup = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.05, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } },
          );
        });
        gsap.to(".hero-art", {
          yPercent: 9,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
        });
        gsap.to(".story-art", {
          yPercent: -7,
          ease: "none",
          scrollTrigger: { trigger: ".story-art-wrap", start: "top bottom", end: "bottom top", scrub: 0.7 },
        });
      });
      cleanup = () => context.revert();
    });

    const moveCursor = (event: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };
    window.addEventListener("mousemove", moveCursor);
    return () => {
      cleanup();
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <main className={loaded ? "site is-loaded" : "site"}>
      <div className="cursor" ref={cursorRef} aria-hidden="true"><span>ver</span></div>
      <div className="preloader" aria-hidden="true">
        <span>SV</span><i />
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Studio Suelen Vaes, início">
          <span className="brand-monogram">SV</span>
          <span className="brand-name">Studio<br />Suelen Vaes</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <ContactLink className="nav-cta magnetic">Agendar <ArrowUpRight size={15} /></ContactLink>
        <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" type="button"><Menu /></button>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu" type="button"><X /></button>
        <span>Studio Suelen Vaes</span>
        <nav>
          {navigation.map((item, index) => (
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}><small>0{index + 1}</small>{item.label}</a>
          ))}
        </nav>
        <ContactLink className="mobile-contact">Falar com o Studio <ArrowUpRight /></ContactLink>
      </div>

      <section className="hero" id="top">
        <Image
          className="hero-art"
          alt="Composição editorial abstrata em seda e tons champagne"
          src="/images/official/hero-transformacao.webp"
          fill
          priority
          sizes="100vw"
          onError={(event) => { event.currentTarget.src = "/images/editorial-ribbons.png"; }}
        />
        <div className="hero-shade" />
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">{studio.eyebrow}</p>
          <h1><WordReveal>Seu cabelo muda.</WordReveal><br /><em>Sua presença também.</em></h1>
          <p className="hero-copy">Uma experiência de beleza construída com técnica, escuta e a coragem de se reconhecer de um jeito novo.</p>
          <div className="hero-actions">
            <ContactLink className="button button-light magnetic">Agende sua transformação <ArrowUpRight size={17} /></ContactLink>
            <a className="text-link" href="#transformacoes">Conheça nosso trabalho <ArrowDown size={16} /></a>
          </div>
        </div>
        <div className="hero-foot">
          <span>Especialista em mega hair</span>
          <span className="scroll-cue"><i /> Explore</span>
          <span>Proposta digital independente</span>
        </div>
      </section>

      <section className="manifesto section-pad">
        <div className="section-index" data-reveal>01 / Essência</div>
        <div className="manifesto-grid">
          <p className="manifesto-side" data-reveal>Beleza não é sobre se tornar outra pessoa. É sobre se sentir inteira.</p>
          <h2 data-reveal>Transformar o cabelo pode ser o primeiro gesto de uma mudança que acontece <em>por dentro.</em></h2>
        </div>
        <div className="manifesto-ribbon" aria-hidden="true">
          <span>identidade</span><i /> <span>movimento</span><i /> <span>autoconfiança</span><i /> <span>cuidado</span>
        </div>
      </section>

      <section className="mega section-pad" id="mega-hair">
        <div className="mega-intro">
          <div>
            <div className="section-index light" data-reveal>02 / A especialidade</div>
            <p className="mega-overline" data-reveal><Sparkles size={14} /> Mega hair</p>
            <h2 data-reveal>Comprimento.<br />Volume.<br /><em>Naturalidade.</em></h2>
          </div>
          <div className="mega-copy" data-reveal>
            <p>O mega hair é o ponto de encontro entre técnica e desejo. Cada transformação começa pela escolha cuidadosa do cabelo e por uma leitura individual de textura, proporção e rotina.</p>
            <ContactLink className="button button-outline">Quero conhecer o mega hair <ArrowRight size={16} /></ContactLink>
          </div>
        </div>
        <div className="mega-composition">
          <OfficialMedia className="mega-image-one" file="mega-hair-detalhe-01.webp" label="Resultado real" tone="champagne" />
          <OfficialMedia className="mega-image-two" file="mega-hair-detalhe-02.webp" label="Detalhe & movimento" tone="coffee" />
          <div className="mega-stamp" aria-hidden="true"><span>feito para você · feito para durar · </span><b>SV</b></div>
        </div>
        <div className="compare-block">
          <div className="compare-heading" data-reveal>
            <span>Antes & depois</span>
            <h3>Veja a transformação.<br />Sinta a diferença.</h3>
            <p>Arraste o controle para comparar. O componente está pronto para receber um par autorizado da mesma cliente.</p>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <section className="story section-pad" id="historia">
        <div className="section-index" data-reveal>03 / A trajetória</div>
        <div className="story-grid">
          <div className="story-art-wrap" data-reveal>
            <Image className="story-art" alt="Suélen Vaes" src="/images/official/suelen-retrato.webp" fill sizes="(max-width: 800px) 100vw, 45vw" onError={(event) => { event.currentTarget.src = "/images/editorial-glass.png"; }} />
            <span>Suélen em atendimento · Instagram oficial</span>
          </div>
          <div className="story-copy">
            <p className="script" data-reveal>Uma história de coragem.</p>
            <h2 data-reveal>Ela começou cedo.<br />E nunca parou de <em>acreditar.</em></h2>
            <p data-reveal>Suélen iniciou na beleza aos 13 anos. Aos 15, já investia em formação. Aos 17, abriu o próprio salão com poucos recursos e uma ideia muito clara: crescer pelo trabalho, pela técnica e pela confiança das clientes.</p>
            <p data-reveal>O mega hair tornou-se um diferencial e impulsionou uma trajetória que hoje inspira profissionais e transforma autoestima em Bento Gonçalves.</p>
            <a className="source-link" href={studio.pressUrl} target="_blank" rel="noreferrer">Conheça a história publicada pelo NB Notícias <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="timeline">
          {timeline.map((item) => (
            <article key={item.marker} data-reveal>
              <span>{item.marker}</span><i />
              <h3>{item.title}</h3><p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="services section-pad" id="servicos">
        <div className="services-header">
          <div><div className="section-index light" data-reveal>04 / Experiências</div><p data-reveal>Um Studio, muitas formas de cuidar de você.</p></div>
          <h2 data-reveal>Beleza que acompanha<br /><em>todos os seus momentos.</em></h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article key={service.number} data-reveal>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <small>{service.note}</small>
              <ContactLink className="round-arrow"><ArrowUpRight /></ContactLink>
            </article>
          ))}
        </div>
      </section>

      <section className="transformations section-pad" id="transformacoes">
        <div className="gallery-header">
          <div className="section-index" data-reveal>05 / Portfólio</div>
          <h2 data-reveal>Transformações<br />que contam <em>histórias.</em></h2>
          <p data-reveal>Uma seleção editorial de trabalhos publicados pelo perfil oficial do Studio — resultados, movimento e beleza real.</p>
        </div>
        <Gallery />
        <div className="instagram-row">
          <span>O trabalho real acontece todos os dias.</span>
          <a className="button button-dark" href={studio.instagramUrl} target="_blank" rel="noreferrer"><Camera size={17} /> Ver mais no Instagram</a>
        </div>
      </section>

      <section className="award-section">
        <div className="award-glow" aria-hidden="true" />
        <div className="award-mark" data-reveal><Award /></div>
        <p data-reveal>Reconhecimento da comunidade</p>
        <h2 data-reveal><span>1º lugar</span> Melhor Salão<br />de Beleza de Bento</h2>
        <div className="award-meta" data-reveal><span>Prêmio Melhores de Bento</span><strong>2025</strong><span>20,2% dos votos</span></div>
        <a href={studio.awardUrl} target="_blank" rel="noreferrer">Ver resultado publicado <ArrowUpRight size={14} /></a>
      </section>

      <section className="visit section-pad" id="visite">
        <div className="visit-copy">
          <div className="section-index" data-reveal>06 / Seu próximo gesto</div>
          <h2 data-reveal>Talvez a sua<br />transformação<br /><em>comece aqui.</em></h2>
          <ContactLink className="button button-dark magnetic">Agendar meu horário <ArrowUpRight size={17} /></ContactLink>
        </div>
        <div className="location-card" data-reveal>
          <div className="location-map" aria-hidden="true">
            <span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" />
            <span className="map-pin"><MapPin /></span>
            <b>Bento Gonçalves</b>
          </div>
          <div className="location-info">
            <span>Studio Suelen Vaes</span>
            <h3>{studio.address}</h3>
            <p>Horários e disponibilidade: confirme diretamente com o Studio.</p>
            <div>
              <a href={studio.mapsUrl} target="_blank" rel="noreferrer">Como chegar <ArrowUpRight size={14} /></a>
              <a href={studio.instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <a className="brand footer-brand" href="#top"><span className="brand-monogram">SV</span><span className="brand-name">Studio<br />Suelen Vaes</span></a>
          <h2>Seu momento.<br /><em>Sua transformação.</em></h2>
          <div className="footer-links">
            <a href={studio.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            <a href={studio.mapsUrl} target="_blank" rel="noreferrer">Localização</a>
            <ContactLink>Falar com o Studio</ContactLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Studio Suelen Vaes</span>
          <span>Proposta independente, ainda não oficial · Fotografias do perfil @studiosuelenvaes</span>
          <a href="#top">Voltar ao topo ↑</a>
        </div>
      </footer>

      <ContactLink className="floating-contact"><span>Agendar</span><ArrowUpRight /></ContactLink>
    </main>
  );
}
