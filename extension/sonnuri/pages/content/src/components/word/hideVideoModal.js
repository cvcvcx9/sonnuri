export default function hideVideoModal(modal) {
    const video = modal.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
    }
    modal.close();
  }