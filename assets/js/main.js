// Sticky nav background on scroll
const nav = document.getElementById("siteNav");
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    mobileMenu.style.maxHeight = isOpen ? mobileMenu.scrollHeight + "px" : "0px";
    mobileMenu.style.opacity = isOpen ? "1" : "0";
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenu.style.maxHeight = "0px";
      mobileMenu.style.opacity = "0";
      menuBtn.setAttribute("aria-expanded", "false");
    })
  );
}

// Scroll reveal — reveals elements as they approach the viewport. Checked on
// scroll/resize (not just IntersectionObserver) so a fast/instant scroll that
// jumps straight past a section can't leave it permanently invisible.
const revealEls = Array.from(document.querySelectorAll(".reveal"));
function revealOnApproach() {
  let remaining = false;
  revealEls.forEach((el, i) => {
    if (el.classList.contains("is-visible")) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
      el.classList.add("is-visible");
    } else {
      remaining = true;
    }
  });
  if (!remaining) window.removeEventListener("scroll", revealOnApproach);
}
if (revealEls.length) {
  revealOnApproach();
  window.addEventListener("scroll", revealOnApproach, { passive: true });
  window.addEventListener("resize", revealOnApproach);
}

// Contact form -> mailto (no backend on this static site)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value;
    const topic = document.getElementById("cf-topic").value;
    const message = document.getElementById("cf-message").value;
    const subject = encodeURIComponent("The Padel Project — " + topic);
    const body = encodeURIComponent("Name: " + name + "\n\n" + message);
    window.location.href = "mailto:thepadelbeast@gmail.com?subject=" + subject + "&body=" + body;
  });
}

// Current year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
