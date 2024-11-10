export default function hideVideoModal(modal) {
    const video = modal.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    modal.style.display = 'none';
  }