// Carregar estrategia local
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


// Model de usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){


    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "Esta conta não existe!"})
            }


            // Comparar a senha caso usuario for encontrado
            bcrypt.compare(senha, usuario.senha, (erro,batem) => {

                if(batem){
                    return done(null,usuario)
                } else{
                    return done(null, false,{message: "Senha incorreta"})
                }

            })
        })
    }))


    // Salvar dados de um usuario na sessão
    passport.serializeUser((usuario,done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id); // Usando await ao invés de callback
            done(null, usuario);
        } catch (err) {
            done(err, null);
        }
    });
    
    
    
}