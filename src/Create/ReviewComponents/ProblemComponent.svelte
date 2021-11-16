<script>
    import BasicComponent from "./BasicComponent.svelte";
    import { SEVERITY } from "../AnalysisSummary";
    export let problem = {};
    
    const borderColors = {
        [SEVERITY.NONE]: 'var(--color-green-dark)',
        [SEVERITY.LOW]: 'var(--color-blue-light)',
        [SEVERITY.MEDIUM]: 'var(--color-yellow-light)',
        [SEVERITY.HIGH]: 'var(--color-red-light)'
    }
</script>

<BasicComponent title={problem.title} borderColor={borderColors[problem.severity]}>
    <div class='content-container' style={`--sev-color: ${borderColors[problem.severity]}`}>
        <h2 class='message'>{problem.message}</h2>
        <div class='hr' />
        {#if problem.severity != SEVERITY.NONE}
            <div class='split'>
                <h2>Severity</h2>
                <h2 class={`sev ${problem.severity}`}>{problem.severity}</h2>
                <h2>Impact</h2>
                <h2>{problem.impact}</h2>
                <h2>Fix</h2>
                <h2>{problem.resolution}</h2>
            </div>
        {:else}
            <div class='split'>
                <h2>Severity</h2>
                <h2 class={`sev ${problem.severity}`}>{problem.severity}</h2>
            </div>
        {/if}
    </div>
</BasicComponent>

<style>
    div.content-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    div.split {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 10px;
    }
    
    h2 {
        color: var(--color-gray-200);
    }
    
    h2.message {
        margin-top: 10px;
    }
    
    .sev {
        font-weight: 700;
        color: var(--sev-color);
    }
    
    div.hr {
        width: 100%;
        height: 1px;
        align-self: center;
        background-color: var(--color-gray-300);
        grid-column: 1 / 3;
    }
    
</style>