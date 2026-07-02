// Shared Tailwind theme for every page — edit colors/fonts here once.
// Must load after the Tailwind CDN script.
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#FFF2F1',
                secondary: '#f1edff',
                accent: '#6d5b99',
                accentHover: '#50427a',
                accentLight: 'rgba(109, 91, 153, 0.1)',
                textLight: '#2d3748',
                textDim: '#4a5568',
                headingColor: '#1a202c',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                'glow': '0 0 15px rgba(109, 91, 153, 0.3)',
            }
        }
    }
};
