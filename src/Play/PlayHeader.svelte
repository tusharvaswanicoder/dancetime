<script>
    import Icon from "../Icon.svelte";
</script>

<main>
    <div class='left-container'>
        <div class='title'>
            DanceTime
        </div>
        <div class='beta-tag'>
            Beta
        </div>
    </div>
    
    <div class='middle-container'>
        <input type='text' placeholder="Search" />
    </div>
    
    <div class='right-container'>
        <div class='create-button'>
            <Icon name={'nav_create_icon'} />
            <span class='text'>Create</span>
        </div>
    </div>
</main>

<style lang="scss">
    @mixin lhCrop($line-height) {
        &::before {
            content: '';
            display: block;
            height: 0;
            width: 0;
            margin-top: calc((1 - #{$line-height}) * 0.5em);
        }
    }
    
    main {
        grid-area: header;
        background-color: white;
        border-bottom: 1px solid #CDCDCD;
        display: grid;
        grid-template-columns: min-content 1fr min-content;
    }
    
    div.left-container {
        padding: 20px;
        padding-bottom: 0;
        padding-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    div.left-container div.title {
        font-weight: 800;
        background: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 36px;
        user-select: none;
    }
    
    div.left-container div.beta-tag {
        text-transform: uppercase;
        font-size: 12px;
        user-select: none;
        background: linear-gradient(
            45deg,
            var(--color-blue-dark) 0%,
            var(--color-blue-light) 100%
        );
        border-radius: 6px;
        padding: 3px;
        padding-left: 6px;
        padding-right: 6px;
        color: white;
        font-weight: bold;
        margin-top: -7px;
    }
    
    div.middle-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        padding-bottom: 0;
        padding-top: 0;
    }
    
    div.middle-container input {
        color: rgb(41, 41, 41);
        background-color: #EBEBEB;
        border-radius: 12px;
        padding: 12px;
        padding-left: 16px;
        padding-right: 16px;
        border: none;
        outline: none;
        font-weight: 600;
        font-size: 22px;
        width: 100%;
        max-width: 50vw;
    }
    
    div.right-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        padding-bottom: 0;
        padding-top: 0;
    }
    
    div.right-container div.create-button {
        background: linear-gradient(
            45deg,
            var(--color-yellow-dark) 0%,
            var(--color-yellow-light) 100%
        );
        color: white;
        font-weight: 900;
        border-radius: 10px;
        text-transform: uppercase;
        padding: 10px;
        font-size: 24px;
        display: grid;
        grid-template-columns: min-content min-content;
        gap: 10px;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        user-select: none;
        transition: 0.2s ease-in-out transform;
    }
    
    div.right-container div.create-button:hover {
        transform: scale(1.05)
    }
    
    div.right-container div.create-button span.text {
        @include lhCrop(1.1);
    }
</style>