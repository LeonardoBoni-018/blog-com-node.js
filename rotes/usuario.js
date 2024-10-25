// chamar express
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// chamar model de usuarios
require("../models/Usuario")

const Usuario = mongoose.model("usuarios")


// Importar o bcryptjs
const bcrypt = require('bcryptjs')

// Importar o passport
const passport = require('passport')
const isAdmin = require('../helpers/isAdmin')


// Rotas

// rota de registro
router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

// Rota para validar cadastro
router.post("/registro" , (req,res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 4) {
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2) {
        erros.push({texto: "Senhas não convergem, tente novamente"})
    }

    if(erros.length > 0){
        
        res.render("usuarios/registro", {erros: erros})

    } else{
        // Verifica se o usuario ja esta cadastrado
        // Chamar model de usuaurio
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
                // Caso email ja exista
                req.flash("error_msg", "Email já cadastrado!")
                res.redirect("/usuarios/registro")
            } else{
                // Caso email n esteja cadastrado
                // Cadastrar novo user
                const newUser = new Usuario({
                    nome : req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })


                // Encriptar senha  
                bcrypt.genSalt(10, (erro, salt) => {
                    // Parametros da funcao hash (qual valor vai ser hasheado, salt, funcao de calback)
                    bcrypt.hash(newUser.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro ao salvar o usuário!")
                            res.redirect("/")
                        }
                        // Senha do usuario sera hasheada
                        newUser.senha = hash

                        // Salvar novo usuario
                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao salvar o usuário, tente novamente")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

// Rota de formulario de login
    router.get("/login", (req,res) => {
        res.render("usuarios/login")
    })


// Rota de autenticação
    router.post("/login", (req,res,next) => {
        // Carregar o passport


        // Local pois foi a configurada
        passport.authenticate("local", {
            // Tres campos

            // Caso de sucesso
            successRedirect: "/",
            // Caso de falha
            failureRedirect: "/usuarios/login",
            // Mensagens flashs
            failureFlash: true
        })(req,res,next)
    })

// rota para logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { 
            return next(err); 
        }
        req.flash("success_msg", "Deslogado com sucesso!");
        res.redirect("/");
    });
});




// Exportar o router
module.exports = router;
