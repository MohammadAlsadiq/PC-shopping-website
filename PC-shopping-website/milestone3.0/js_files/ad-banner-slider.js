const adBannerLink = document.getElementById("adBannerLink");
const adBannerImage = document.getElementById("adBannerImage");

const adSlides = [
    {
        image: "products_images/ad_banner/intel.png",
        keyword: "intel",
        alt: "Intel products advertisement"
    },
    {
        image: "products_images/ad_banner/ryzen.png",
        keyword: "amd",
        alt: "AMD Ryzen products advertisement"
    },
    {
        image: "products_images/ad_banner/nvidia.png",
        keyword: "nvidia",
        alt: "NVIDIA products advertisement"
    }
];

let currentSlideIndex = 0;

function showAdSlide(index) {
    const slide = adSlides[index];

    adBannerImage.classList.remove("slide-right");

    void adBannerImage.offsetWidth;

    adBannerImage.src = slide.image;
    adBannerImage.alt = slide.alt;
    adBannerLink.href = `search.html?q=${encodeURIComponent(slide.keyword)}`;

    adBannerImage.classList.add("slide-right");
}

function goToNextAdSlide() {
    currentSlideIndex++;

    if (currentSlideIndex >= adSlides.length) {
        currentSlideIndex = 0;
    }

    showAdSlide(currentSlideIndex);
}

if (adBannerLink && adBannerImage) {
    showAdSlide(currentSlideIndex);
    setInterval(goToNextAdSlide, 5000);
}