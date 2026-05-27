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

/* ~~~~ DYNAMIC PRODUCTS & MODAL SYSTEM ~~~~ */

let productsData = {}; // Stores raw category map
let flatProducts = []; // Stores flat list of all products

// DOM Elements
const productsGrid = document.getElementById('dynamicProductsGrid');
const filterBar = document.getElementById('productFilters');
const productModal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');

// 1. Fetch products database on load
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        productsData = await response.json();
        
        // Flatten for easy "All" rendering
        flatProducts = [];
        Object.keys(productsData).forEach(cat => {
            productsData[cat].forEach(prod => {
                flatProducts.push(prod);
            });
        });

        // Initial render
        renderProducts('All');
        setupCategoryCardListeners();
    } catch (error) {
        console.error('Error fetching product data:', error);
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--colorGray500); font-weight: 600;">Unable to load products. Please try again later.</p>`;
    }
}

// 2. Render cards dynamically
function renderProducts(category) {
    productsGrid.innerHTML = '';
    
    let filteredList = [];
    if (category === 'All') {
        filteredList = flatProducts;
    } else {
        filteredList = productsData[category] || [];
    }

    if (filteredList.length === 0) {
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--colorGray500);">No products found in this category.</p>`;
        return;
    }

    filteredList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'productCard';
        
        // Determine badge
        let badgeHtml = '';
        if (product.badge) {
            badgeHtml = `<span class="productBadge">${product.badge}</span>`;
        } else if (product.rating >= 4.8) {
            badgeHtml = `<span class="productBadge badgeBestSelling">Best Seller</span>`;
        }

        // Safely fallback to logo if no images
        const mainImage = (product.images && product.images.length > 0) ? product.images[0] : 'assets/logoWhite.png';

        card.innerHTML = `
            <div class="productCardImgWrap">
                <img src="${mainImage}" alt="${product.product_name}" loading="lazy" />
                ${badgeHtml}
            </div>
            <p class="productCardName">${product.product_name}</p>
            <p class="productCardColorsLabel">${product.brand}</p>
            <p class="productCardPrice">₱ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p class="productCardCategory">${product.category}</p>
        `;

        card.addEventListener('click', () => {
            openProductModal(product);
        });

        productsGrid.appendChild(card);
    });
}

// 3. Category Filter Buttons Logic
if (filterBar) {
    filterBar.querySelectorAll('.filterBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBar.querySelectorAll('.filterBtn').forEach(b => b.classList.remove('isActive'));
            btn.classList.add('isActive');
            renderProducts(btn.dataset.category);
        });
    });
}

// 4. Connect top category cards to filters
function setupCategoryCardListeners() {
    const categoryCards = document.querySelectorAll('.categoryCard');
    categoryCards.forEach(card => {
        const titleEl = card.querySelector('.categoryCardTitle');
        const viewDealsBtn = card.querySelector('.categoryCardBtn');
        if (!titleEl || !viewDealsBtn) return;

        const title = titleEl.textContent.trim().toLowerCase();
        let targetCategory = '';

        if (title.includes('glasses')) targetCategory = 'Glasses Product';
        else if (title.includes('helmet')) targetCategory = 'Cycling Helmets';
        else if (title.includes('glove')) targetCategory = 'Cycling Gloves';

        if (viewDealsBtn && targetCategory) {
            viewDealsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Trigger filter button click
                const targetFilterBtn = filterBar.querySelector(`[data-category="${targetCategory}"]`);
                if (targetFilterBtn) {
                    targetFilterBtn.click();
                }
                
                // Smooth scroll to dynamic grid
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
}

// 5. Dynamic Product Details Modal Logic
function openProductModal(product) {
    const images = product.images || [];
    const mainImage = images.length > 0 ? images[0] : 'assets/logoWhite.png';

    // Generate thumbnails markup
    let thumbsMarkup = '';
    if (images.length > 1) {
        thumbsMarkup = `<div class="modalThumbnails">`;
        images.forEach((img, i) => {
            thumbsMarkup += `
                <div class="modalThumb ${i === 0 ? 'isActive' : ''}" data-img="${img}">
                    <img src="${img}" alt="${product.product_name} view ${i + 1}" />
                </div>
            `;
        });
        thumbsMarkup += `</div>`;
    }

    // Generate sizes markup
    let sizesMarkup = '';
    if (product.sizes && product.sizes.length > 0) {
        sizesMarkup = `
            <div style="margin-top: 10px;">
                <p class="modalSectionTitle">Available Sizes</p>
                <div class="modalSizes">
                    ${product.sizes.map(size => `<span class="modalSizeTag">${size}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Generate materials markup
    let materialsMarkup = '';
    if (product.materials && Object.keys(product.materials).length > 0) {
        materialsMarkup = `
            <div style="margin-top: 10px;">
                <p class="modalSectionTitle">Specifications</p>
                <ul class="modalMaterials">
                    ${Object.entries(product.materials).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Badge or Rating stars
    let ratingStars = '';
    for (let i = 0; i < 5; i++) {
        ratingStars += i < Math.floor(product.rating) ? '✦' : '✧';
    }

    modalContent.innerHTML = `
        <button class="modalCloseBtn" id="modalCloseBtn" aria-label="Close modal">&times;</button>
        
        <div class="modalImagesArea">
            <div class="modalMainImageWrap">
                <img src="${mainImage}" id="modalMainImg" alt="${product.product_name}" />
            </div>
            ${thumbsMarkup}
        </div>

        <div class="modalDetailsArea">
            ${product.badge ? `<span class="modalBadge">${product.badge}</span>` : ''}
            <h2 class="modalTitle">${product.product_name}</h2>
            
            <div class="modalBrandRow">
                <span class="modalBrand">${product.brand}</span>
                <span class="modalRating">${ratingStars} (${product.rating})</span>
            </div>

            <p class="modalPrice">₱ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            
            <p class="modalDescription">${product.description}</p>
            
            ${sizesMarkup}
            ${materialsMarkup}

            <button class="modalBuyBtn">Add To Cart ✦</button>
        </div>
    `;

    // Active classes and events inside modal
    productModal.classList.add('isOpen');
    document.body.style.overflow = 'hidden'; // Stop background scrolling

    // Handle interactive thumbnail switcher
    const thumbs = modalContent.querySelectorAll('.modalThumb');
    const mainImgEl = document.getElementById('modalMainImg');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('isActive'));
            thumb.classList.add('isActive');
            mainImgEl.src = thumb.dataset.img;
        });
    });

    // Close listeners
    const closeBtn = document.getElementById('modalCloseBtn');
    closeBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', handleBackdropClick);
}

function closeProductModal() {
    productModal.classList.remove('isOpen');
    document.body.style.overflow = ''; // Restore background scrolling
    productModal.removeEventListener('click', handleBackdropClick);
}

function handleBackdropClick(e) {
    if (e.target === productModal) {
        closeProductModal();
    }
}

// Close modal on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.classList.contains('isOpen')) {
        closeProductModal();
    }
});

// Run loadProducts
loadProducts();