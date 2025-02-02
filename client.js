import { debounce } from './debounce.js';
import { renderSingleVidReq } from './renderSingleVidReq.js';
import { checkValidity } from './checkValidity.js';
import dataService from './dataService.js';

const SUPER_USER_ID = '2000804';

export const state = {
  sortBy: 'newFirst',
  searchTerm: '',
  filterBy: 'all',
  userId: '',
  isSuperUser: false,
};

document.addEventListener('DOMContentLoaded', () => {
  const fromVidReqElm = document.getElementById('formVideoRequest');
  const sortByElms = document.querySelectorAll('[id*=sort_by_]');
  const searchBoxElm = document.getElementById('search_box');
  const filterByElms = document.querySelectorAll('[id^=filter_by_]');
  const formLoginElm = document.querySelector('.form-login');
  const appContentElm = document.querySelector('.app-content');

  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get('id');
    if (state.userId === SUPER_USER_ID) {
      state.isSuperUser = true;
      document.querySelector('.normal-user-content').classList.add('d-none');
    }

    formLoginElm.classList.add('d-none');
    appContentElm.classList.remove('d-none');
  }

  dataService.loadAllVidReq();

  filterByElms.forEach((elm) => {
    elm.addEventListener('click', function (e) {
      e.preventDefault();
      filterByElms.forEach((option) => option.classList.remove('active'));
      this.classList.add('active');

      state.filterBy = e.target.getAttribute('id').split('_')[2];
      dataService.loadAllVidReq(state.sortBy, state.searchTerm, state.filterBy);
    });
  });

  sortByElms.forEach((elm) => {
    elm.addEventListener('click', function (e) {
      e.preventDefault();
      state.sortBy = this.querySelector('input').value;
      dataService.loadAllVidReq(state.sortBy, state.searchTerm, state.filterBy);

      this.classList.add('active');

      if (state.sortBy === 'topVotedFirst') {
        document.getElementById('sort_by_new').classList.remove('active');
      } else {
        document.getElementById('sort_by_top').classList.remove('active');
      }
    });
  });

  searchBoxElm.addEventListener(
    'input',
    debounce((e) => {
      state.searchTerm = e.target.value;
      dataService.loadAllVidReq(state.sortBy, state.searchTerm, state.filterBy);
    }, 300)
  );

  fromVidReqElm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(fromVidReqElm);

    formData.append('author_id', state.userId);
    const isValid = checkValidity(formData);
    if (!isValid) return;

    dataService
      .addVidReq(formData)
      .then((data) => renderSingleVidReq(data, state, true));
  });
});
