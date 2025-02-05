import React, { useEffect, useState } from 'react';
import './styles.css';

const Galeria = () => {
    const [imagens, setImagens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarImagens = async () => {
            try {
                const response = await fetch("./imagens.json");
                const data = await response.json();
                console.log(data);
                
                setImagens(data);
            } catch (error) {
                console.error("Erro ao carregar imagens:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarImagens();
    }, []);

    return (
        <div>
            {loading ? (
                <div id="loader">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="imagens centralizar margemImagens">
                    {imagens.map((src, index) => (
                        <img
                        key={index}
                        src={`./images/${src}`}
                        loading="lazy"
                        alt={`Imagem ${index}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Galeria;
