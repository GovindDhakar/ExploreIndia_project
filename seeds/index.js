const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../model/campground');

main().catch(err => console.log("Connection Error", err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log("Database Connected")
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    for (let i = 0; i < 8; i++) {
        const price = Math.floor(Math.random() * 1000) + 1000
        const camp = new Campground({
            // My user id
            author: "61c6de3239170c7c54754661",
            location: `${cities[i].city}, ${cities[i].state}`,
            title: `${cities[i].title}`,
            geometry: { type: 'Point', coordinates: [cities[i].longitude, cities[i].latitude] },
            images: [
                {
                    url: cities[i].images[0].url,
                    filename: cities[i].images[0].filename
                },
                {
                    url: cities[i].images[1].url,
                    filename: cities[i].images[1].filename
                }
            ],
            description:cities[i].description,
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})