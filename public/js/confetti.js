// Función para ejecutar confeti cada vez que se carga la página
function executeConfetti() {
    // Pequeño retraso para asegurar que todo esté cargado
    setTimeout(() => {
        try {
            // Verificar que confetti esté disponible
            if (typeof confetti === 'function') {
                // Ejecutar confeti con configuración personalizada
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'],
                    gravity: 0.8,
                    ticks: 200
                });
                
                // console.log('¡Confeti ejecutado exitosamente!');
            } else {
                console.log('Confeti no está disponible');
            }
        } catch (error) {
            console.error('Error al ejecutar confeti:', error);
        }
    }, 1000); // 1 segundo de espera
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', executeConfetti);
