<script>
    import RangeSlider from "svelte-range-slider-pips";
    import '../TFJS';
    
    let keypointScoreThreshold = [0.3];
</script>

<main>
    <section>
        <h1>Analyze Video</h1>
        <div class="aa-grid">
            <h2>Keypoint Score Threshold: {keypointScoreThreshold[0].toString().padEnd(4, '0')}</h2>
            <div class="slider-container">
                <RangeSlider bind:values={keypointScoreThreshold} springValues={{ stiffness: 1, damping: 1 }} min={0.1} max={0.9} step={0.05} float />
            </div>
            <div class='button'>Start Automatic Analysis</div>
            <div class='aa-details'>
                <h3 class='percent-complete'>12% Complete</h3>
                <h3 class='frames-analyzed'>500/3204 Frames Analyzed</h3>
            </div>
        </div>
    </section>

    <section>
        <h1>Analysis Summary</h1>
    </section>

    <section>
        <h1>Playtest</h1>
        <h2>Play your chart to test it out! This is required to publish your chart.</h2>
    </section>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 20px;
        cursor: default;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 1fr);
        gap: 20px;
    }

    h1 {
        color: var(--color-gray-100);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 12px;
    }
    
    h2 {
        color: var(--color-gray-300);
    }
    
    h3 {
        color: var(--color-gray-500);
    }
    
    div.aa-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
    
    div.aa-details {
        margin-left: 1em;
        margin-right: 1em;
    }
    
    div.button {
        color: var(--color-gray-300);
        background-color: var(--color-gray-1000);
        padding: 6px;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 10px;
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
        width: fit-content;
        user-select: none;
        height: fit-content;
    }
    
    div.button:hover {
        color: var(--color-gray-100);
    }
    
    div.button:active {
        background-color: var(--color-gray-800);
    }
    
    div.slider-container {
        --range-slider:          var(--color-gray-500); /* slider main background color */
        --range-handle-inactive: var(--color-gray-300); /* inactive handle color */
        --range-handle:          var(--color-yellow-dark); /* non-focussed handle color */
        --range-handle-focus:    var(--color-yellow-light); /* focussed handle color */
        --range-handle-border:   var(--range-handle);
        --range-range-inactive:  var(--range-handle-inactive); /* inactive range bar background color */
        --range-range:           var(--range-handle-focus); /* active range bar background color */
        --range-float-inactive:  var(--range-handle-inactive); /* inactive floating label background color */
        --range-float:           var(--range-handle-focus); /* floating label background color */
        --range-float-text:      var(--color-gray-1000); /* text color on floating label */
    }
</style>
