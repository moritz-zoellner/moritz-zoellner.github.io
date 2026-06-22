document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll("[data-one-page-nav]"));
  const navbar = document.getElementById("navbar");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!navLinks.length) {
    return;
  }

  const sectionIds = ["about", "research", "teaching"];
  const sections = sectionIds
    .map((id) => ({
      id,
      element: document.getElementById(id),
      item: document.querySelector(`[data-one-page-nav-item="${id}"]`),
      link: document.querySelector(`[data-one-page-nav="${id}"]`),
    }))
    .filter((section) => section.element && section.item && section.link);

  const getNavbarOffset = () => {
    if (!navbar) {
      return 0;
    }

    return Math.ceil(navbar.getBoundingClientRect().height) + 16;
  };

  const setActiveSection = (activeId) => {
    sections.forEach((section) => {
      const isActive = section.id === activeId;
      section.item.classList.toggle("active", isActive);

      if (isActive) {
        section.link.setAttribute("aria-current", "page");
      } else {
        section.link.removeAttribute("aria-current");
      }
    });
  };

  const closeMobileNav = () => {
    const toggle = document.querySelector("[data-nav-toggle='navbarNav']");
    const panel = document.getElementById("navbarNav");

    if (!toggle || !panel) {
      return;
    }

    panel.classList.remove("show");
    toggle.classList.add("collapsed");
    toggle.setAttribute("aria-expanded", "false");
  };

  const scrollToSection = (id) => {
    const section = sections.find((candidate) => candidate.id === id);
    if (!section) {
      return;
    }

    const targetTop =
      id === "about"
        ? 0
        : window.scrollY + section.element.getBoundingClientRect().top - getNavbarOffset();

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: reduceMotion ? "auto" : "smooth",
    });

    history.replaceState(null, "", `#${id}`);
    setActiveSection(id);
    closeMobileNav();
  };

  const updateActiveSection = () => {
    const activationLine = getNavbarOffset() + 40;
    let activeId = "about";

    sections.forEach((section) => {
      if (section.element.getBoundingClientRect().top <= activationLine) {
        activeId = section.id;
      }
    });

    setActiveSection(activeId);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("data-one-page-nav");
      const targetUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (targetUrl.pathname !== currentUrl.pathname || targetUrl.origin !== currentUrl.origin) {
        return;
      }

      event.preventDefault();
      scrollToSection(targetId);
    });
  });

  let ticking = false;
  const requestActiveUpdate = () => {
    if (ticking) {
      return;
    }

    window.requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
    ticking = true;
  };

  window.addEventListener("scroll", requestActiveUpdate, { passive: true });
  window.addEventListener("resize", requestActiveUpdate);

  if (window.location.hash) {
    const targetId = window.location.hash.replace("#", "");
    window.setTimeout(() => scrollToSection(targetId), 0);
  } else {
    updateActiveSection();
  }
});
