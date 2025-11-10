$(document).ready(function () {
    console.log("jQuery is ready!");

    if (!$('#notification-container').length) {
        $('body').append('<div id="notification-container" style="position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;"></div>');
    }

    function saveSearchState() {
        const term = $('#book-search').val() || '';
        const activeFilter = $('.filter-btn.active').text() || 'All Books';
        const activeCategory = $('.category-list a.active').text() || 'All Categories';
        const visibleTitles = $('.book-item:visible').map(function(){ return $(this).data('title'); }).get();
        const state = { term, activeFilter, activeCategory, visibleTitles };
        localStorage.setItem('searchState', JSON.stringify(state));
    }

    function restoreSearchState() {
        const raw = localStorage.getItem('searchState');
        if (!raw) return;
        try {
            const state = JSON.parse(raw);
            if (state.term) {
                $('#book-search').val(state.term);
                $('#book-search').trigger('keyup');
            }
            if (state.activeFilter) {
                $('.filter-btn').removeClass('active').filter(function(){ return $(this).text().trim() === state.activeFilter.trim(); }).addClass('active').trigger('click');
            }
            if (state.activeCategory) {
                $('.category-list a').removeClass('active').filter(function(){ return $(this).text().replace(/\s*\(.*\)$/,'').trim() === state.activeCategory.replace(/\s*\(.*\)$/,'').trim(); }).addClass('active').trigger('click');
            }
        } catch (_) {}
    }

    $('#book-search').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        let visibleCount = 0;

        $('.book-item').filter(function () {
            const title = $(this).data('title').toLowerCase();
            const author = $(this).data('author').toLowerCase();
            const genre = $(this).data('genre').toLowerCase();
            const matches = title.includes(searchTerm) || author.includes(searchTerm) || genre.includes(searchTerm);

            $(this).toggle(matches);
            if (matches) visibleCount++;
            return matches;
        });

        $('#results-count').text(`Showing ${visibleCount} book${visibleCount !== 1 ? 's' : ''}`);
        saveSearchState();
    });

	// Google Books search moved to scripts/google-api.js

    const bookData = [];
    $('.book-item').each(function () {
        const title = $(this).data('title');
        const author = $(this).data('author');
        const genre = $(this).data('genre');
        bookData.push(title, author, genre);
    });
    const uniqueSuggestions = [...new Set(bookData)];

    $('#book-search').on('input', function () {
        const input = $(this).val().toLowerCase();
        const $autocomplete = $('#autocomplete-list');

        $autocomplete.empty().hide();

        if (input.length < 2) return;

        const matches = uniqueSuggestions.filter(item =>
            item.toLowerCase().includes(input)
        ).slice(0, 5);

        if (matches.length > 0) {
            matches.forEach(match => {
                $('<div>')
                    .addClass('autocomplete-item')
                    .text(match)
                    .on('click', function () {
                        $('#book-search').val(match).trigger('keyup');
                        $autocomplete.empty().hide();
                    })
                    .appendTo($autocomplete);
            });
            $autocomplete.show();
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.search-box').length) {
            $('#autocomplete-list').hide();
        }
    });

    $('#faq-search').on('keyup', function () {
        const searchTerm = $(this).val().trim();

        $('.accordion-item').each(function () {
            const $item = $(this);
            const $header = $item.find('h3');
            const $content = $item.find('.accordion-content p');

            $header.html($header.text());
            $content.html($content.text());
        });

        if (searchTerm.length < 2) {
            $('#clear-highlight').hide();
            return;
        }

        $('#clear-highlight').show();

        const regex = new RegExp(`(${searchTerm})`, 'gi');

        $('.accordion-item').each(function () {
            const $item = $(this);
            const $header = $item.find('h3');
            const $content = $item.find('.accordion-content p');

            const headerText = $header.text();
            const highlightedHeader = headerText.replace(regex, '<mark class="highlight">$1</mark>');
            $header.html(highlightedHeader);

            const contentText = $content.text();
            const highlightedContent = contentText.replace(regex, '<mark class="highlight">$1</mark>');
            $content.html(highlightedContent);
        });
    });

    $('#clear-highlight').on('click', function () {
        $('#faq-search').val('').trigger('keyup');
    });

    $(window).on('scroll', function () {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();

        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

        $('#scroll-progress-bar').css('width', scrollPercentage + '%');
    });

    function animateCounter($element) {
        const target = parseInt($element.data('target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(function () {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            $element.text(Math.floor(current));
        }, 16);
    }

    let statsAnimated = false;
    $(window).on('scroll', function () {
        if ($('.stat-number').length && !statsAnimated) {
            const statsPosition = $('.library-stats').offset();
            if (statsPosition) {
                const statsTop = statsPosition.top;
                const windowBottom = $(window).scrollTop() + $(window).height();

                if (windowBottom > statsTop) {
                    $('.stat-number').each(function () {
                        animateCounter($(this));
                    });
                    statsAnimated = true;
                }
            }
        }
    });

    if ($('.stat-number').length) {
        const statsPosition = $('.library-stats').offset();
        if (statsPosition) {
            const statsTop = statsPosition.top;
            const windowBottom = $(window).scrollTop() + $(window).height();

            if (windowBottom > statsTop) {
                $('.stat-number').each(function () {
                    animateCounter($(this));
                });
                statsAnimated = true;
            }
        }
    }

    $('#contact-form').on('submit', function (e) {
        e.preventDefault();
        const form = this;

        $(form).find('input, textarea').trigger('blur');

        const hasErrors = $(form).find('.error').length > 0;
        if (hasErrors) {
            showNotification('Please correct the highlighted fields.', 'error');
            return;
        }

        const $submitBtn = $('#submit-btn');
        const $btnText = $submitBtn.find('.btn-text');
        const $btnSpinner = $submitBtn.find('.btn-spinner');

        $submitBtn.prop('disabled', true).addClass('loading');
        $btnText.hide();
        $btnSpinner.show();

        setTimeout(function () {
            $submitBtn.prop('disabled', false).removeClass('loading');
            $btnText.show();
            $btnSpinner.hide();

            $('#success-message').addClass('show');
            form.reset();

            setTimeout(function () {
                $('#success-message').removeClass('show');
            }, 5000);
        }, 1200);
    });

    function showNotification(message, type = 'success') {
        const $notification = $('<div>')
            .addClass('notification')
            .addClass('notification-' + type)
            .html(`
                <span class="notification-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
                <span class="notification-message">${message}</span>
            `)
            .hide();

        $('#notification-container').append($notification);

        $notification.fadeIn(300);

        setTimeout(function () {
            $notification.fadeOut(400, function () {
                $(this).remove();
            });
        }, 3000);
    }

    $('.add-to-cart-btn').on('click', function (e) {
        e.preventDefault();
        const bookTitle = $(this).closest('.book-item').data('title');
        showNotification(`"${bookTitle}" added to cart!`, 'success');
    });

    $('.category-list a').on('click', function (e) {
        e.preventDefault();
        const $link = $(this);
        $('.category-list a').removeClass('active');
        $link.addClass('active');

        const raw = $link.text().trim();
        const category = raw.replace(/\s*\(.*\)$/, ''); // strip counts

        const $items = $('.book-item');
        if (category.toLowerCase() === 'all categories') {
            $items.show();
        } else {
            $items.each(function () {
                const genre = ($(this).data('genre') || '').toString().toLowerCase();
                $(this).toggle(genre.includes(category.toLowerCase()));
            });
        }

        const visible = $('.book-item:visible').length;
        $('#results-count').text(`Showing ${visible} book${visible !== 1 ? 's' : ''}`);
        saveSearchState();
    });

    $('.filter-btn').on('click', function () {
        const $btn = $(this);
        $('.filter-btn').removeClass('active');
        $btn.addClass('active');

        const label = $btn.text().trim();
        const $items = $('.book-item');

        if (label === 'All Books') {
            $items.show();
        } else if (label === 'E-books') {
            $items.each(function () {
                const hasEbook = $(this).find('.ebook-price').length > 0;
                $(this).toggle(hasEbook);
            });
        } else if (label === 'Physical Books') {
            $items.each(function () {
                const hasEbook = $(this).find('.ebook-price').length > 0;
                $(this).toggle(!hasEbook);
            });
        } else if (label === 'Bestsellers') {
            $items.each(function () {
                const ratingText = $(this).find('.rating span').last().text();
                const rating = parseFloat(ratingText) || 0;
                $(this).toggle(rating >= 4.8);
            });
        }

        const visible = $('.book-item:visible').length;
        $('#results-count').text(`Showing ${visible} book${visible !== 1 ? 's' : ''}`);
        saveSearchState();
    });

    $('.library-tabs .tab-btn').on('click', function () {
        const $btn = $(this);
        $('.library-tabs .tab-btn').removeClass('active');
        $btn.addClass('active');

        const view = $btn.text().trim();
        const $cards = $('.my-book-card');

        if (view === 'All Books') {
            $cards.show();
            return;
        }

        $cards.each(function () {
            const $card = $(this);
            const progressText = $card.find('.progress-label').text();
            const isEbook = $card.find('.book-format').hasClass('ebook');
            const progressMatch = progressText.match(/(\d+)%/);
            const progress = progressMatch ? parseInt(progressMatch[1], 10) : 0;

            let show = false;
            if (view === 'Currently Reading') show = progress > 0 && progress < 100;
            if (view === 'Completed') show = progress === 100;
            if (view === 'Wishlist') show = false; // no wishlist items yet
            $card.toggle(show);
        });
    });

    $('.my-books-grid').on('click', '.read-btn', function () {
        const $card = $(this).closest('.my-book-card');
        const title = $card.find('.book-title').text();
        if ($(this).text().toLowerCase().includes('leave review')) {
            window.location.href = 'review.html';
        } else if ($(this).text().toLowerCase().includes('start') || $(this).text().toLowerCase().includes('continue')) {
            showNotification(`Opening "${title}"...`, 'success');
        }
    });

    $('.my-books-grid').on('click', '.download-btn', function () {
        const $card = $(this).closest('.my-book-card');
        const title = $card.find('.book-title').text();
        const author = $card.find('.book-author').text();
        const blob = new Blob([`${title}\n${author}\nDownloaded from PageTurner`], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9-_]+/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(`Downloading "${title}"`, 'success');
    });

    $('.my-books-grid').on('click', '.remove-btn', function () {
        const $card = $(this).closest('.my-book-card');
        const title = $card.find('.book-title').text();
        if (confirm(`Remove "${title}" from your library?`)) {
            $card.slideUp(200, function () { $(this).remove(); });
            showNotification(`Removed "${title}" from your library.`, 'success');
        }
    });

    (function () {
        const $categoriesHeader = $('.page-layout .sidebar h3').filter(function(){ return $(this).text().trim().toLowerCase() === 'categories'; }).first();
        if ($categoriesHeader.length) {
            const $catList = $categoriesHeader.next('ul');
            const $gallery = $('#gallery');
            if ($catList.length && $gallery.length) {
                $catList.find('a').on('click', function (e) {
                    e.preventDefault();
                    const $section = $('.gallery-section');
                    $('html, body').animate({ scrollTop: $gallery.offset().top - 80 }, 300);
                    $section.stop(true).css('box-shadow', '0 0 0 3px rgba(108,117,125,0.3)');
                    setTimeout(function(){ $section.css('box-shadow', 'none'); }, 800);
                });
            }
        }
    })();

    // Reviews persistence (Reviews page)
    const REVIEW_KEY = 'reviews:murder-orient-express';
    function loadSavedReviews() {
        const raw = localStorage.getItem(REVIEW_KEY);
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch (_) { return []; }
    }
    function saveReviews(list) {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(list));
    }
    function appendReviewToDOM(review) {
        const $new = $(
            '<div class="review-item" data-review-id="' + review.id + '">\
                <div class="review-header">\
                    <div class="reviewer-info">\
                        <div class="reviewer-avatar">' + review.name.slice(0,2).toUpperCase() + '</div>\
                        <div>\
                            <div class="reviewer-name">' + review.name + '</div>\
                            <div class="review-date">' + review.date + '</div>\
                        </div>\
                    </div>\
                    <div class="review-rating">' + '⭐'.repeat(review.rating) + '</div>\
                </div>\
                <div class="review-text">' + review.text + '</div>\
                <div class="review-helpful">\
                    <span>Was this helpful?</span>\
                    <button class="helpful-btn helpful-yes">👍 Yes (' + review.yes + ')</button>\
                    <button class="helpful-btn helpful-no">👎 No (' + review.no + ')</button>\
                </div>\
            </div>'
        );
        $('.reviews-section').append($new);
    }

    if ($('.reviews-section').length) {
        // Load saved reviews on page open
        const saved = loadSavedReviews();
        saved.forEach(appendReviewToDOM);

        // Delegate helpful buttons for saved reviews
        $('.reviews-section').on('click', '.review-item .helpful-btn', function () {
            const $btn = $(this);
            const $item = $btn.closest('.review-item');
            const id = $item.data('review-id');
            if (!id) return; // static seed reviews: no persistence
            let reviews = loadSavedReviews();
            const idx = reviews.findIndex(r => r.id === id);
            if (idx === -1) return;
            if ($btn.hasClass('helpful-yes')) {
                reviews[idx].yes += 1;
            } else {
                reviews[idx].no += 1;
            }
            saveReviews(reviews);
            $item.find('.helpful-yes').text(`👍 Yes (${reviews[idx].yes})`);
            $item.find('.helpful-no').text(`👎 No (${reviews[idx].no})`);
        });
    }

    $('.write-review-btn').on('click', function () {
        const $overlay = $('<div class="popup-overlay show"></div>').css({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' });
        const $modal = $('<div class="popup-container"></div>').css({ background: '#fff', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '520px', position: 'relative' });
        const $close = $('<button aria-label="Close" />').text('×').css({ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6c757d' });
        const $form = $('<form></form>').append(
            '<h3 style="margin-bottom:10px;color:#343a40;">Write a Review</h3>' +
            '<label style="display:block;margin:8px 0 4px;color:#495057;">Your Name *</label>' +
            '<input required type="text" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:8px;">' +
            '<label style="display:block;margin:12px 0 4px;color:#495057;">Rating (1-5) *</label>' +
            '<input required type="number" min="1" max="5" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:8px;">' +
            '<label style="display:block;margin:12px 0 4px;color:#495057;">Review *</label>' +
            '<textarea required rows="4" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:8px;"></textarea>' +
            '<button type="submit" style="margin-top:12px;padding:10px 16px;border:none;border-radius:20px;background:#6c757d;color:#fff;cursor:pointer;">Submit</button>'
        );
        $modal.append($close, $form);
        $overlay.append($modal);
        $('body').append($overlay);

        $close.on('click', function () { $overlay.remove(); });
        $overlay.on('click', function (e) { if (e.target === $overlay[0]) $overlay.remove(); });
        $(document).on('keydown.reviewModal', function (e) { if (e.key === 'Escape') { $overlay.remove(); $(document).off('keydown.reviewModal'); } });

        $form.on('submit', function (e) {
            e.preventDefault();
            const name = $(this).find('input[type="text"]').val().trim();
            const rating = parseInt($(this).find('input[type="number"]').val(), 10);
            const text = $(this).find('textarea').val().trim();
            if (!name || !text || !(rating >= 1 && rating <= 5)) {
                showNotification('Please complete all fields correctly.', 'error');
                return;
            }

            // Persist review
            const review = {
                id: 'r-' + Date.now(),
                name,
                rating,
                text,
                yes: 0,
                no: 0,
                date: new Date().toLocaleDateString()
            };
            const list = loadSavedReviews();
            list.push(review);
            saveReviews(list);
            appendReviewToDOM(review);
            $overlay.remove();
            showNotification('Review submitted. Thank you!', 'success');
        });
    });

    $('.copy-btn').on('click', function () {
        const $btn = $(this);
        const textToCopy = $btn.data('copy');
        const $icon = $btn.find('.copy-icon');

        const $temp = $('<textarea>')
            .val(textToCopy)
            .css({ position: 'absolute', left: '-9999px' })
            .appendTo('body');

        $temp.select();

        try {
            document.execCommand('copy');

            $icon.text('✓');
            $btn.addClass('copied');
            $btn.append('<span class="copy-tooltip">Copied to clipboard!</span>');

            setTimeout(function () {
                $icon.text('📋');
                $btn.removeClass('copied');
                $btn.find('.copy-tooltip').remove();
            }, 2000);

            showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy text', 'error');
        }

        $temp.remove();
    });

    function lazyLoadImages() {
        $('.lazy-load').each(function () {
            const $img = $(this);
            const imgTop = $img.offset().top;
            const imgBottom = imgTop + $img.height();
            const windowTop = $(window).scrollTop();
            const windowBottom = windowTop + $(window).height();

            if (imgBottom > windowTop - 200 && imgTop < windowBottom + 200) {
                if (!$img.attr('src')) {
                    const dataSrc = $img.data('src');
                    if (dataSrc) {
                        $img.attr('src', dataSrc);
                        $img.addClass('loaded');
                    }
                }
            }
        });
    }

    lazyLoadImages();

    $(window).on('scroll', function () {
        lazyLoadImages();
    });

    // Restore search state after bindings are set
    restoreSearchState();
});