const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    cant: conteo,
                    categorias
                });


            });


        });



});


// ============================
// Mostrar una categoria por id
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById();

    const id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'No se encontro la categoria'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});


// ============================
//Crear nueva categoria
// ============================
app.post('/categoria', verificaToken, (req, res) => {

    const categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });

});


// ============================
// Actualizar una categoria
// ============================
app.put('/categoria/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    const body = {
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    }

    Categoria.findByIdAndUpdate(id, body, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});


// ====================================
// Borrar una categoria permanentemente
// ====================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Solo un administrador puede borrar una categoria
    // Categoria.findByIdAndRemove
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        });

    });
});




module.exports = app;