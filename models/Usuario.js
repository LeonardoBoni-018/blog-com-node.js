// Model de ususarios

const mongoose  = require('mongoose')
const Schema = mongoose.Schema

// Montar o usuario

const Usuario = new Schema ({
    nome: {
        type: String,
        required: true
    }, 

    email: {
        type: String,
        required:true
    },

    // Verifica se o user é admin

    isAdmin: {
        type:Number,
        default: 0
    },

    senha: {
        type:String,
        required:true
    }
})

mongoose.model("usuarios", Usuario)