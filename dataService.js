import { renderSingleVidReq } from './renderSingleVidReq.js';
import { state } from './client.js';
import api from './api.js';
import { applyVoteStyle } from './applyVoteStyle.js';

export default {
  addVidReq: (formData) => {
    return api.videoReq.post(formData);
  },
  updateVideoStatus: (id, status, resVideo = '') => {
    return api.videoReq
      .update(id, status, (resVideo = ''))
      .then((_) => window.location.reload());
  },

  deleteVideo: (id) => {
    return api.videoReq.delete(id);
  },

  loadAllVidReq: (
    sortBy = 'newFirst',
    searchTerm = '',
    filterBy = 'all',
    localState = state
  ) => {
    const listOfVidsElm = document.getElementById('listOfRequests');
    api.videoReq.get(sortBy, searchTerm, filterBy).then((data) => {
      listOfVidsElm.innerHTML = '';
      data.forEach((vidInfo) => {
        renderSingleVidReq(vidInfo, localState);
      });
    });
  },

  updateVotes: (id, vote_type, user_id, isDone, state) => {
    const scoreVoteElm = document.getElementById(`score_vote_${id}`);
    return api.votes.update(id, vote_type, user_id).then((data) => {
      scoreVoteElm.innerText = data.ups.length - data.downs.length;
      applyVoteStyle(id, data, isDone, state, vote_type);
    });
  },
};
