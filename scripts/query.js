$(document).ready(function () {
    console.log("jQuery is ready!");

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
    });

    // TASK 2
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

    // TASK 3
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

    // TASK 4
    $(window).on('scroll', function () {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();

        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

        $('#scroll-progress-bar').css('width', scrollPercentage + '%');
    });

    // TASK 5
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

    // TASK 6
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();

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
            $('#contact-form')[0].reset();

            setTimeout(function () {
                $('#success-message').removeClass('show');
            }, 5000);
        }, 3000);
    });

    // TASK 7
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

    // TASK 8
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

    // TASK 9
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
});