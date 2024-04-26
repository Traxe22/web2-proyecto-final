
// Obtener los productos en oferta del servidor
let carrito = [];

fetch('/ofertas')
    .then(response => response.json())
    .then(productoOferta => {
        // Entro a la API para obtener los productos
        function getProductos(done) {
            const results = fetch('https://fakestoreapi.com/products');
            results
                .then(response => response.json())
                .then(data => {
                    // Traducir títulos y descripciones
                    data.forEach(product => {
                        const title = product.title;
                        const description = product.description;
                        fetch(`/traducir?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`)
                            .then(response => response.json())
                            .then(translatedData => {
                                // Aquí puedes hacer algo con los datos traducidos, como mostrarlos en el HTML
                                console.log(translatedData);
                            })
                            .catch(error => {
                                console.error('Error fetching translation:', error);
                            });
                    });
                    done(data);
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                });
        }
    
        // Con los datos traídos de la API, los muestro por HTML
        getProductos(function(data) {
            console.log(data);
            data.forEach(product => {
                console.log(product);

                // Verificar si el producto está en oferta
                const estaEnOferta = productoOferta.some(ofertaProduct => ofertaProduct.id === product.id);

                //calcular precio
                let precioFinal = product.price;
                let descuento = 0;
                let montoDescontado = 0;
                if(estaEnOferta){
                    descuento= productoOferta.find(ofertaProduct=> ofertaProduct.id === product.id).discountPercentage;
                    montoDescontado= (descuento/100)*product.price;
                    precioFinal=product.price - montoDescontado;
                }
                const article = document.createRange().createContextualFragment(/*html*/`
                     <article class="product-card ${estaEnOferta ? 'oferta' : ''}">
                        <div class="img-cont">
                            <img src="${product.image}" alt="${product.title}">
                            ${estaEnOferta ? '<div class="oferta-band">Oferta</div>' : ''}
                        </div>
                        <h2>${product.title}</h2>
                        <p class="description">${product.description.substring(0, 30)}...</p>
                        <p>Precio Original: ${product.price} $</p>
                        ${estaEnOferta ? `<p>Descuento: ${descuento}%</p>
                        <p>Monto Descontado: ${montoDescontado.toFixed(2)} $</p>` : ''}
                        <p>Precio Final: ${precioFinal.toFixed(2)} $</p>
                        <div class="cantidad-container">
                            <label for="cantidad-${product.id}">Cantidad:</label>
                            <input type="number" id="cantidad-${product.id}" class="product-cantidad" min="1" value="1">
                        </div>
                        <div class="style-button-container">
                            <button class="addCarrito style-button" data-product-id="${product.id}" data-esta-en-oferta="${estaEnOferta}" data-descuento="${descuento}" data-monto-descontado="${montoDescontado.toFixed(2)}" data-precio-final="${precioFinal.toFixed(2)}">Agregar al carrito</button>
                        </div>
                    </article>
                `);
               

                // Evento para mostrar información completa
                const description = article.querySelector('.description');
                
                description.addEventListener('mouseover', function() {
                    description.textContent = product.description;
                });

                // Evento para mostrar información incompleta
                description.addEventListener('mouseout', function() {
                    description.textContent = product.description.substring(0, 30) + '...';
                });
                // Evento para agregar al carrito
                const addCarrito = article.querySelector('.addCarrito');
                addCarrito.classList.add('style-button');
                addCarrito.addEventListener('click',function(){
                    //
                    const productId = addCarrito.dataset.productId;
                    const cantidad = parseInt(document.getElementById(`cantidad-${productId}`).value);
                    const estaEnOferta = addCarrito.dataset.estaEnOferta ==='true';
                    const descuento = parseFloat(addCarrito.dataset.montoDescontado);
                    const precioFinal = parseFloat(addCarrito.dataset.precioFinal);
                    console.log(`Producto ID: ${productId}, Cantidad: ${cantidad}, Esta en oferta: ${estaEnOferta}, Descuento: ${descuento}, Monto Descontado ${montoDescontado}, Precio Final: ${precioFinal}`);

                    // Crear el objeto producto
                    const productoEnCarrito={
                        id: productId,
                        cantidad: cantidad,
                        title: product.title,
                        estaEnOferta: estaEnOferta,
                        descuento: descuento,
                        montoDescontado: montoDescontado,
                        precioFinal: precioFinal
                    };

                    // Agregar el producto al carrito
                    agregarAlCarrito(productoEnCarrito);
                })


                document.getElementById("product-list").appendChild(article);
            });
        });
 });

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    // Verifica si el producto ya está en el carrito
    const index = carrito.findIndex(item => item.id === producto.id);
    if (index !== -1) {
        // Si el producto ya está en el carrito, aumenta la cantidad
        carrito[index].cantidad += producto.cantidad;
    } else {
        // Si el producto no está en el carrito, agrégalo
        carrito.push(producto);
    }
    // Actualiza la visualización del carrito
    actualizarCarrito();
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    // Limpiar el área del carrito
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';

    // Mostrar cada producto en el carrito
    carrito.forEach(item => {
        const carritoItem = document.createElement('li');
        carritoItem.innerHTML = `
            <span>${item.title}</span>
            <span>Cantidad: ${item.cantidad}</span>
            <span>Precio Final: ${item.precioFinal.toFixed(2)} $</span>
            <button class="eliminarCarrito" data-product-id="${item.id}">Eliminar</button>
        `;
        // Agregar evento para eliminar producto del carrito
        carritoItem.querySelector('.eliminarCarrito').addEventListener('click', () => {
            eliminarDelCarrito(item.id);
        });
        cartList.appendChild(carritoItem);
    });

    // Calcular y mostrar el total del carrito
    const total = carrito.reduce((acc, item) => acc + item.precioFinal * item.cantidad, 0);
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    // Filtra el producto a eliminar del carrito
    carrito = carrito.filter(item => item.id !== productId);
    // Actualiza la visualización del carrito
    actualizarCarrito();
}

// Agrega un evento de clic al botón "Pagar"
const checkBtn = document.getElementById('check-btn');

checkBtn.addEventListener('click', realizarCompra);


function realizarCompra() {
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega productos antes de realizar la compra.');
        return; // Detener la función si el carrito está vacío
    }

    // Obtener la información actual del carrito
    const carritoInfo = {
        compras: carrito.map(item => ({
            productId: item.productId,
            cantidad: item.cantidad, // Incluir la cantidad de cada producto
            price: item.price,
            hasOffer: item.hasOffer
        }))
    };

    // Enviar la información al servidor
    fetch("/comprar", {
        method: 'POST', // Aquí se especifica el método POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(carritoInfo)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al realizar la compra');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar un mensaje al usuario indicando que la compra se realizó con éxito
        alert('¡Compra realizada con éxito!');
        // Limpiar el carrito después de realizar la compra
        carrito = [];
        actualizarCarrito();
    })
    .catch(error => {
        // Mostrar un mensaje de error al usuario si ocurrió algún problema durante la compra
        console.error('Error al realizar la compra:', error);
        alert('Ocurrió un error al realizar la compra. Por favor, inténtalo de nuevo más tarde.');
    });
}


        