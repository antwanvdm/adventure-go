self.addEventListener('install', function (event) {
    console.log("install!");
});

self.addEventListener('fetch', function (event) {
    let request = event.request;
    if (request.url.indexOf('api/') !== -1) {
        return;
    }
});
