//import idb from './idb';
/**
 * Common database helper functions.
 */
var dbPromise;
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }
  static openDatabase() {
  return idb.open('Restaurant Reviews', 4, (upgradeDBObject) => {
    switch (upgradeDBObject.oldVersion) {
      case 0:
        upgradeDBObject.createObjectStore('restaurants', {
          keyPath: 'id'
        });
      case 1:
        upgradeDBObject.createObjectStore('restaurant-reviews', {
          keyPath: 'id'
        });
        case 2:
        upgradeDBObject.createObjectStore('outbox', {
          autoIncrement: true, 
          keyPath: 'id' 
        });
    }
  })
}
  static getCachedMessages(){
    dbPromise = DBHelper.openDatabase();
    return dbPromise.then(function(db){
      if(!db) return;

      var tx = db.transaction('restaurants');
      var store = tx.objectStore('restaurants');

      return store.getAll();
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getCachedMessages().then(function(data){
      if(data.length > 0){
        return callback(null , data);
      }

      fetch(DBHelper.DATABASE_URL , {credentials:'same-origin'})
      .then(res => {
        console.log('res fetched is: ', res);
        return res.json()})
      .then(data => {
        dbPromise.then(function(db){
          if(!db) return db;
          console.log('data fetched is: ', data);


          var tx = db.transaction('restaurants' , 'readwrite');
          var store = tx.objectStore('restaurants');

          data.forEach(restaurant => store.put(restaurant));

          store.openCursor(null , 'prev').then(function(cursor){
            return cursor.advance(30);
          })
          .then(function deleteRest(cursor){
            if(!cursor) return;
            cursor.delete();
            return cursor.continue().then(deleteRest);
          });
        });
        return callback(null,data);
      })
      .catch(err => {
        return callback(err , null)
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // ** Using fetch API *** //
    fetch(`${DBHelper.DATABASE_URL}${id}`).then(response => {
      if (response){
        return response.json();
      }
    }).then(json => callback(null, json))
       .catch(err => callback(`Request failed. Returned status of ${err.code}. ${err.message}`,null) );
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (restaurant.photograph === undefined ? 
    'http://via.placeholder.com/800x600' : 
	`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
  static fetchReviewsForRestaurant(id, callback) {
    fetch('http://localhost:1337/reviews/?restaurant_id=' + id).then(response => {
      if (response.status === 200) {
        response.json().then(json => {
          callback(null, json);
        }).catch(err => {
          callback(err, null);
        });
      } else {
        callback(`Request failed. Returned status of ${response.status}`, null);
      }
    }).catch(err => {
      callback(err, null);
    });
  }
}