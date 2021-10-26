<script>
    import ProjectCard from './ProjectCard.svelte';
</script>

<main>
    <section class="title-section">
        <h1>Create</h1>
        <h2>Create your own dance charts from YouTube videos.</h2>
    </section>
    <section class="projects-section">
        <h1>Projects</h1>
        <div class="projects-container">
            <!-- <ProjectCard data={{
                title: "Create New Project",
                new_project: true
            }} /> -->
            <div class="test">a</div>
            <div class="test">a</div>
            <div class="test">a</div>
            <div class="test">a</div>
        </div>
    </section>
</main>

<style>
    main {
        position: relative;
        display: grid;
        grid-template-rows: min-content auto;
        height: 100%;
        --card-height: 350px;
    }

    div.test {
        background-color: orange;
        border: 2px solid green;
        border-radius: 20px;
        height: var(--card-height);
    }

    section.title-section {
        padding-top: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 40px;
    }

    section.title-section h1 {
        font-size: 3rem;
        font-weight: 700;
        text-transform: uppercase;
        background: linear-gradient(
            45deg,
            var(--color-yellow-dark) 0%,
            var(--color-yellow-light) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline;
    }

    section.title-section h2 {
        margin-top: 20px;
        color: white;
    }

    section.projects-section {
        display: flex;
        flex-direction: column;
        min-height: 0;
        max-height: 100%;
        margin-left: 40px;
        margin-right: 40px;
    }

    section.projects-section h1 {
        font-size: 1.25rem;
        color: var(--color-gray-300);
        text-transform: uppercase;
        padding-top: 20px;
        padding-bottom: 10px;
    }

    div.projects-container {
        display: grid;
        justify-content: center;
        overflow: auto;
        gap: 30px;
        grid-template-columns: repeat(
            auto-fill,
            minmax(var(--card-height), 1fr)
        );
        /* padding-right: 20px; */ /* Looks better with padding and scrollbar, but ugly with padding and no scrollbar */
        padding-bottom: 20px;
        padding-top: 10px;
    }
    
</style>
