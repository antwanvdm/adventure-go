self.addEventListener('install', function (event) {

});

self.addEventListener('fetch', function (event) {
  let request = event.request;
  if (request.url.indexOf('api/') !== -1) {
    return;
  }
});

self.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    console.log('APP resumed');
    window.location.reload();
  }
});
