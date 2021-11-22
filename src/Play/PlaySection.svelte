<main>
    <nav>
        <div>HOME</div>
        <div>FAVORITES</div>
        <div>SEARCH</div>
    </nav>
    <section class='popular'>
        <h1>Popular</h1>
        <div class='songs-container'></div>
    </section>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        border: 2px dashed red;
    }
    
    nav {
        display: flex;
        justify-content: space-evenly;
        font-size: 1.5rem;
        padding-top: 32px;
    }
    
    section {
        margin-left: 60px;
        margin-right: 60px;
    }
    
    section.popular {
        margin-top: 80px;
    }
    
    section.popular h1 {
        font-size: 2.5rem;
        text-transform: uppercase;
        font-weight: 900;
        background: linear-gradient(45deg, var(--color-pink-dark) 0%, var(--color-pink-light) 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline;
    }
    
    div.songs-container {
        border: 2px dashed darkgoldenrod;
    }
</style>