import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/fetchImages';

const searchForm = document.querySelector('#search-form');
const inputEl = document.querySelector('input[name="searchQuery"]');
const divGallery = document.querySelector('.gallery');
// const loadMoreBtn = document.querySelector('.load-more');

let perPage = 40;
let page = 0;
let name = inputEl.value;
let totalPages;
let endOfListIsReached = false;

let gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    animationSpeed: 500,
});
// btnIsHiddenTogle();

async function onSearch(e) {
    e.preventDefault();
    clear();
    name = inputEl.value.trim();
    page = 1;
    endOfListIsReached = false;
    if (name === '') {
        Notiflix.Notify.failure(`Enter a name to search!`);
        return;
    }
    fetchImages(name, page, perPage)
        .then(name => {
            console.log(name.hits);
            console.log(name.totalHits);
            totalPages = Math.round(name.totalHits / perPage);
            console.log(totalPages);
            if (name.hits.length > 0) {
                Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
                renderImage(name);
                gallery.refresh();
                if (page < totalPages) {
                    btnIsHiddenTogle();
                } else {
                    Notiflix.Notify.info(
                        "We're sorry, but you've reached the end of search results."
                    );
                }
            } else {
                Notiflix.Notify.failure(
                    'Sorry, there are no images matching your search query. Please try again.'
                );
                clear();
            }
        })
        .catch(error => console.log(error.message));
}

function renderImage(name) {
    const markup = name.hits
        .map(hit => {
            return `<div class="photo-card">
              <a class="gallery-item" href="${hit.largeImageURL}">
              <img
                 class="gallery-image"
                src="${hit.webformatURL}"
                  alt="${hit.tags}"
                   loading="lazy"
              /></a>

               <div class="info">
                 <div class="info-box">
                   <p class="info-item">
                   <b>Likes</b>
                  </p>
                  <p class="info-value">${hit.likes.toString()}</p>
                </div>

                 <div class="info-box">
                   <p class="info-item">
                     <b>Views</b>
                   </p>
                   <p class="info-value">${hit.views.toString()}</p>
                 </div>

                 <div class="info-box">
                   <p class="info-item">
                     <b>Comments</b>
                   </p>
                   <p class="info-value">${hit.comments.toString()}</p>
                 </div>

                 <div class="info-box">
                   <p class="info-item">
                     <b>Downloads</b>
                   </p>
                   <p class="info-value">${hit.downloads.toString()}</p>
                 </div>

               </div>
             </div>`;
        })
        .join('');
    divGallery.insertAdjacentHTML('beforeend', markup);
}

searchForm.addEventListener('submit', onSearch);

function clear() {
    divGallery.innerHTML = '';
}

function btnIsHiddenTogle() {
    // loadMoreBtn.classList.toggle('is-hidden');
}
window.addEventListener(
    'scroll',
    () => {
        if (
            window.innerHeight + window.pageYOffset >= document.body.offsetHeight &&
            page < totalPages
        ) {
            name = inputEl.value;
            page += 1;

            fetchImages(name, page, perPage).then(name => {
                renderImage(name);
                smothScroll();
                gallery.refresh();
            });
        } else if (
            window.innerHeight + window.pageYOffset >= document.body.offsetHeight &&
            page >= totalPages &&
            !endOfListIsReached
        ) {
            endOfListIsReached = true;
            setTimeout(() => {
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            }, 2000);
        }
    },
    true
);

function smothScroll() {
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}

// кнопка для прокрутки вверх
const btnUp = {
    el: document.querySelector('.btn-up'),
    show() {
        // удалим у кнопки класс btn-up_hide
        this.el.classList.remove('btn-up_hide');
    },
    hide() {
        // добавим к кнопке класс btn-up_hide
        this.el.classList.add('btn-up_hide');
    },
    addEventListener() {
        // при прокрутке содержимого страницы
        window.addEventListener('scroll', () => {
            // определяем величину прокрутки
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            // если страница прокручена больше чем на 400px, то делаем кнопку видимой, иначе скрываем
            scrollY > 400 ? this.show() : this.hide();
        });
        // при нажатии на кнопку .btn-up
        document.querySelector('.btn-up').onclick = () => {
            // переместим в начало страницы
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        };
    },
};

btnUp.addEventListener();
