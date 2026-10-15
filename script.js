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

document.querySelectorAll("img[src$='image.png']").forEach((image) => {
  image.addEventListener("error", () => image.remove());
  if (image.complete && image.naturalWidth === 0) {
    image.remove();
  }
});

const trustedCount = document.querySelector("#trusted-count");
const trustedCountStatus = document.querySelector("#trusted-count-status");
if (trustedCount && trustedCountStatus) {
  let displayedCount = null;
  let countAnimationFrame = 0;

  function showCount(targetCount) {
    if (countAnimationFrame) {
      window.cancelAnimationFrame(countAnimationFrame);
    }

    const startCount = displayedCount ?? 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || startCount === targetCount) {
      displayedCount = targetCount;
      trustedCount.textContent = `${targetCount.toLocaleString()}+`;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();
    trustedCount.setAttribute("aria-live", "off");

    function animateCount(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 4;
      const currentCount = Math.round(startCount + (targetCount - startCount) * easedProgress);
      trustedCount.textContent = `${currentCount.toLocaleString()}+`;

      if (progress < 1) {
        countAnimationFrame = window.requestAnimationFrame(animateCount);
        return;
      }

      displayedCount = targetCount;
      countAnimationFrame = 0;
      trustedCount.setAttribute("aria-live", "polite");
    }

    countAnimationFrame = window.requestAnimationFrame(animateCount);
  }

  async function updateTrustedCount() {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    const endpoints = [new URL("/api/stats", window.location.href)];
    const isLocalPreview =
      window.location.protocol === "file:" || localHosts.has(window.location.hostname);

    if (isLocalPreview && window.location.port !== "3000") {
      const host = localHosts.has(window.location.hostname) ? window.location.hostname : "127.0.0.1";
      const apiHost = host === "::1" ? "[::1]" : host;
      endpoints.push(new URL(`http://${apiHost}:3000/api/stats`));
    }

    let lastError;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Stats API responded with ${response.status}`);
        }
        const stats = await response.json();
        if (!Number.isSafeInteger(stats.totalMembers) || stats.totalMembers < 0) {
          throw new Error("Stats API returned an invalid member count");
        }
        showCount(stats.totalMembers);
        trustedCountStatus.textContent = "Live across all servers";
        return;
      } catch (error) {
        lastError = error;
      }
    }

    console.error("Could not load Unity's live member count:", lastError);
    trustedCount.textContent = "—";
    trustedCountStatus.textContent = "Start the bot to see the live count";
  }

  updateTrustedCount();
  window.setInterval(updateTrustedCount, 60_000);
}
