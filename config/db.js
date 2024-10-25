if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://<dbUser>:<#Lrb_2024!>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"

    }
} else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}