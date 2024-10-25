// Requerir os modulos
// Instalar todos via cmd
    const express = require('express');
    const { engine } = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express();
    const mongoose = require('mongoose');
    const session = require('express-session');
    const flash = require('connect-flash')

    // Carregar o model de posagens
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")

    // Carregar model de categorias
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias") 

    // Carregar usuarios
    const usuarios = require("./rotes/usuario")

    // Carregar arquivo auth
    const passport = require('passport')
    require("./config/auth")(passport)


    // Carregar arquivo de config db
    const db = require("./config/db")


    // path nao precisa instalar pelo cmd, já vem de padrao
        const path = require('path')

    // Criar constantes das rotas
        const admin = require("./rotes/admin");

// configurações


    // Conif sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));


        app.use(passport.initialize())
        app.use(passport.session())



        app.use(flash())

    // Confi moddlware
        app.use((req,res,next) => {
            // Criar  vars globais, acessar em qualquer local
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next();
        })


    //Config bodyParser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())

    // Config handleBars
        app.engine('handlebars', engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            },
            partialsDir: path.join(__dirname, 'views/partials'), // Registro de parciais aqui
        })); 
        app.set('view engine', 'handlebars');

    // Config mangoose
    // Bloco de conexão blogapp é o nome do banco de dados
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(() => {
            console.log("Conectado ao mongo!")
        }).catch((err) => {
            console.log("Erro ao se concetar: " + err)
        })


    // Config public
    // Falar que a pasta que guarda todos os arquivos estaticos é a public
        app.use(express.static(path.join(__dirname, "public")));




    // Criar um middlware
        app.use((req, res, next) => {
            console.log('Eu sou um middlware')
            // Mandar passar requisição
            next();
        })


// rotas

    // Rota principal
    app.get("/", (req,res) => {
        // res.send("Rota principal!")
        // Listar as postagens
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens});
        }).catch((errr) => {
            req.flash("error_msg", "HOuve um erro ao listar as postagens!")
            res.redirect("/404")
        })
    })

    // Rota de erro
    app.get("/404", (req,res) => {
        res.send("Erro 404!")
    })

    // Rota para ler mais
    app.get("/postagem/:slug", (req,res) => { 
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Está postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/")
        })
    })


    // Rota para listar categorias
    app.get("/categorias", (req,res) => {
        // Carregar o model de categoria
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias:categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias!")
            res.redirect("/")
        })
    })

    // Rota link da categoria
    app.get("/categorias/:slug", (req,res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            // Se ele achar a categoria
            if(categoria){
                Postagem.find({categoria: categoria.id}).then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Está categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    // Chamar rotas admin
        app.use('/admin', admin);

    // rota de usuarios
    app.use("/usuarios", usuarios)

// outros
    // var para a porta
        const PORT = process.env.port || 8081;
    // Use a var da porta 
        app.listen(PORT, () => {
            console.log("Servidor rodando!")
        })