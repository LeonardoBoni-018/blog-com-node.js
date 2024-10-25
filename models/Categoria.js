// Carregar o mongoose
mongoose = require('mongoose')

const Schema = mongoose.Schema

// Definir o model
    const Categoria = new Schema({
        nome: {
            type: String,
            require: true
        },
        slug: {
            type: String,
            require: true
        },
        date: {
            type: Date,
            // Caso usuario nao definir uma data, sera cadastrada a data atual
            // Default é o valor padrao
            default: Date.now()
        }
    })

    mongoose.model("categorias", Categoria)
