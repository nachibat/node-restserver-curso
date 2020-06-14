const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();
const Producto = require('../models/producto');

// ====================================
// Obtener productos
// ====================================

app.get('/productos', verificaToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario y categoria
    // paginado

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });


        });


});


// ====================================
// Obtener un producto por ID
// ====================================

app.get('/productos/:id', verificaToken, (req, res) => {
    // populate: usuario y categoria
    const id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encuentra el ID del producto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });


});


// ====================================
// Buscar productos
// ====================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    const termino = req.params.termino;

    const regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });

});




// ====================================
// Crear un nuevo producto 
// ====================================

app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado

    const body = req.body;

    const producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Token inválido'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});


// ====================================
// Actualizar un producto 
// ====================================

app.put('/productos/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precio;
        productoDB.categoria = body.categoria;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        })



    });


});


// ====================================
// Borrar un producto 
// ====================================

app.delete('/productos/:id', (req, res) => {
    // cambiar el estado de disponible a false
    const id = req.params.id;
    const cambioDisponible = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, cambioDisponible, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID de producto no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            productoBorrado
        })

    });


});




module.exports = app;