const express = require('express');
const fs = require("fs");
const path = require("path");
const translate = require('node-google-translate-skidz');

const app = express();

// Ruta para la traducción de títulos y descripciones
app.get('/traducir', (req, res) => {
    const title = req.query.title;
    const description = req.query.description;

    console.log("Title:", title);
    console.log("Description:", description);

    try {
        translate({ text: title, source: 'en', target: 'es' }, (traduccionTitle) => {
            console.log("Traducción del título:", traduccionTitle);
            translate({ text: description, source: 'en', target: 'es' }, (traduccionDescription) => {
                console.log("Traducción de la descripción:", traduccionDescription);
                const translatedData = {
                    title: traduccionTitle.translation,
                    description: traduccionDescription.translation
                };
                console.log("Datos traducidos:", translatedData);
                res.json(translatedData);
            });
        });
    } catch (error) {
        console.error("Error en la traducción:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// analizar el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Ruta para el archivo estático public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el archivo index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

// Ruta para obtener ofertas
app.get("/ofertas", (req, res) => {
    const ofertasFilePath = path.join(__dirname, 'ofertas.json');
    fs.readFile(ofertasFilePath, "utf-8", (err, data) => {
        if (err) {
            console.error("Error al leer el archivo de ofertas:", err);
            res.status(500).json({ error: "Error interno del servidor" });
            return;
        }
        // Parsear el contenido JSON y enviarlo como respuesta
        const ofertasData = JSON.parse(data);
        res.json(ofertasData);
    });
});
const comprasFilePath = path.join(__dirname, 'compras.json');

// Ruta para efectuar la compra
app.post('/comprar', (req, res) => {
    const nuevaCompra = req.body; // La información del carrito se envía en el cuerpo de la solicitud
    
    // Leer el contenido actual del archivo compras.json
    const comprasFilePath = path.join(__dirname, 'compras.json');
    fs.readFile(comprasFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de compras:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    
        let compras;
        try {
            // Intenta parsear el contenido del archivo a un array
            compras = JSON.parse(data);
            // Verifica si compras no es un array válido
            if (!Array.isArray(compras)) {
                throw new Error('El contenido del archivo no es un array válido');
            }
        } catch (parseError) {
            console.error('Error al parsear el contenido del archivo de compras:', parseError);
            // Si hay un error al parsear los datos, inicializa compras como un array vacío
            compras = [];
        }
    
        // Agregar la nueva compra al array de compras
        nuevaCompra.id = compras.length + 1; // Asignar un nuevo ID a la compra
        nuevaCompra.timestamp = new Date(); // Agregar la fecha y hora actual como timestamp
        compras.push(nuevaCompra);
    
        // Guardar los cambios en el archivo compras.json
        fs.writeFile(comprasFilePath, JSON.stringify(compras, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error al guardar la nueva compra:', writeErr);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
    
            // Respuesta exitosa al cliente
            res.json({ message: 'Compra realizada exitosamente' });
        });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor en funcionamiento en el puerto 3000");
});
