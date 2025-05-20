import './css/styles.css';
import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
const perPage = 15;

function showLoadMoreButton() {
  loadMoreBtn.classList.remove('hidden');
}

function hideLoadMoreButton() {
  loadMoreBtn.classList.add('hidden');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  currentQuery = e.target.elements['search-text'].value.trim();

  if (!currentQuery) {
    iziToast.warning({ message: 'Please enter a search term' });
    return;
  }

  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    setTimeout(async () => {
      const data = await getImagesByQuery(currentQuery, currentPage);
      totalHits = data.totalHits;

      if (data.hits.length === 0) {
        iziToast.info({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
        hideLoader();
        return;
      }

      createGallery(data.hits);
      if (totalHits > perPage) {
        showLoadMoreButton();
      }
    }, 1000);
  } catch (error) {
    console.error('Error fetching images:', error);
    iziToast.error({ message: 'Something went wrong' });
  } finally {
    hideLoader();
    e.target.reset();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);

    if (currentPage * perPage >= totalHits) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
      hideLoadMoreButton();
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    console.error('Error loading more images:', error);
    iziToast.error({
      message: 'Something went wrong while loading more images.',
    });
  } finally {
    hideLoader();
  }
});
