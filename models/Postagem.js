// Model de postagem

const { default: mongoose } = require('mongoose')


// Carregar o mongoose
// mongoose = require('mongoose')

const Schema = mongoose.Schema

// Definir o model
const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    }, 

    slug: {
        type: String,
        required: true
    }, 

    descricao: {
        type: String,
        required: true
    },

    conteudo: {
        type: String,
        required: true
    },

    // Armazenar o ID de uma categoria
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },

    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("postagens", Postagem)