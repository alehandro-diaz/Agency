(() => {
    const setupFlatCardNavigation = () => {
        const flatCards = document.querySelectorAll(".flats_box[id]");
        if (!flatCards.length) {
            return;
        }

        document.addEventListener(
            "click",
            (event) => {
                const card = event.target.closest(".flats_box[id]");
                if (!card) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const flatId = card.id;
                window.location.href = `appartament.html?id=${encodeURIComponent(flatId)}`;
            },
            true
        );
    };

    const setupApartmentDataLoading = async () => {
        const apartmentPage = document.querySelector(".about__container");
        if (!apartmentPage) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const selectedFlatId = urlParams.get("id");
        if (!selectedFlatId) {
            return;
        }

        try {
            const response = await fetch("data/data.xml");
            if (!response.ok) {
                throw new Error("Failed to load XML data");
            }

            const xmlText = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
            const flat = xmlDoc.querySelector(`flat[id="${selectedFlatId}"]`);
            if (!flat) {
                return;
            }

            const getText = (tagName) => flat.querySelector(tagName)?.textContent?.trim() || "";
            const title = getText("title");
            const location = getText("location");
            const price = getText("price");
            const bedrooms = getText("bedrooms");
            const bathrooms = getText("bathrooms");
            const square = getText("square");
            const type = getText("type");
            const description = getText("description");
            const year = getText("year");
            const lotSize = getText("size");
            const propertyId = getText("id_obj");
            const status = getText("status");

            const galleryEl = flat.getElementsByTagName("gallery")[0];
            const photos = galleryEl
                ? Array.from(galleryEl.getElementsByTagName("photo"))
                      .map((node) => node.textContent.replace(/\s+/g, " ").trim())
                      .filter(Boolean)
                : [];

            const backImg = document.querySelector(".appart .back_img");
            if (backImg) {
                backImg.classList.remove("back_img--gallery");
                backImg.innerHTML = "";
                backImg.style.backgroundImage = "";
                if (photos.length === 1) {
                    const path = photos[0].replace(/\\/g, "/");
                    backImg.style.backgroundImage = `url("${path}")`;
                    backImg.style.backgroundSize = "cover";
                    backImg.style.backgroundPosition = "center";
                } else if (photos.length > 1) {
                    backImg.classList.add("back_img--gallery");
                    photos.forEach((src) => {
                        const img = document.createElement("img");
                        img.src = src.replace(/\\/g, "/");
                        img.alt = "";
                        img.loading = "lazy";
                        backImg.appendChild(img);
                    });
                }
            }

            const titleEl = document.querySelector(".about__title");
            const locationEl = document.querySelector(".about__location");
            const priceEl = document.querySelector(".about__price");
            const statValues = document.querySelectorAll(".about__stat-value");
            const descriptionEl = document.querySelector(".about__text");
            const additionalValues = document.querySelectorAll(".about__grid p");
            const featuresLists = document.querySelectorAll(".about__features ul");

            if (titleEl) titleEl.textContent = title;
            if (locationEl) locationEl.textContent = location;
            if (priceEl) priceEl.textContent = `${price} у.е.`;
            if (descriptionEl) descriptionEl.textContent = description;

            if (statValues.length >= 4) {
                statValues[0].textContent = bedrooms;
                statValues[1].textContent = bathrooms;
                statValues[2].textContent = square;
                statValues[3].textContent = type;
            }

            if (additionalValues.length >= 4) {
                additionalValues[0].textContent = year;
                additionalValues[1].textContent = lotSize;
                additionalValues[2].textContent = propertyId;
                additionalValues[3].textContent = status;
            }

            if (featuresLists.length >= 2) {
                const features = Array.from(flat.querySelectorAll("feauters"))
                    .map((item) => item.textContent?.trim())
                    .filter(Boolean);

                const splitIndex = Math.ceil(features.length / 2);
                const firstHalf = features.slice(0, splitIndex);
                const secondHalf = features.slice(splitIndex);

                featuresLists[0].innerHTML = firstHalf.map((item) => `<li>${item}</li>`).join("");
                featuresLists[1].innerHTML = secondHalf.map((item) => `<li>${item}</li>`).join("");
            }
        } catch (error) {
            console.error("Apartment data loading error:", error);
        }
    };

    const setupBackToFlats = () => {
        const backButton = document.querySelector(".back div");
        if (!backButton) {
            return;
        }

        backButton.style.cursor = "pointer";
        backButton.addEventListener("click", () => {
            window.location.href = "flats.html";
        });
    };

    setupFlatCardNavigation();
    setupBackToFlats();
    setupApartmentDataLoading();
})();
