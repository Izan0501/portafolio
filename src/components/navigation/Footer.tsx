"use client";

import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";
import { SITE } from "@/config/site";

/**
 * The site-wide footer (plan M12) — full rewrite off the legacy
 * cyberpunk design (cyan/neon palette, a kinetic mouse-tracked watermark,
 * links to sections the recorrido no longer has, a WhatsApp channel never
 * confirmed as a real contact method). Same real identity/contact data as
 * `config/site.ts` and the 3D Contacto chapter (`cta.ts`) — name, role,
 * email, LinkedIn and GitHub, nothing invented.
 */
export const Footer = () => {
  const { t } = useI18n();

  const channels = [
    { label: t.footer.channels.github, href: SITE.github, icon: FiGithub },
    { label: t.footer.channels.linkedin, href: SITE.linkedin, icon: FiLinkedin },
    { label: t.footer.channels.email, href: `mailto:${SITE.email}`, icon: FiMail },
  ];

  return (
    <footer className="w-full bg-tinta relative z-10 shadow-[inset_0_1px_0_0_var(--color-linea)] pt-16 pb-10 px-[clamp(20px,6vw,96px)]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
        <div>
          <p className="font-extrabold text-[20px] tracking-[-0.02em] text-hueso">{SITE.name}</p>
          <p className="font-mono text-[12px] text-piedra mt-1">{SITE.role}</p>
          <p className="text-[14px] leading-[1.5] text-texto-2 mt-3 max-w-[360px]">{t.footer.availability}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-piedra mb-1">{t.footer.channelsHeading}</span>
          {channels.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-[14px] text-texto-2 hover:text-limon transition-colors"
            >
              <Icon aria-hidden /> {label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-[11px] text-piedra shadow-[inset_0_1px_0_0_var(--color-linea)] pt-5">
        <span>{t.footer.copyright(new Date().getFullYear())}</span>
        <span>{t.footer.builtWith}</span>
      </div>
    </footer>
  );
};
