let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

let categorias = {
    1: 'Comidas',
    2: 'Bebidas',
    3: 'Postres'
}

const btGuardarCliente = document.querySelector('#guardar-cliente');
btGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){

    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposExisten = [mesa, hora].some( (campo) => campo === '' );

    if(camposExisten){

        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){

            const alerta = document.createElement('div');
            alerta.classList.add("invalid-feedback", "d-block", "text-center");
            alerta.textContent = 'Todos los campos son obligatorios.';
            document.querySelector('.modal-body form').appendChild(alerta); 

            setTimeout(() => {
                alerta.remove();
            }, 3000);

        }
        
        return;
    }

    //Le asignamos datos al objeto cliente
    cliente = { ...cliente,mesa, hora };

    //Ocultamos el modal
    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();

    mostrarSecciones();

    obtenerPlatos();

}

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none') );
}

function obtenerPlatos(){

    const url = 'http://localhost:3000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatos(resultado) )
        .catch( error => console.log(error) );

}

function mostrarPlatos(platos){

    const contenido = document.querySelector('#platillos .contenido');

    platos.forEach( (plato) => {

        const row = document.createElement('div');
        row.classList.add('row', 'py-3','border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = plato.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${plato.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[plato.categoria];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${plato.id}`;
        inputCantidad.value = 0;
        inputCantidad.classList.add('from-control');

        //Detectamos la cantidad y el plato que se esta agregando
        inputCantidad.onchange = function (){
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...plato, cantidad});
        };

        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);


        row.appendChild(nombre);   
        row.appendChild(precio);   
        row.appendChild(categoria);   
        row.appendChild(agregar);   

        contenido.appendChild(row);

    });

}


function agregarPlatillo(producto){

    //Extrae el pedido actual
    let {pedido} = cliente;

    if(producto.cantidad > 0){

        if(pedido.some( (articulo) => articulo.id === producto.id )){

            //El articulo si existe y actualizamos su cantidad
            const pedidoActualizado = pedido.map( articulo => {

                if(articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;
                }

                return articulo;
            });

            //Luego le asignamos el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];

        }else{

            //El articulo no existe y lo agregamos al pedido
            cliente.pedido = [...pedido, producto];

        }

    }else{

        //Eliminamos elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );

        cliente.pedido = [...resultado];

    }

    limpiarHtml();

    if(cliente.pedido.length){
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

}

function actualizarResumen(){

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6','card', 'py-5', 'px-3', 'shadow');

    //Informacion de la mesa
    const mesa = document.createElement('p');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';

    const mesaSpan = document.createElement('span');
    mesaSpan.classList.add('fw-normal');
    mesaSpan.textContent = cliente.mesa;


    //Informacion de la hora
    const hora = document.createElement('p');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('span');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de las seccion
    const titulo = document.createElement('h3');
    titulo.classList.add('my-4', 'text-center');
    titulo.textContent = 'Platos consumidos';

    //Itera sobre el array de los pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    let { pedido } = cliente;

    pedido.forEach( articulo => {

        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreItem = document.createElement('h4');
        nombreItem.classList.add('my-4');
        nombreItem.textContent = nombre;

        const cantidadItem = document.createElement('p');
        cantidadItem.classList.add('fw-bold');
        cantidadItem.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        cantidadItem.appendChild(cantidadValor);

        const precioItem = document.createElement('p');
        precioItem.classList.add('fw-bold');
        precioItem.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = precio;

        precioItem.appendChild(precioValor);
        
        const subtotalItem = document.createElement('p');
        subtotalItem.classList.add('fw-bold');
        subtotalItem.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio,cantidad);

        subtotalItem.appendChild(subtotalValor);

        //Boton Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar pedido';
        btnEliminar.onclick = function(){
            eliminarProducto(id);
        }

        lista.appendChild(nombreItem);
        lista.appendChild(cantidadItem);
        lista.appendChild(precioItem);
        lista.appendChild(subtotalItem);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);

    });

    resumen.appendChild(titulo);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    formularioDePropinas();

}

function calcularSubtotal(precio,cantidad){
    return `$${precio * cantidad}`;
}

function mensajePedidoVacio(){

    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);

}

function limpiarHtml() {
    const contenido = document.querySelector("#resumen .contenido");

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function eliminarProducto(id){

    const {pedido} = cliente;

    const resultado = pedido.filter( articulo => articulo.id !== id );
    cliente.pedido = [...resultado];

    limpiarHtml();

    if(cliente.pedido.length){
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}

function formularioDePropinas(){

    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card','py-5','px-3','shadow');

    const heading = document.createElement('h3');
    heading.classList.add('my-4','text-center');
    heading.textContent = 'Propina';

    //Radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const divRadio10 = document.createElement('div');
    divRadio10.classList.add('form-check');

    divRadio10.appendChild(radio10);
    divRadio10.appendChild(radio10Label);

    //Radio button 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');
    radio25.onclick = calcularPropina;

    const divRadio25 = document.createElement('div');
    divRadio25.classList.add('form-check');

    divRadio25.appendChild(radio25);
    divRadio25.appendChild(radio25Label);

    //Radio button 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;


    const radio50Label = document.createElement('label');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const divRadio50 = document.createElement('div');
    divRadio50.classList.add('form-check');

    divRadio50.appendChild(radio50);
    divRadio50.appendChild(radio50Label);

    divFormulario.appendChild(heading);
    divFormulario.appendChild(divRadio10);
    divFormulario.appendChild(divRadio25);
    divFormulario.appendChild(divRadio50);

    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);

}

function calcularPropina(){

    const {pedido} = cliente;
    
    let subtotal = 0;

    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100);

    const total = subtotal + propina;

    mostrarTotalHtml(subtotal, total, propina);

}

function mostrarTotalHtml(subtotal, total, propina){

    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar', 'my-5');

    //Subtotal
    const subtotalParrafo = document.createElement('p');
    subtotalParrafo.classList.add('fs-4','fw-bold','mt-3');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    //Propina
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4','fw-bold','mt-3');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Total
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-4','fw-bold','mt-3');
    totalParrafo.textContent = 'Total a pagar: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    //Eliminar el ultimo resultado
    const totalPagarDiv = document.querySelector('.total-pagar');

    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);

}