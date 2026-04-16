gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // Navbar scroll
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    });

    // Hero entry
    gsap.from(".gs-hero", {
        y: 40, opacity: 0,
        duration: 1, stagger: 0.15,
        ease: "power3.out", delay: 0.3
    });

    // Phone mockup entry — slides up with scale
    gsap.from(".gs-hero-phone", {
        y: 80, opacity: 0, scale: 0.92,
        duration: 1.2,
        ease: "power3.out", delay: 0.8
    });

    // Section reveals
    gsap.utils.toArray('.gs-reveal').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: { trigger: elem, start: "top 85%" },
            y: 40, opacity: 0,
            duration: 1, ease: "power3.out"
        });
    });

    // Capability cards stagger
    gsap.from(".cap-grid .gs-card", {
        scrollTrigger: { trigger: ".cap-grid", start: "top 80%" },
        y: 30, opacity: 0,
        duration: 0.8, stagger: 0.1,
        ease: "power2.out"
    });

    // Feature items stagger
    gsap.from(".feature-strip .gs-feat", {
        scrollTrigger: { trigger: ".feature-strip", start: "top 80%" },
        y: 30, opacity: 0,
        duration: 0.8, stagger: 0.08,
        ease: "power2.out"
    });

    // City nodes stagger
    gsap.from(".gs-node", {
        scrollTrigger: { trigger: ".city-network", start: "top 80%" },
        y: 30, opacity: 0,
        duration: 0.8, stagger: 0.15,
        ease: "power2.out"
    });

    // Connector line draw-in
    gsap.from(".city-connector", {
        scrollTrigger: { trigger: ".city-connector", start: "top 85%" },
        scaleY: 0, opacity: 0,
        duration: 0.6, ease: "power2.out"
    });
});
