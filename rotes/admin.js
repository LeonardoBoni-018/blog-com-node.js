// rotas admin

// chamar o express
const express = require('express');

// Chamar o mongo
const mongoose = require('mongoose');

// chamar model categorias
require("../models/Categoria");
const Categoria = mongoose.model("categorias");


// Chamar model de posts
require('../models/Postagem')
const Postagem = mongoose.model("postagens")

// Chamar o helper
const {isAdmin} = require('../helpers/isAdmin')


// Criar rotas
const router = express.Router();

// Definir as rotas
// Rota principal
router.get('/',isAdmin, (req, res) => {
    res.render("admin/index");
});

// Rota de posts
router.get('/posts',isAdmin, (req, res) => {
    res.send('Página de POSTS');
});

// Rotas de cadastro de categorias
router.get('/categorias',isAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias});
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias!");
        res.redirect("/admin");
        })
});

// Rota para formulario
router.get('/categorias/add',isAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

// Rota para adicionar nova categoria
router.post('/categorias/nova',isAdmin, (req, res) => {

    // Validar formulário
    let erros = [];

    // Verifica os dados
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        // Adicionar dados no array de erro
        erros.push({ texto: "Nome inválido!" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        // Adicionar dados no array de erro
        erros.push({ texto: "Slug inválido!" });
    }

    // Verifica se foi adicionado algum erro
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros });
    } else {
        // receber dados do formulario
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };

        // Criar nova categoria
        new Categoria(novaCategoria).save().then(() => {

            console.log("Categoria salva com sucesso!");
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias');

        }).catch((err) => {
            console.log("Erro ao salvar categoria: " + err);
            req.flash("error_msg", "Houve um erro ao salavar a categoria, tente novamente!")
            res.redirect('/admin');
        });
    }
});

    // Editar categorias
    // Rota para editar categorias
    router.get("/categorias/edit/:id",isAdmin, (req, res) => {
        Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
            console.log(categoria); // Para verificar a categoria
            if (!categoria) {
                req.flash("error_msg", "Esta categoria não existe");
                return res.redirect("/admin/categorias");
            }
            res.render("admin/editcategorias", { categoria });
        }).catch((erro) => {
            console.log(erro); // Para verificar erros
            req.flash("error_msg", "Houve um erro ao buscar a categoria");
            res.redirect("/admin/categorias");
        });
    });


    router.post("/categorias/edit",isAdmin, (req, res) => {
        // Buscar a categoria que possui o mesmo id informado
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            // Defii o valor dos inputs seguindo o ID
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
    
            // Salvar as alterações
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect("/admin/categorias");
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria");
                res.redirect("/admin/categorias");
            });
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria!");
            res.redirect("/admin/categorias");
        });
    });


    // Rota para deletar
        router.post("/categorias/deletar",isAdmin, (req, res) => {
            // Remover a categoria pelo ID
            Categoria.findByIdAndDelete(req.body.id).then(() => {
                // Mensagem de sucesso
                req.flash("success_msg", "Categoria deletada com sucesso!");
                res.redirect("/admin/categorias"); // Redirecionar após a exclusão
            }).catch((erro) => {
                // Mensagem de erro
                req.flash("error_msg", "Houve um erro ao deletar a categoria, tente novamente!");
                res.redirect("/admin/categorias");
            });
        });


    // Rotas para postagens
        router.get("/postagens",isAdmin, (req,res) => {
            // Listar as postagens
            Postagem.findOne().populate("categoria").sort({data : "desc"}).then((postagens) => {
                res.render("admin/postagens", {postagens: postagens})
            }).catch((err) => {
                req.flash("error_msg" , "Houve um erro ao listar as postagens!")
                console.log(`Erro : ${err}`)
                res.redirect("/admin")
            })
        })

        router.get("/postagens/add", isAdmin,(req,res) => {
            Categoria.findOne().then((categorias) => {
                res.render("admin/addpostagem", {categorias:categorias})
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao carregar o formulário")
                res.redirect("/admin")
            })
        })

        // Rota postagens nova
        router.post("/postagens/nova",isAdmin, (req,res) => {

            // Validação
            var erros = [];

            // Verifica o value de categorias
            if(req.body.categoria === "0"){

                // Adiciona o erro ao array de erros
                // Texto sera mostrado no alerta de erros da pagina
                erros.push({texto: "Categoria inválida, adicione uma categoria !"})
            }

            // Verifca se algum erro foi adicionado
            if(erros.length > 0){
                res.render("admin/addpostagem" , {erros: erros})
            } else{
                // adicionar o post
                // Carregar o model de POST

                // Ira receber os dados do formulario
                const novaPostagem = {
                    titulo : req.body.titulo,
                    descricao : req.body.descricao,
                    conteudo : req.body.conteudo,
                    categoria : req.body.categoria,
                    slug : req.body.slug
                }

                // Salvar a nova postagem
                new Postagem(novaPostagem).save().then(() => {
                    req.flash("success_msg", "Postagem criada com sucesso!")
                    res.redirect("/admin/postagens")
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro durante o salvamento da postagem!")
                    console.log(err)
                    res.redirect("/admin/postagens")
                })
            }

        })

        // Rota para editar postagens
       
        router.get("/postagens/edit/:id",isAdmin, (req, res) => {
            Postagem.findOne({ _id: req.params.id }).populate("categoria").then((postagem) => {
                if (!postagem) {
                    req.flash("error_msg", "Postagem não encontrada");
                    return res.redirect("/admin/postagens");
                }
        
                Categoria.find().then((categorias) => {
                    res.render("admin/editpostagens", {
                        categorias: categorias.map(categoria => categoria.toObject()), // Convertendo para objeto puro
                        postagem: postagem.toObject() // Convertendo para objeto puro
                    });
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar as categorias!");
                    res.redirect("/admin/postagens");
                });
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao buscar a postagem");
                res.redirect("/admin/postagens");
            });
        });
        


        // Rota para salvar as edições
        router.post("/postagem/edit",isAdmin, (req,res) => {

            Postagem.findOne({_id: req.body.id}).then((postagem) => {
                // Receber os dados editados

                postagem.titulo = req.body.titulo;

                postagem.slug = req.body.slug;
                postagem.descricao = req.body.descricao;
                postagem.conteudo = req.body.conteudo;
                postagem.categoria = req.body.categoria;


                // Salvar os dados

                postagem.save().then(() =>  {
                    req.flash("success_msg", "Postagem editada com sucesso!")
                    res.redirect("/admin/postagens")
                }).catch((err) => {
                    req.flash("error_msg", "Erro interno")
                    res.redirect("/admin/postagens")
                })
 
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a postagem!")
                res.redirect("/admin/postagens")
            })
        })

        // Rota para deletar postagem
        router.get("/postagens/deletar/:id", isAdmin,(req,res) => {
            Postagem.deleteOne({_id: req.params.id}).then(() => {
                req.flash("success_msg", "Postagem deletada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao deletar a postagem!")
                res.redirect("/admin/postagens")
            })
        })
        



// exportar o router
module.exports = router;
