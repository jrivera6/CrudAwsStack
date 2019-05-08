let usuario = require('../models/UsuarioModel');
const AWS = require('aws-sdk');
const fs = require('fs');
var path = require('path');
var moment = require('moment');

AWS.config.update({
    accessKeyId: "********",
    secretAccessKey: "***********"
});

var s3 = new AWS.S3();

module.exports = {
    show: function(req, res) {
        model.find({}, function(error, items) {
            if (!error) {
                res.render('index', { items: items, moment: moment });
            } else {
                return console.log(error);
            }
        });
    },

    list: function(req, res) {
        let val_id = req.params.id;
        model.findOne({ _id: val_id }, function(err, usuario) {
            if (!err) {
                res.render('actualizar', { usuario: usuario, moment: moment });
            }
        })
    },
    add: function(req, res) {
        res.render('crear', { title: 'Express' });
    },
    create: function(req, res) {
        let fotoname = Date.now() + "_" + path.basename(req.files.archivo.name);
        var params = {
            Bucket: 'jriverappdemo',
            Body: fs.createReadStream(req.files.archivo.path),
            Key: fotoname
        };

        s3.upload(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                let obj = new usuario;
                obj.nombre = req.fields.nombres;
                obj.apellidos = req.fields.apellidos;
                obj.email = req.fields.email;
                obj.nacimiento = req.fields.nacimiento;
                obj.foto = fotoname
                obj.save(function(err, newData) {
                    if (!err) {
                        //res.send(newData);
                        res.redirect('./');
                    } else {
                        console.log(err);
                        res.send(500);
                    }
                })
                console.log("Uploaded in:", data.Location);
            }
        });
    },
    update: function(req, res) {
        model.findOne({ _id: req.fields.id }, function(err, usuario) {
            if (!err) {
                usuario.nombre = req.fields.nombres;
                usuario.apellidos = req.fields.apellidos;
                usuario.email = req.fields.email;
                usuario.nacimiento = req.fields.nacimiento;
                console.log(req.files.archivo.name)
                if (req.files.archivo.name.length > 3) {

                    var params = {
                        Bucket: "jriverappdemo",
                        Key: usuario.foto
                    };

                    s3.deleteObject(params, function(err, data) {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            let fotoname = Date.now() + "_" + path.basename(req.files.archivo.name);
                            var params = {
                                Bucket: 'jriverappdemo',
                                Body: fs.createReadStream(req.files.archivo.path),
                                Key: fotoname
                            };
                            s3.upload(params, function(err, data) {
                                if (err) {
                                    console.log("Error", err);
                                    res.redirect('./');
                                }
                                if (data) {
                                    usuario.foto = fotoname
                                    usuario.save();
                                    res.redirect('./');

                                }
                            });
                        }
                    });
                } else {
                    usuario.save();
                    res.redirect('./');
                }
            }
        })
    },
    delete: function(req, res) {
        model.findOne({ _id: req.fields.id }, function(err, usuario) {
            if (!err) {
                var params = {
                    Bucket: "jriverappdemo",
                    Key: usuario.foto
                };
                s3.deleteObject(params, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        usuario.remove();
                        console.log(data);
                        //res.send({ status: true });
                        res.redirect('./');
                    }
                });
            }
        })
    },
}
