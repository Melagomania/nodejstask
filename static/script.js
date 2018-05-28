let body = document.getElementById('page');
body.addEventListener('click', (e) => {
  let target = e.target;
  if(target.dataset.action === 'delete') {
    e.preventDefault();
    let url = `content/${target.getAttribute('href')}`;
    sendRequest('DELETE', url, () => {
      if(target.parentElement.parentElement.childElementCount === 1) {
        target.parentElement.parentElement.parentElement.parentElement.removeChild( target.parentElement.parentElement.parentElement);
      } else {
        target.parentElement.parentElement.removeChild(target.parentElement);
      }
    });
  }
});

function sendRequest(method, url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4 && xhr.status === 200) {
       callback();
    }
  };
  xhr.send();
}

