(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const style = document.createElement("style");
    style.textContent = `
        :root {
            --anim-ease: cubic-bezier(0.22, 1, 0.36, 1);
            --anim-duration: 700ms;
            --nav-indicator-color: #155DFC;
            --nav-indicator-height: 3px;
        }

        [data-anim-reveal] {
            opacity: 0;
            transform: translateY(22px) scale(0.99);
            transition:
                opacity var(--anim-duration) var(--anim-ease),
                transform var(--anim-duration) var(--anim-ease);
            will-change: opacity, transform;
        }

        [data-anim-reveal].is-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        [data-anim-hover] {
            transition: transform 240ms var(--anim-ease), box-shadow 240ms ease;
            will-change: transform;
        }

        [data-anim-hover]:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 28px -16px rgba(0, 0, 0, 0.35);
        }

        /* Containing block for .nav-indicator (desktop only). On small screens nav .container must stay position:fixed for the drawer — a bare "relative" rule would override equal-specificity mobile rules loaded earlier. */
        @media (min-width: 769px) {
            nav .container {
                position: relative;
            }
        }

        nav .container > a {
            position: relative;
            transition: color 220ms ease;
        }

        nav .container > a.is-active {
            color: var(--nav-indicator-color) !important;
        }

        nav .container .nav-indicator {
            position: absolute;
            left: 0;
            bottom: -6px;
            width: 0;
            height: var(--nav-indicator-height);
            border-radius: 999px;
            background: var(--nav-indicator-color);
            transition:
                transform 320ms var(--anim-ease),
                width 320ms var(--anim-ease),
                opacity 220ms ease;
            transform: translateX(0);
            opacity: 0;
            pointer-events: none;
        }

        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            transform-origin: 0 50%;
            transform: scaleX(0);
            background: linear-gradient(90deg, #155DFC, #4f86ff);
            z-index: 10000;
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            [data-anim-reveal],
            [data-anim-hover],
            nav .container .nav-indicator,
            .scroll-progress {
                transition: none !important;
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    const revealSelector = [
        ".flats_box",
        ".flats_info",
        ".box_arg",
        ".arguments",
        ".inf_cont",
        ".as",
        ".process_box",
        ".text_box",
        ".cont",
        ".brief_inf .cont",
        ".ready .box"
    ].join(", ");

    const hoverSelector = [
        ".flats_box",
        ".flats_info",
        ".box_arg",
        ".inf_cont",
        ".as",
        ".process_box",
        ".text_box",
        "button",
        ".icons"
    ].join(", ");

    document.querySelectorAll(revealSelector).forEach((el) => {
        el.setAttribute("data-anim-reveal", "");
    });

    document.querySelectorAll(hoverSelector).forEach((el) => {
        el.setAttribute("data-anim-hover", "");
    });

    const revealElements = Array.from(document.querySelectorAll("[data-anim-reveal]"));
    const markVisibleIfInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < viewportHeight * 0.92) {
            element.classList.add("is-visible");
            return true;
        }
        return false;
    };

    if (reduceMotion) {
        revealElements.forEach((el) => el.classList.add("is-visible"));
    } else if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );

        revealElements.forEach((el) => {
            if (!markVisibleIfInViewport(el)) {
                revealObserver.observe(el);
            }
        });
    } else {
        revealElements.forEach((el) => el.classList.add("is-visible"));
    }

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);

    const updateProgress = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    const navContainer = document.querySelector("nav .container");
    const navLinks = navContainer ? Array.from(navContainer.querySelectorAll("a[href]")) : [];
    const pageLinks = navLinks.filter((link) => !link.getAttribute("href").startsWith("#"));
    const hashLinks = navLinks.filter((link) => link.getAttribute("href").startsWith("#"));

    if (navContainer && navLinks.length > 0) {
        const indicator = document.createElement("span");
        indicator.className = "nav-indicator";
        navContainer.appendChild(indicator);

        const normalizePath = (path) => {
            if (!path || path === "/" || path.endsWith("/")) {
                return "index.html";
            }
            const normalized = path.split("/").pop() || "index.html";
            return normalized.toLowerCase();
        };

        const currentPage = normalizePath(window.location.pathname);

        const moveIndicator = (targetLink) => {
            if (!targetLink) {
                indicator.style.opacity = "0";
                indicator.style.width = "0";
                return;
            }
            const parentRect = navContainer.getBoundingClientRect();
            const linkRect = targetLink.getBoundingClientRect();
            indicator.style.opacity = "1";
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
        };

        const setActiveLink = (link) => {
            navLinks.forEach((item) => item.classList.remove("is-active"));
            if (link) {
                link.classList.add("is-active");
            }
            moveIndicator(link);
        };

        let activePageLink =
            pageLinks.find((link) => {
                const href = normalizePath(link.getAttribute("href"));
                return href === currentPage;
            }) || null;

        if (!activePageLink && pageLinks.length > 0) {
            activePageLink = pageLinks[0];
        }

        if (activePageLink) {
            setActiveLink(activePageLink);
        }

        if (hashLinks.length > 0) {
            const sections = hashLinks
                .map((link) => {
                    const selector = link.getAttribute("href");
                    const section = selector ? document.querySelector(selector) : null;
                    return section ? { link, section } : null;
                })
                .filter(Boolean);

            if (sections.length > 0 && "IntersectionObserver" in window) {
                const sectionObserver = new IntersectionObserver(
                    (entries) => {
                        const visible = entries
                            .filter((entry) => entry.isIntersecting)
                            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                        if (visible.length === 0) {
                            return;
                        }

                        const currentSection = sections.find(
                            (item) => item.section === visible[0].target
                        );

                        if (currentSection) {
                            setActiveLink(currentSection.link);
                        }
                    },
                    { threshold: [0.25, 0.45, 0.7], rootMargin: "-10% 0px -55% 0px" }
                );

                sections.forEach(({ section }) => sectionObserver.observe(section));
            }
        }

        navLinks.forEach((link) => {
            link.addEventListener("mouseenter", () => moveIndicator(link));
            link.addEventListener("focus", () => moveIndicator(link));
            link.addEventListener("mouseleave", () => {
                const active = navContainer.querySelector("a.is-active");
                moveIndicator(active);
            });
            link.addEventListener("blur", () => {
                const active = navContainer.querySelector("a.is-active");
                moveIndicator(active);
            });
        });

        window.addEventListener("resize", () => {
            const active = navContainer.querySelector("a.is-active");
            moveIndicator(active);
        });
    }

    if (!reduceMotion) {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const href = anchor.getAttribute("href");
                if (!href || href === "#") {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

})();
