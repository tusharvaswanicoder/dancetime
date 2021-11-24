<script>
    import LandingContent from "./LandingContent.svelte"
    import NotLoggedInLanding from "./NotLoggedInLanding.svelte";
    import { onMount } from "svelte";
    import { GAMESTATE } from "./constants";
    import { keyPress, keyDown, settingsOpen, gameState } from "./stores";
    
    import {getUserInfo, USER} from "./Auth"
    
    const handleKeyPress = (e) => {
        keyPress.set(e);
    }
    
    const handleKeyDown = (e) => {
        keyDown.set(e);
    }
    
    let loaded = false;
    
    // Try to load user info before displaying anything
    onMount(() => {
        getUserInfo().then(() => {
            loaded = true;
        });
    })
    
</script>

<svelte:window on:keypress={handleKeyPress} on:keydown={handleKeyDown}/>

{#if loaded}
    <main>
        <!-- TODO: reorganize these components into another one -->
        {#if $USER.loggedIn}
            <LandingContent />
        {:else}
            <NotLoggedInLanding />
        {/if}
    </main>
{/if}

<style>
    :root {
        /* Color themes */
        --gray: 220deg;
        --color-gray-100: hsl(var(--gray) 20% 95%);
        --color-gray-200: hsl(var(--gray) 15% 85%);
        --color-gray-300: hsl(var(--gray) 10% 75%);
        --color-gray-500: hsl(var(--gray) 5% 50%);
        --color-gray-650: hsl(var(--gray) 8% 35%);
        --color-gray-700: hsl(var(--gray) 10% 30%);
        --color-gray-800: hsl(var(--gray) 12% 22%);
        --color-gray-850: hsl(var(--gray) 13% 17%);
        --color-gray-900: hsl(var(--gray) 15% 15%);
        --color-gray-1000: hsl(var(--gray) 20% 10%);

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
        
        --color-pink-light: hsla(306deg, 89%, 78%, 1); 
        --color-pink-dark: hsla(0deg, 87%, 66%, 1); 
        --color-yellow-light: hsla(43deg, 98%, 60%, 1);
        --color-yellow-dark: hsla(35deg, 100%, 50%, 1);
        --color-blue-light: hsl(227, 96%, 77%, 1);
        --color-blue-dark: hsl(234, 83%, 58%, 1);
        --color-red-light: hsl(0, 67%, 62%);
        --color-red-dark: hsl(22, 78%, 45%);
        --color-green-light: hsla(108, 92%, 73%);
        --color-green-dark: hsla(108, 56%, 53%);
    }
    
    main {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>
