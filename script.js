const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

const heroPreview = document.querySelector("[data-hero-parallax]");
if (heroPreview) {
  heroPreview.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const bounds = heroPreview.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    heroPreview.style.setProperty("--zoom-x", `${x * 100}%`);
    heroPreview.style.setProperty("--zoom-y", `${y * 100}%`);
    heroPreview.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
    heroPreview.style.setProperty("--tilt-y", `${(x - 0.5) * 4}deg`);
  });

  heroPreview.addEventListener("pointerleave", () => {
    heroPreview.style.setProperty("--zoom-x", "50%");
    heroPreview.style.setProperty("--zoom-y", "50%");
    heroPreview.style.setProperty("--tilt-x", "0deg");
    heroPreview.style.setProperty("--tilt-y", "0deg");
  });
}

document.querySelectorAll("img[src$='image.png']").forEach((image) => {
  image.addEventListener("error", () => image.remove());
  if (image.complete && image.naturalWidth === 0) {
    image.remove();
  }
});
