/* ~~~~ Carousel ~~~~ */

const track = document.getElementById('heroCarouselTrack');
const dotsWrap = document.getElementById('heroCarouselControls');
const btnPrev = document.getElementById('heroArrowPrev');
const btnNext = document.getElementById('heroArrowNext');

const slides = track.querySelectorAll('.heroSlide');
const totalSlides = slides.length;
let currentSlide = 0;
let autoPlayTimer;

/* ~~~~ Build one dot per slide ~~~~ */
slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'heroDot' + (i === 0 ? ' isActive' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
});

/* ~~~~ Move to a specific slide index ~~~~ */
function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

    /* ~~~~ Update active dot ~~~~ */
    dotsWrap.querySelectorAll('.heroDot').forEach((d, i) => {
        d.classList.toggle('isActive', i === currentSlide);
    });
}

/* ~~~~ Arrow buttons ~~~~ */
btnPrev.addEventListener('click', () => {
    resetAutoPlay();
    goToSlide(currentSlide - 1);
});

btnNext.addEventListener('click', () => {
    resetAutoPlay();
    goToSlide(currentSlide + 1);
});

/* ~~~~ Auto-advance every 5 seconds ~~~~ */
function startAutoPlay() {
    autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 15000);
}

function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
}

startAutoPlay();

/* ~~~~ Mobile Nav Hamburger ~~~~ */

const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('navMobileMenu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('isOpen');
});