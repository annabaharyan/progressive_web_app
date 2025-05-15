let Static_Cache_Name='static-v1'
let Dynamic_Cache_Name='dynamic-v1'
const  Static_files=[
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]
self.addEventListener('install',(event)=>{
    console.log('Service Worker installing', event)
    event.waitUntil(caches.open(Static_Cache_Name).then((cache)=>{ //waiting to open the cache  before usage
        console.log('service worker precaching application shell')
        cache.addAll(Static_files)
        // cache.add('/index.html')
        // cache.add('/src/js/app.js')
    }))
} )

const trimCache=(cacheName, maxAllowedItemsInCache)=>{
 caches.open(cacheName)
     .then(cache=>{
       return cache.keys()
           .then(keys=>{
           if(keys.length>maxAllowedItemsInCache){
               cache.delete(keys[0]) ///remove the oldest cachedItem
                   .then(trimCache(cacheName, maxAllowedItemsInCache)) //this will work until keys.length>maxAllowedItemsInCache get false, and we have maxAllowedItemsInCache items in our cache
           }
       })
     })


}

const isInArray=(string, array)=>{
  for(let i=0; i<array.length; i++){
      if(array[i]===string){
          return true
      }
  }
    return false
}

self.addEventListener('activate', (event)=>{
    // console.log('Service worker activated', event)
    //here we can delete all old cache values
    event.waitUntil(caches.keys().then(keylist=>{
        return Promise.all(keylist.map(key=>{
            if(key!==Static_Cache_Name && key!==Dynamic_Cache_Name){
                console.log('Remove all old caches from sw')
               return  caches.delete(key)  //this removes all old caches
            }
        }))
    }))
    return self.clients.claim()
})

// self.addEventListener('fetch', (e)=>{
//     // console.log('Fetch request triggered', e);
//     // e.respondWith(fetch(e.request)) //sw works like network proxy
//
//     e.respondWith(
//         caches.match(e.request)
//             .then(response=>{//check is where any request in cache, if no do new fetch request to network
//                    if(response){
//                     return response
//         }else {
//             return fetch(e.request)
//                 .then((res=>{
//                     return caches.open(Dynamic_Cache_Name)
//                         .then(cache=>{
//                             cache.put(e.request.url, res.clone())  // we clone the request  because without clone it will work only ones
//                             return res //  we return res  because it will show the data for the first time
//                         })
//
//             })).catch(err=>{
//                return  caches.open(Static_Cache_Name)
//                     .then(cache=>{
//                         return cache.match('/offline.html') //fallback page
//                     })
//                 })
//         }
//     }))
//
// })



// //1.cache only(page=>sw=>cache=>page)
// self.addEventListener('fetch', (e)=>{
//     e.respondWith(
//         caches.match(e.request)
//     )
// })


// //2.network only(page=>network=>page)
// self.addEventListener('fetch', (e)=>{
//     e.respondWith(
//         fetch(e.request)
//     )
// })


// //3.network with cache fallback(page=>sw=>network(if fail)=>cache=>page
// self.addEventListener('fetch', (e)=>{
//     e.respondWith(
//      fetch(e.request)  //if success show network data, else show cached data
//          .then(res=>{
//             return caches.open(Dynamic_Cache_Name)
//                  .then(cache=>{
//                      cache.put(e.request.url, res.clone())
//                      return res
//                  })
//          })
//          .catch(err=>{
//            return  caches.match(e.request)
//
//          })
//       )
// })

//4. Cache, then Network
self.addEventListener('fetch', (e)=>{
    const url='https://httpbin.org/get' //check if we have url in our requests
    if(e.request.url.indexOf(url)>-1){
        e.respondWith(
            caches.open(Dynamic_Cache_Name)
                .then(cache=>{
                    return fetch(e.request)
                        .then(res=>{
                            trimCache(Dynamic_Cache_Name, 3) //remove old dynamic cached items, when add new ones
                            cache.put(e.request, res.clone())
                            return res
                        })
                })
        )
    }else if(isInArray(e.request.url, Static_files)){
        e.respondWith(
            caches.match(e.request)
        )
    } else {
       e.respondWith( caches.match(e.request)
           .then(response=>{//check is where any request in cache, if no do new fetch request to network
               if(response){
                   return response
               }else {
                   return fetch(e.request)
                       .then((res=>{
                           return caches.open(Dynamic_Cache_Name)
                               .then(cache=>{
                                   cache.put(e.request.url, res.clone())  // we clone the request  because without clone it will work only ones
                                   return res //  we return res  because it will show the data for the first time
                               })

                       })).catch(err=>{
                           return  caches.open(Static_Cache_Name)
                               .then(cache=>{
                                   if(e.request.headers.get('accept').includes('text/html')){ // if request is html file show fallback page
                                       return cache.match('/offline.html') //fallback page
                                   }

                               })
                       })
               }
           }))
     }

})