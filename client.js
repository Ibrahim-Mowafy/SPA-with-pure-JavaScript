const listOfVidReqElm = document.getElementById('listOfRequests');

const state = {
  sortBy: 'newFirst',
  searchTerm: '',
  userId: '',
};

function renderSingleVidReq(vidInfo, appended = false) {
  const vidReqContainerElm = document.createElement('div');
  vidReqContainerElm.innerHTML = `
    <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
      <div class="d-flex flex-column">
        <h3>${vidInfo.topic_title}</h3>
        <p class="text-muted mb-2">${vidInfo.topic_details}</p>
        <p class="mb-0 text-muted">
        ${
          vidInfo.expected_result &&
          `<strong>Expected results:</strong> ${vidInfo.expected_result}`
        }
        </p>
      </div>
      <div class="d-flex flex-column text-center">
        <a id='votes_ups_${vidInfo._id}' class="btn btn-link">🔺</a>
        <h3 id='score_vote_${vidInfo._id}'>${
    vidInfo.votes.ups - vidInfo.votes.downs
  }</h3>
        <a id='votes_downs_${vidInfo._id}' class="btn btn-link">🔻</a>
      </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
      <div>
        <span class="text-info">${vidInfo.status.toUpperCase()}</span>
        &bullet; added by <strong>${vidInfo.author_name}</strong> on
        <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
      </div>
      <div
        class="d-flex justify-content-center flex-column 408ml-auto mr-2"
      >
        <div class="badge badge-success">${vidInfo.target_level}</div>
      </div>
    </div>
    </div>
    `;

  if (appended) {
    listOfVidReqElm.prepend(vidReqContainerElm);
  } else {
    listOfVidReqElm.appendChild(vidReqContainerElm);
  }

  const voteUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`);
  const voteDownElm = document.getElementById(`votes_downs_${vidInfo._id}`);
  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);

  voteUpsElm.addEventListener('click', (e) => {
    fetch('http://localhost:7777/video-request/vote', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: vidInfo._id, vote_type: 'ups' }),
    })
      .then((blob) => blob.json())
      .then((data) => {
        scoreVoteElm.innerText = data.ups - data.downs;
      });
  });
  voteDownElm.addEventListener('click', (e) => {
    fetch('http://localhost:7777/video-request/vote', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: vidInfo._id, vote_type: 'downs' }),
    })
      .then((blob) => blob.json())
      .then((data) => {
        scoreVoteElm.innerText = data.ups - data.downs;
      });
  });
}

function loadAllVidReq(sortBy = 'newFirst', searchTerm = '') {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((blob) => blob.json())
    .then((data) => {
      listOfVidReqElm.innerHTML = '';
      data.forEach((vidInfo) => {
        renderSingleVidReq(vidInfo);
      });
    });
}

function checkValidity(formData) {
  const topic = formData.get('topic_title');
  const topicDetails = formData.get('topic_details');

  if (!topic || topic.length > 30) {
    document.querySelector('[name=topic_title]').classList.add('is-invalid');
  }
  if (!topicDetails) {
    document.querySelector('[name=topic_details]').classList.add('is-invalid');
  }

  const allInvalidElms = document
    .getElementById('formVideoRequest')
    .querySelectorAll('.is-invalid');

  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener('input', function () {
        this.classList.remove('is-invalid');
      });
    });
    return false;
  }
  return true;
}

function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const fromVidReqElm = document.getElementById('formVideoRequest');
  const sortByElms = document.querySelectorAll('[id*=sort_by_]');
  const searchBoxElm = document.getElementById('search_box');

  const formLoginElm = document.querySelector('.form-login');
  const appContentElm = document.querySelector('.app-content');

  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get('id');
    formLoginElm.classList.add('d-none');
    appContentElm.classList.remove('d-none');
  }

  loadAllVidReq();

  sortByElms.forEach((elm) => {
    elm.addEventListener('click', function (e) {
      e.preventDefault();
      state.sortBy = this.querySelector('input').value;
      loadAllVidReq(state.sortBy, state.searchTerm);

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
      loadAllVidReq(state.sortBy, state.searchTerm);
    }, 300)
  );

  fromVidReqElm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(fromVidReqElm);

    formData.append('author_id', state.userId);
    const isValid = checkValidity(formData);
    if (!isValid) return;

    fetch('http://localhost:7777/video-request', {
      method: 'POST',
      body: formData,
    })
      .then((blob) => blob.json())
      .then((data) => renderSingleVidReq(data, true));
  });
});
