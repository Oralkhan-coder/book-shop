$(document).ready(function () {
	// Expose a small API to coordinate with other scripts
	window.GoogleBooks = (function () {
		const $booksContainer = $('.books-container');
		let searchDebounceTimer = null;
		let latestQuery = '';

		function buildRating(avg) {
			const rating = typeof avg === 'number' ? Math.max(0, Math.min(5, avg)) : null;
			const score = rating ? rating.toFixed(1) : '4.6';
			const starsCount = rating ? Math.round(rating) : 5;
			const stars = '⭐'.repeat(starsCount);
			return { stars, score };
		}

		function buildBookCardFromGoogle(item) {
			const info = item.volumeInfo || {};
			const title = info.title || 'Untitled';
			const authorsArr = info.authors || [];
			const authors = authorsArr.join(', ');
			const categories = info.categories || [];
			const genre = categories[0] || 'General';
			const thumb = info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail) || '';
			const fullDesc = (info.description || '').toString().trim();
			const description = fullDesc.slice(0, 140) + (fullDesc.length > 140 ? '…' : '');
			const { stars, score } = buildRating(info.averageRating);

			const $card = $('<div class="book-item" />')
				.attr({
					'data-title': title,
					'data-author': authors,
					'data-genre': genre
				});

			const $img = $('<img class="book-cover" />')
				.attr('alt', title)
				.css({ background: '#f8f9fa' });
			if (thumb) {
				$img.attr('src', thumb).addClass('loaded');
			}

			const $info = $('<div class="book-info" />');
			$info.append($('<h3 />').text(title));
			if (authors) $info.append($('<p class="book-author" />').text(`by ${authors}`));
			if (description) $info.append($('<p class="book-description" />').text(description));

			const $pricing = $('<div class="book-pricing" />');
			const $prices = $('<div class="price-options" />');
			$prices.append($('<span class="price-tag ebook-price" />').text('E-book: $0.00'));

			const $rating = $('<div class="rating" />');
			$rating.append($('<span />').text(stars));
			$rating.append($('<span />').text(score));

			$pricing.append($prices, $rating);
			$info.append($pricing);
			$info.append($('<button class="add-to-cart-btn" />').text('Add to Cart'));

			$card.append($img, $info);
			return $card;
		}

		function renderIntoBooksContainer(items, labelForCount) {
			if (!$booksContainer.length) return;
			$booksContainer.empty();

			(items || []).forEach(function (item) {
				$booksContainer.append(buildBookCardFromGoogle(item));
			});

			const count = (items || []).length;
			$('#results-count').text(`${labelForCount ? labelForCount + ': ' : ''}Showing ${count} book${count !== 1 ? 's' : ''}`);
		}

		function search(query) {
			if (!query || query.length < 2) {
				return;
			}
			latestQuery = query;
			$.getJSON('https://www.googleapis.com/books/v1/volumes', {
				q: query,
				maxResults: 10
			})
				.done(function (data) {
					if (query !== latestQuery) return;
					renderIntoBooksContainer((data && data.items) || [], `Results for "${query}"`);
				})
				.fail(function () {
					if (query !== latestQuery) return;
					renderIntoBooksContainer([], `Results for "${query}"`);
					if (typeof showNotification === 'function') {
						showNotification('Failed to fetch from Google Books.', 'error');
					}
				});
		}

		function loadBestSellers() {
			if (!$booksContainer.length) return;
			$.getJSON('https://www.googleapis.com/books/v1/volumes', {
				q: 'subject:fiction',
				orderBy: 'relevance',
				maxResults: 6
			})
				.done(function (data) {
					renderIntoBooksContainer((data && data.items) || [], 'Best Sellers');
				})
				.fail(function () {
					if (typeof showNotification === 'function') {
						showNotification('Failed to load best sellers from Google Books.', 'error');
					}
				});
		}

		function loadByCategory(category) {
			if (!category || !$booksContainer.length) return;
			$.getJSON('https://www.googleapis.com/books/v1/volumes', {
				q: `subject:${category}`,
				orderBy: 'relevance',
				maxResults: 12
			})
				.done(function (data) {
					renderIntoBooksContainer((data && data.items) || [], category);
				})
				.fail(function () {
					if (typeof showNotification === 'function') {
						showNotification(`Failed to load ${category} from Google Books.`, 'error');
					}
				});
		}

		// Wire up search input with debounce
		$('#book-search').on('input', function () {
			const q = ($(this).val() || '').toString().trim();
			clearTimeout(searchDebounceTimer);
			searchDebounceTimer = setTimeout(function () {
				search(q);
			}, 300);
		});

		// Initial best sellers on catalog
		if ($('.books-container').length) {
			loadBestSellers();
		}

		return {
			search: search,
			loadBestSellers: loadBestSellers,
			loadByCategory: loadByCategory
		};
	})();
});


