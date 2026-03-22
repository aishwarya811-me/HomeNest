export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cormorant Garamond"', 'serif'],
                body: ['"Outfit"', 'sans-serif'],
            },
            colors: {
                primary: { 50: '#fdf4ee', 100: '#fae3d0', 200: '#f5c5a0', 300: '#eda06a', 400: '#e47a3a', 500: '#d95e1e', 600: '#c04a15', 700: '#9e3912', 800: '#7e2d12', 900: '#672612' },
                dark: '#1a1a2e',
                cream: '#fdf8f3',
            }
        },
    },
    plugins: [],
}