<script>
    import Sidebar from "./Sidebar.svelte"
    import MainContent from "./MainContent.svelte"
</script>

<main>
    <Sidebar />
    <MainContent />
</main>

<style>
    :root {
        /* Color themes */
        --gray: 270deg;
        --color-gray-100: hsl(var(--gray) 20% 95%);
        --color-gray-300: hsl(var(--gray) 10% 75%);
        --color-gray-500: hsl(var(--gray) 5% 50%);
        --color-gray-700: hsl(var(--gray) 10% 30%);
        --color-gray-900: hsl(var(--gray) 15% 15%);

        --primary: 245deg;
        --color-primary: hsl(var(--primary) 90% 50%);
        --color-primary-light: hsl(var(--primary) 90% 70%);
        --color-primary-dark: hsl(var(--primary) 90% 30%);
        --color-primary-alpha-300: hsl(var(--primary) 90% 50% / 0.3);
        --color-primary-alpha-500: hsl(var(--primary) 90% 50% / 0.5);
        --color-primary-alpha-700: hsl(var(--primary) 90% 50% / 0.7);

        --secondary: 350deg;
        --color-secondary: hsl(var(--secondary) 95% 50%);
        --color-secondary-light: hsl(var(--secondary) 95% 70%);
        --color-secondary-dark: hsl(var(--secondary) 95% 30%);
        --color-secondary-alpha-300: hsl(var(--secondary) 95% 50% / 0.3);
        --color-secondary-alpha-500: hsl(var(--secondary) 95% 50% / 0.5);
        --color-secondary-alpha-700: hsl(var(--secondary) 95% 50% / 0.7);
        
        --gradient-deg: 45deg;
        --color-pink-light: hsl(0deg 63% 95%); 
        --color-pink-dark: hsl(306deg 41% 98%); 
        --color-yellow-light: hsl(47deg 98% 83%);
        --color-yellow-dark: hsl(47deg 100% 100%);
        --color-blue-light: hsl(227deg 96% 77%);
        --color-blue-dark: hsl(234deg 83% 58%);
    }
    
    main {
        position: relative;
        display: grid;
        height: 100%;
        width: 100%;
        grid-template-columns: 250px 1fr;
        font-family: 'Lato', Arial, Helvetica, sans-serif;
        overflow: hidden;
    }
</style>
