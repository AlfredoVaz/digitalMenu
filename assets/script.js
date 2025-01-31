document.addEventListener("DOMContentLoaded", async function () {
    const gallery = document.getElementById("gallery");

    window.addEventListener('load', function() {
        const loader = document.getElementById('loader');
        const content = document.getElementById('content');

        loader.style.display = 'none';
        content.style.display = 'block';
    });

    try {
        const response = await fetch("/images");
        const images = await response.json();

        images.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            img.loading = "lazy";
            img.style.opacity = 0;
            img.onload = () => img.style.opacity = 1;
            gallery.appendChild(img);
        });

    } catch (error) {
        console.error("Erro ao carregar imagens:", error);
    } finally {
        loader.style.display = "none";
    }
});
