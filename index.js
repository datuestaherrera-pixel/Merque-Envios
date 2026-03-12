// MerqueEnvios - Homepage JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMainStore();
});

// Función para inicializar la tienda principal
function initMainStore() {
    // Carrito de compras
    let carrito = [];
    const carritoBadge = document.querySelector('.carrito-badge');
    
    // Agregar productos al carrito
    const btnAgregar = document.querySelectorAll('.btn-agregar');
    
    btnAgregar.forEach(btn => {
        btn.addEventListener('click', function() {
            const productoCard = this.closest('.producto-card');
            const nombre = productoCard.querySelector('h3').textContent;
            const precioTexto = productoCard.querySelector('.precio-actual').textContent;
            const precio = parseFloat(precioTexto.replace('$', '').replace('.', ''));
            
            // Agregar al array del carrito
            carrito.push({ nombre, precio });
            
            // Actualizar badge
            actualizarCarrito();
            
            // Animación de feedback
            this.innerHTML = '<i class="fas fa-check"></i> Agregado';
            this.style.background = '#27ae60';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar';
                this.style.background = '#603AE9';
            }, 1500);
        });
    });
    
    function actualizarCarrito() {
        const total = carrito.length;
        carritoBadge.textContent = total;
        
        // Animación del badge
        carritoBadge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            carritoBadge.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Búsqueda de productos (simulado)
    const buscador = document.getElementById('buscador');
    const btnBuscar = document.querySelector('.btn-buscar');
    
    btnBuscar.addEventListener('click', function() {
        const termino = buscador.value.trim();
        if (termino) {
            console.log('Buscando:', termino);
            alert('Búsqueda: ' + termino + '\n\n(Esta función estará disponible pronto)');
        }
    });
    
    // Búsqueda al presionar Enter
    buscador.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            btnBuscar.click();
        }
    });
    
    // Efectos hover en categorías
    const categoriaItems = document.querySelectorAll('.categoria-item');
    categoriaItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const nombre = this.textContent.trim();
            console.log('Categoría:', nombre);
            alert('Categoría: ' + nombre + '\n(Esta función estará disponible pronto)');
        });
    });
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    console.log('MerqueEnvios - Homepage cargado correctamente');
}
