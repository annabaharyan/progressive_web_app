let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //       .then(registrations=>{
  //         registrations.forEach(registrations=>registrations.unregister())  //this check if we have service worker, we can unregister it on +add post click
  //       })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


function createCard() {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

const clearCard=()=>{
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }}



// const url='https://httpbin.org/get'
const url='https://httpbin.org/post'
let networkRequestReceived=false

fetch(url,{
  method:'POST',
  headers:{
    'Content-Type':'application/json',
    'Accept':'application/json'
  },
  body:JSON.stringify({
    message:'my message'
  })
})
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      networkRequestReceived=true
      console.log('from web', data)
      clearCard()
      createCard();
    });


if('caches' in window){
  caches.match(url)
      .then(res=>{
         if(res){
           return res.json()
         }
      })
      .then(data=>{
        console.log('from cache', data)
        if(!networkRequestReceived){ //this cached value only used if network request doesn't receive yet
          clearCard()
          createCard()
        }

      })
}
