const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


const favoriteSchema = new Schema({
 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    dishes:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Dish',
        default: []
    }
},{
    timestamps : true
})

favoriteSchema.plugin(passportLocalMongoose);

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;

