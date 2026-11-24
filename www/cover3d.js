/* ==========================================
   MACHINE SEARCH
   3D COVER SLIDESHOW ENGINE
========================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "ms_covers_v1";
    const SLIDE_INTERVAL = 5000;

    let currentIndex = 0;
    let slideTimer = null;
    let covers = [];
    let container = null;

    function getCovers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const data = saved ? JSON.parse(saved) : [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Cover loading error:", error);
            return [];
        }
    }

    function getImageSrc(item) {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
            return item.data || item.src || item.url || "";
        }
        return "";
    }

    function createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    }

    function stopSlideshow() {
        if (slideTimer) {
            clearInterval(slideTimer);
            slideTimer = null;
        }
    }

    function createDots() {
        const dotsContainer = createElement("div", "home-cover-dots");

        covers.forEach((_, index) => {
            const dot = createElement("span", "home-cover-dot");

            if (index === currentIndex) {
                dot.classList.add("active");
            }

            dotsContainer.appendChild(dot);
        });

        return dotsContainer;
    }

    function updateSlides() {
        if (!container) return;

        const images = container.querySelectorAll(".home-cover-img");
        const dots = container.querySelectorAll(".home-cover-dot");
        const total = images.length;

        images.forEach((image, index) => {
            image.classList.remove(
                "active",
                "prev",
                "next",
                "hidden-3d"
            );

            if (total <= 1) {
                image.classList.add("active");
                return;
            }

            if (index === currentIndex) {
                image.classList.add("active");
            } else if (
                index === (currentIndex - 1 + total) % total
            ) {
                image.classList.add("prev");
            } else if (
                index === (currentIndex + 1) % total
            ) {
                image.classList.add("next");
            } else {
                image.classList.add("hidden-3d");
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    function nextSlide() {
        if (covers.length <= 1) return;

        currentIndex = (currentIndex + 1) % covers.length;
        updateSlides();
    }

    function startSlideshow() {
        stopSlideshow();

        if (covers.length > 1) {
            slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
        }
    }

    function render() {
        container = document.querySelector(".home-cover-wrap");

        if (!container) {
            console.warn("3D Cover container not found.");
            return;
        }

        stopSlideshow();

        covers = getCovers().filter(item => getImageSrc(item));

        currentIndex = covers.length
            ? currentIndex % covers.length
            : 0;

        container.innerHTML = "";

        if (covers.length === 0) {
            container.classList.add("home-hero");
            container.style.height = "260px";

            const emptyContent = createElement(
                "div",
                "home-cover-content"
            );

            const title = createElement("h2");
            title.textContent = "Find your machine.";

            const subtitle = createElement("p");
            subtitle.textContent = "Search your arcade machine database";

            emptyContent.append(title, subtitle);
            container.appendChild(emptyContent);
            return;
        }

        container.classList.remove("home-hero");

        const stage = createElement("div", "home-cover-stage");

        covers.forEach((item, index) => {
            const image = createElement("img", "home-cover-img");

            image.src = getImageSrc(item);
            image.alt = "Machine Search cover " + (index + 1);
            image.loading = index === currentIndex ? "eager" : "lazy";
            image.draggable = false;

            image.addEventListener("error", () => {
                image.style.opacity = "0";
            });

            stage.appendChild(image);
        });

        const overlay = createElement(
            "div",
            "home-cover-overlay"
        );

        const content = createElement(
            "div",
            "home-cover-content"
        );

        const heading = createElement("h2");
        heading.textContent = "Find your machine.";

        const subtitle = createElement("p");
        subtitle.textContent = "Explore your arcade machine database";

        content.append(heading, subtitle);

        container.append(
            stage,
            overlay,
            content,
            createDots()
        );

        updateSlides();
        startSlideshow();
    }

    function refresh() {
        render();
    }

    function init() {
        render();
    }

    document.addEventListener("DOMContentLoaded", init);

    // Settings photo changes
    window.MachineSearch3DCover = {
        refresh,
        stop: stopSlideshow
    };

    // Cleanup
    window.addEventListener("pagehide", stopSlideshow);

})();
