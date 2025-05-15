var deferredPrompt;

if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
        .then(()=>{
           console.log('ServiceWorker Registered')
        })
        .catch(()=>{console.log('Registration failed')})
}

//this allows us to check if user want to upload the app or not, and show propmt
window.addEventListener('beforeinstallprompt', function(event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});