let deferredPrompt;
let enableNotificationsButtons=document.querySelectorAll('.enable-notifications')

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

let displayConfirmNotification=()=>{
    let options={
        body:'You successfully subscribed to our Notifications!',
        icon:'/src/images/icons/app-icon-96x96.png',
        image:'/src/images/sf-boat.jpg',
        dir:'ltr',
        lang:'en-US',
        vibrate:[100, 50, 200],
        badge:'/src/images/icons/app-icon-96x96.png',
        tag:'confirm-notification',
        renotify:true,
        actions:[
            {action:'confirm', title:'Okay', icon:'/src/images/icons/app-icon-96x96.png'},
            {action:'cancel', title:'Cancel', icon:'/src/images/icons/app-icon-96x96.png'},
        ]
    }
    if('serviceWorker' in navigator){
        navigator.serviceWorker.ready
            .then((swRegistration)=>{
                swRegistration.showNotification('Successfully subscribed from SW Notifications!',options)
            })
    }else{
        new Notification('Successfully subscribed!', options)
    }

}

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};
let configurePushSub=()=>{
  if(!('serviceWorker' in navigator)){
      return;
  }
  let reg;
  navigator.serviceWorker.ready
      .then(swReg=>{
        reg=swReg;
        return swReg.pushManager.getSubscription()
    }).then(subscription=>{
        if(subscription===null){
            //Create a new subscription
            const vapidPublicKey='BEPMZBuzbi2Ux9sYmUvo5v1C4XsE03gQLfmG3TZt0lLNUx3trYPLZImJKPE77oov8IaofDjOOkbEvderndbTdkw';
            const convertedVapidKey=urlBase64ToUint8Array(vapidPublicKey)
            reg.pushManager.subscribe({
                userVisibleOnly:true,
                applicationServerKey:convertedVapidKey
            })
        }else{
            //I have a subscription
        }
  }).then(newSub=>{
      //do a post request to your backend api, in the body add JSON.stringify(newSub)
  }).then(res=> {
      if(res.ok) {
          displayConfirmNotification()
      }
  }).catch(err=>{
      console.log(err, 'error')
  })
}
let askForNotificationPermission=()=>{
  Notification.requestPermission(result=>{
      console.log(result, 'user choice');
      if(result!=='granted'){
          console.log('No notification permission granted')
      }else {
        // displayConfirmNotification()
          configurePushSub()
      }
  })
}

if('Notification' in window && 'serviceWorker' in navigator){
    enableNotificationsButtons.forEach(notifButton=> {
        notifButton.style.display = 'inline-block';
        notifButton.addEventListener('click', askForNotificationPermission)
    })
}