// <script src="service.js"></script>
"use strict";


// ****************************************************************
const CACHE_NAME = "wind-app";
const CACHE_LIST =
[
    "index.html",
    "manifest.json",
    "service.js",
    "data/credits.txt",
    "data/version.txt",
    "data/code/pack.js",
    "data/code/style.css",
    "data/fonts/default.ttf",
    "data/fonts/default.woff",
    "data/fonts/default.woff2",
    "data/music/default.mp3",
    "data/music/default.opus",
    "data/sounds/default.wav",
    "data/textures/apple-touch-icon.png",
    "data/textures/favicon-128.png",
    "data/textures/favicon-192.png",
    "data/textures/favicon-256.png",
    "data/textures/favicon-512.png",
    "data/textures/favicon.ico",
    "data/textures/maus_logo.png"
];


// ****************************************************************
if("serviceWorker" in navigator)
{
    const name = document.currentScript.src;
    window.addEventListener("load", function()
    {
        navigator.serviceWorker.register(name).catch(() => {});
    });
}


// ****************************************************************
self.addEventListener("install", function(event)
{
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache)
    {
        return cache.addAll(CACHE_LIST);
    }));
});


// ****************************************************************
self.addEventListener("fetch", function(event)
{
    event.respondWith(caches.match(event.request).then(function(response)
    {
        return response || fetch(event.request);
    }));
});