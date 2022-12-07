document.addEventListener('DOMContentLoaded', () => {
  const fromVidReq = document.getElementById('formVideoRequest');

  fromVidReq.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(fromVidReq);

    fetch('http://localhost:7777/video-request', {
      method: 'POST',
      body: formData,
    })
      .then((blob) => blob.json())
      .then((data) => console.log(data));
  });
});
