<script>
    import { flip } from 'svelte/animate';
    
    let input_value = '';
    let submitted = false;

    function ClickSubmitButton(e) {
        input_value = input_value.trim();

        if (input_value.trim().length < 4) {
            return;
        }

        if (!validateEmail(input_value)) {
            return;
        }

        fetch('/register', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                email: input_value
            }),
        }).then((response) => {
            // Nothing
        });
        
        input_value = '';
        submitted = true;
    }

    function validateEmail(email) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
</script>

<main>
    <div class="container">
        <h1>Dance Time</h1>
        <h2>
            {#if !submitted}
                Got an invitation? Enter your email below and we'll send you a magic
                link to login.
            {:else}
                Thanks! You should receive an email from us momentarily if you were invited.
            {/if}
        </h2>
        <input class:hidden={submitted} placeholder="bob@example.com" bind:value={input_value} />
        <div
            class={`button ${validateEmail(input_value.trim()) ? 'visible' : ''}`}
            on:click={ClickSubmitButton}
        >
            <div class="background" />
            <div class="label">Submit</div>
        </div>
    </div>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background-image: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        grid-column: 1 / 3;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }

    div.container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 400px; /* TODO: make this only dependent on the h1 width */
    }

    h1 {
        font-size: 60px;
        font-weight: 900;
        text-transform: uppercase;
        text-align: center;
        cursor: default;
    }

    h2 {
        margin-top: 40px;
        font-size: 18px;
        font-style: italic;
        text-align: center;
        cursor: default;
    }

    input {
        margin-top: 60px;
        background-color: transparent;
        color: var(--color-gray-100);
        padding: 8px;
        font-size: 18px;
        /* font-family: 'Lato', Arial, Helvetica, sans-serif; */
        border: none;
        margin-left: 10px;
        margin-right: 10px;
        outline: none;
        border-bottom: 2px solid rgba(255, 255, 255, 0.5);
        transition: 0.2s ease-in-out border;
    }
    
    input.hidden {
        user-select: none;
        cursor: default;
        opacity: 0;
    }

    input:focus {
        border-bottom: 2px solid rgba(255, 255, 255, 1);
    }

    div.button {
        position: relative;
        opacity: 0;
        background-color: white;
        border-radius: 40px;
        padding: 12px;
        text-align: center;
        cursor: default;
        margin-top: 40px;
        width: 75%;
        align-self: center;
        transition: 0.2s ease-in-out opacity;
    }

    div.button.visible {
        opacity: 1;
        cursor: pointer;
    }

    div.button div.label {
        display: inline-block;
        background: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 18px;
        user-select: none;
    }
</style>
