// MerqueEnvios - Homepage JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Detectar si es modo admin
    const hash = window.location.hash;
    if (hash === '#admin') {
        initAdminPanel();
    } else {
        initMainStore();
    }
});

// Función para inicializar el panel de admin
function initAdminPanel() {
    // Ocultar elementos de la tienda principal
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.categorias-nav').style.display = 'none';
    document.querySelector('.banner').style.display = 'none';
    document.querySelector('.seccion-ofertas').style.display = 'none';
    document.querySelector('.seccion-categorias').style.display = 'none';
    document.querySelector('.seccion-destacados').style.display = 'none';
    document.querySelector('.banner-secundario').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    
    // Mostrar panel de admin
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.style.display = 'block';
    
    // Cargar productos existentes para copiar imágenes
    loadExistingProducts();
    
    // Inicializar eventos de pegado de imagen
    initImagePaste();
    
    // Inicializar eventos de verificación de URL
    initImageUrlTest();
    
    console.log('Panel de Admin iniciado');
}

// Cargar productos existentes para copiar sus imágenes
function loadExistingProducts() {
    const grid = document.getElementById('admin-products-grid');
    const productCards = document.querySelectorAll('.producto-card');
    
    productCards.forEach(card => {
        const img = card.querySelector('.producto-img img');
        const title = card.querySelector('h3');
        
        if (img && title) {
            const item = document.createElement('div');
            item.className = 'admin-product-item';
            item.innerHTML = `
                <img src="${img.src}" alt="${title.textContent}">
                <p>${title.textContent}</p>
            `;
            item.addEventListener('click', () => copyImageToClipboard(img.src));
            grid.appendChild(item);
        }
    });
}

// Inicializar eventos de pegado de imagen
function initImagePaste() {
    const pasteArea = document.getElementById('image-paste-area');
    const previewContainer = document.getElementById('preview-container');
    const pastedImagePreview = document.getElementById('pasted-image-preview');
    const imageUrlOutput = document.getElementById('image-url-output');
    
    // Manejar pegado de imagen
    pasteArea.addEventListener('paste', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const imageDataUrl = event.target.result;
                    pastedImagePreview.src = imageDataUrl;
                    imageUrlOutput.value = imageDataUrl;
                    pasteArea.style.display = 'none';
                    previewContainer.style.display = 'block';
                    showToast('Imagen pegada correctamente!');
                };
                
                reader.readAsDataURL(blob);
                break;
            }
        }
        
        // También intentar obtener URL de imagen del portapapeles
        const text = e.clipboardData.getData('text');
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            pastedImagePreview.src = text;
            imageUrlOutput.value = text;
            pasteArea.style.display = 'none';
            previewContainer.style.display = 'block';
            showToast('URL de imagen detectada!');
        }
    });
    
    // Click para enfocar el área de pegado
    pasteArea.addEventListener('click', () => {
        pasteArea.focus();
    });
    
    // Botón de copiar imagen
    document.getElementById('copy-image-btn').addEventListener('click', () => {
        const imageSrc = pastedImagePreview.src;
        copyImageToClipboard(imageSrc);
    });
    
    // Botón de copiar URL
    document.getElementById('copy-url-btn').addEventListener('click', () => {
        const url = imageUrlOutput.value;
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('URL copiada al portapapeles!');
            });
        }
    });
    
    // Botón de limpiar
    document.getElementById('clear-image-btn').addEventListener('click', () => {
        pasteArea.style.display = 'flex';
        previewContainer.style.display = 'none';
        pastedImagePreview.src = '';
        imageUrlOutput.value = '';
    });
    
    // Permitir arrastrar y soltar imágenes
    pasteArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        pasteArea.classList.add('drag-over');
    });
    
    pasteArea.addEventListener('dragleave', () => {
        pasteArea.classList.remove('drag-over');
    });
    
    pasteArea.addEventListener('drop', (e) => {
        e.preventDefault();
        pasteArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                pastedImagePreview.src = event.target.result;
                imageUrlOutput.value = event.target.result;
                pasteArea.style.display = 'none';
                previewContainer.style.display = 'block';
                showToast('Imagen arrastrada correctamente!');
            };
            reader.readAsDataURL(files[0]);
        }
    });
}

// Inicializar verificación de URL de imagen
function initImageUrlTest() {
    const urlInput = document.getElementById('new-image-url');
    const testBtn = document.getElementById('test-image-btn');
    const testPreview = document.getElementById('test-image-preview');
    const testImg = testPreview.querySelector('img');
    
    testBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            testImg.src = url;
            testPreview.style.display = 'block';
            testImg.onload = () => {
                showToast('Imagen cargada correctamente!');
            };
            testImg.onerror = () => {
                showToast('Error al cargar la imagen', true);
                testPreview.style.display = 'none';
            };
        }
    });
    
    // Permitir Enter en el input
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            testBtn.click();
        }
    });
}

// Función para copiar imagen al portapapeles
async function copyImageToClipboard(imageUrl) {
    try {
        // Intentar obtener la imagen como blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        
        showToast('Imagen copiada al portapapeles!');
    } catch (err) {
        // Si falla, copiar la URL como texto
        try {
            await navigator.clipboard.writeText(imageUrl);
            showToast('URL de imagen copiada!');
        } catch (textErr) {
            // Último recurso: mostrar la URL para copiar manualmente
            prompt('Copia esta URL de imagen:', imageUrl);
        }
    }
}

// Función para mostrar notificaciones toast
function showToast(message, isError = false) {
    // Eliminar toast anterior si existe
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

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
