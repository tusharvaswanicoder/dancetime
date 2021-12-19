<script>
	import { onMount } from 'svelte';
    import browser from 'webextension-polyfill';

    let image =
        'https://images.unsplash.com/photo-1586074299757-dc655f18518c?fit=crop&w=1268&q=80';

    function change() {
        browser.storage.local.set({ background: image });
    }
	
    function onError(error) {
        console.error(`Error: ${error}`);
    }

    function sendMessageToTabs(tabs) {
        for (let tab of tabs) {
            browser.tabs
                .sendMessage(tab.id, { greeting: 'Hi from background script' })
                .then((response) => {
                    console.log('Message from the content script:');
                    console.log(response.response);
                })
                .catch(onError);
        }
    }
    function sendMessage() {
        browser.tabs
            .query({
                currentWindow: true,
                active: true,
            })
            .then(sendMessageToTabs)
            .catch(onError);
    }
	
	onMount(() => {
		console.log('ONMOUNT')
		browser.runtime.onMessage.addListener((request) => {
			console.log(request);
			return Promise.resolve({ response: 'Hi from EXTENSION' });
		});
	})
</script>

<main>
    DanceTime extension is ready! <br /><br />You can analyze YouTube videos on
    dancetime.io now.
    <br /><br />
    <button on:click={sendMessage}>Send Message</button>
</main>
