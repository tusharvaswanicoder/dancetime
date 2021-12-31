<script>
    import { tick } from 'svelte';
    import { flip } from 'svelte/animate';
    import { fade, fly } from 'svelte/transition';
    import { USER } from './Auth';
    
    let input_value = '';
    let submitted = false;
    let error;
    let display_error = false;

    $: input_value = input_value.trim().replace(' ', '');

    function ClickSubmitButton(e) {
        if (submitted) {
            return;
        }

        input_value = input_value.trim();

        if (input_value.length < 3) {
            return;
        }

        if (!validateUsername(input_value)) {
            return;
        }

        fetch('/api/user/set', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                username: input_value
            }),
        }).then(async (response) => {
            response = await response.json();
            if (response.error) {
                // Handle error
                submitted = false;
                error = response.error;
                display_error = true;

                setTimeout(() => {
                    display_error = false;
                }, 5000);
            } else if (response.user) {
                $USER = {...$USER, ...response.user};
            }
        }).catch((error) => {
            submitted = false;
            error = 'An error occurred.';
            display_error = true;

            setTimeout(() => {
                display_error = false;
            }, 5000);
        })
        
        submitted = true;
    }

    function validateUsername(username) {
        const re =/^[a-z0-9]+$/i;
        return re.test(String(username).toLowerCase());
    }
</script>

<main in:fade out:fade>
    <div class="container">
        <h1 in:fly={{delay: 400, y: -30, duration: 800}}>Dance Time</h1>
        <h2 in:fly={{delay: 1000, y: 30, duration: 800}}>
            Welcome! It looks like this is your first time here, so let's get you set up with a sweet username.
        </h2>
        <input in:fade={{delay: 1600, duration: 600}} placeholder="SuperDancer123" bind:value={input_value} />
        <div
            class={`button ${validateUsername(input_value.trim()) && input_value.trim().length >= 3 ? 'visible' : ''}`}
            on:click={ClickSubmitButton}
            class:disabled={submitted}
        >
            <div class="background" />
            <div class="label">
                {#if !submitted}
                    Let's Go
                {:else}
                    Loading...
                {/if}
            </div>
        </div>
        {#if display_error}
            <div class='error-container' in:fly={{y: -30}} out:fade>
                <div class='error'>{error}</div>
            </div>
        {/if}
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
            var(--color-blue-dark) 0%,
            var(--color-blue-light) 100%
        );
        grid-column: 1 / 3;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }

    div.container {
        position: relative;
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
            var(--color-blue-dark) 0%,
            var(--color-blue-light) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 18px;
        user-select: none;
    }

    div.button.disabled {
        opacity: 0.75;
        cursor: default;
    }

    div.error-container {
        position: absolute;
        width: 100%;
        bottom: 0;
        left: 0;
        display: grid;
        place-items: center;
    }

    div.error {
        background-image: linear-gradient(
            45deg,
            var(--color-red-dark) 0%,
            var(--color-red-light) 100%
        );
        color: white;
        font-weight: 700;
        padding: 30px;
        width: 100%;
        text-align: center;
        font-size: 1.5rem;
        margin: 40px;
        border-radius: 12px;
        user-select: none;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    }
</style>
