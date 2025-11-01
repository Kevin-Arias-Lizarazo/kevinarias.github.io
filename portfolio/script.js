// script.js - Manejo del formulario de contacto

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el formulario por su ID
    const contactForm = document.getElementById('contact-form');

    // Agregar un event listener para el evento 'submit' del formulario
    contactForm.addEventListener('submit', function(event) {
        // Prevenir el comportamiento por defecto del formulario (que recargaría la página)
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const mensaje = document.getElementById('mensaje').value;

        // Validar que todos los campos estén llenos (aunque ya están marcados como required en HTML)
        if (nombre && correo && mensaje) {
            // Mostrar mensaje en la consola indicando que el formulario fue enviado correctamente
            console.log('Formulario enviado correctamente');
            console.log('Nombre:', nombre);
            console.log('Correo:', correo);
            console.log('Mensaje:', mensaje);

            // Limpiar el formulario después del envío
            contactForm.reset();

            // Aquí podrías agregar código para enviar los datos a un servidor si fuera necesario
            // Por ejemplo, usando fetch() para una API
        } else {
            // Si algún campo está vacío, mostrar un mensaje de error (aunque el navegador ya valida)
            console.log('Por favor, complete todos los campos del formulario.');
        }
    });
});