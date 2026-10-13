$(document).ready(() => {
  
  // --- Header Scroll Logic ---
  $(window).on('scroll', function() {
    if ($(window).scrollTop() > 50) {
      $('#header-inner').removeClass('md:h-24 h-20').addClass('md:h-16 h-14');
    } else {
      $('#header-inner').addClass('md:h-24 h-20').removeClass('md:h-16 h-14');
    }
  });

  // --- Hero Slider Logic ---
  const slides = $('.hero-slide');
  let currentSlide = 0;
  let sliderInterval;
  
  function updateSlider(index) {
    slides.removeClass('active').addClass('inactive');
    $(slides[index]).removeClass('inactive').addClass('active');
    
    $('#hero-current').text(`0${index + 1}`);
    const progress = ((index + 1) / slides.length) * 100;
    $('#hero-progress').css('width', `${progress}%`);
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider(currentSlide);
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider(currentSlide);
  }
  
  sliderInterval = setInterval(nextSlide, 5000);
  
  $('#hero-next').click(() => {
    clearInterval(sliderInterval);
    nextSlide();
    sliderInterval = setInterval(nextSlide, 5000);
  });
  
  $('#hero-prev').click(() => {
    clearInterval(sliderInterval);
    prevSlide();
    sliderInterval = setInterval(nextSlide, 5000);
  });
  
  $('#hero-pause').click(function() {
    $(this).toggleClass('paused');
    if ($(this).hasClass('paused')) {
      clearInterval(sliderInterval);
      $(this).html('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3l14 9-14 9V3z"/></svg>');
    } else {
      sliderInterval = setInterval(nextSlide, 5000);
      $(this).html('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4H6v16h4V4zM18 4h-4v16h4V4z"/></svg>');
    }
  });

  // --- Cart Drawer Modals ---
  $('#cart-trigger').click(() => {
    $('#cart-drawer').removeClass('translate-x-full');
    $('#global-overlay').removeClass('opacity-0 pointer-events-none');
    $('body').addClass('overflow-hidden');
  });
  
  $('.close-cart, #global-overlay').click(() => {
    $('#cart-drawer').addClass('translate-x-full');
    $('#global-overlay').addClass('opacity-0 pointer-events-none');
    $('#quick-view-modal').addClass('opacity-0 pointer-events-none');
    $('body').removeClass('overflow-hidden');
  });

  // --- Quick View Modal ---
  let qvImages = [];
  let currentQvIndex = 0;

  $(document).on('click', '.btn-quick-view', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const pid = $(this).closest('[data-id]').data('id');
    const p = {
      id: $(this).data('id'),
      name: $(this).data('name'),
      price: parseFloat($(this).data('price')),
      image: $(this).data('image'),
      hoverImage: $(this).data('hover-image')
    };
    
    $('#qv-title').text(p.name);
    $('#qv-price').text(formatPrice(p.price));
    $('#qv-details-btn').attr('href', '/product/' + p.id);
    
    qvImages = [p.image];
    if (p.hoverImage && p.hoverImage !== p.image) {
      qvImages.push(p.hoverImage);
    }
    currentQvIndex = 0;
    $('#qv-img').attr('src', qvImages[currentQvIndex]);

    if (qvImages.length > 1) {
      $('#qv-prev, #qv-next').removeClass('hidden');
    } else {
      $('#qv-prev, #qv-next').addClass('hidden');
    }
    
    // reset sizes and colors
    $('#qv-sizes button').removeClass('border-charcoal').addClass('border-gray-200 text-gray-500');
    $($('#qv-sizes button')[0]).removeClass('border-gray-200 text-gray-500').addClass('border-charcoal text-charcoal');
    
    $('#quick-view-modal').removeClass('opacity-0 pointer-events-none');
    $('#global-overlay').removeClass('opacity-0 pointer-events-none');
    $('body').addClass('overflow-hidden');
    
    $('#qv-add-to-bag').off('click').on('click', () => {
      addToCart(p);
      $('#quick-view-modal').addClass('opacity-0 pointer-events-none');
      $('#global-overlay').addClass('opacity-0 pointer-events-none');
      $('body').removeClass('overflow-hidden');
    });
  });
  
  $('#qv-prev').click(function() {
    if (qvImages.length <= 1) return;
    currentQvIndex = (currentQvIndex - 1 + qvImages.length) % qvImages.length;
    $('#qv-img').attr('src', qvImages[currentQvIndex]);
  });

  $('#qv-next').click(function() {
    if (qvImages.length <= 1) return;
    currentQvIndex = (currentQvIndex + 1) % qvImages.length;
    $('#qv-img').attr('src', qvImages[currentQvIndex]);
  });
  
  $('.close-quick-view').click(() => {
    $('#quick-view-modal').addClass('opacity-0 pointer-events-none');
    $('#global-overlay').addClass('opacity-0 pointer-events-none');
    $('body').removeClass('overflow-hidden');
  });

  // --- Style the Look Hotspots ---
  $('.quick-add-btn').click(function() {
    const pid = $(this).closest('.group-hotspot').data('product');
    // Assuming product p2 is the evening dress
    addToCart(products[1]); 
  });

});
