export default function createModal() {
  const modal = document.createElement('div');
  modal.id = 'my_word_modal';

  document.body.appendChild(modal);

  modal.open = () => {
    modal.classList.add('open');
    modal.classList.remove('close');
  };
  
  modal.close = () => {
    modal.classList.remove('open');
    modal.classList.add('close');
  };

  return modal;
}
