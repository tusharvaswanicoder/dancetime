<script>
    import BasicComponent from "./BasicComponent.svelte";
    import DeleteRow from './DeleteRow.svelte';
    import { createProject, createProjectUnsaved, createVideoCurrentTime, createSelectedComponent } from "../../stores";
    import { ConvertDurationToNiceStringWithDecimal } from "../../utils";
    import { COMPONENT_TYPE, COMPONENT_DATA } from "../../constants";
    import ClickableTimestampText from '../ClickableTimestampText.svelte';
    
    const type = COMPONENT_TYPE.PREVIEW_AREA;
    export let component = {};
    export let componentIndex;
    const max_preview_time = 10;
    
    const setIn = () => {
        if ($createVideoCurrentTime < component.out) {
            component.in = $createVideoCurrentTime;
            component.out = Math.min(component.out, component.in + max_preview_time);
        } else {
            component.in = $createVideoCurrentTime;
            component.out = component.in + max_preview_time;
        }
        metadataChanged();
    }
    
    const setOut = () => {
        if ($createVideoCurrentTime > component.in) {
            component.out = Math.min(component.in + max_preview_time, $createVideoCurrentTime);
            metadataChanged();
        }
    }
    
    const metadataChanged = () => {
        $createProjectUnsaved = true;
        $createSelectedComponent = $createSelectedComponent;
        $createProject.components = $createProject.components;
        $createProject = $createProject;
    }
</script>

<BasicComponent {component} {componentIndex} title={COMPONENT_DATA[type].name}>
    <div class='content-container'>
        <h2>Preview Start</h2>
        <div class='button' on:click={setIn}>Set Start</div>
        <h3><ClickableTimestampText>{ConvertDurationToNiceStringWithDecimal(component.in)}</ClickableTimestampText></h3>
        <h2>Preview End</h2>
        <div class='button' on:click={setOut}>Set End</div>
        <h3><ClickableTimestampText>{ConvertDurationToNiceStringWithDecimal(component.out)}</ClickableTimestampText></h3>
    </div>
    <DeleteRow {componentIndex} />
</BasicComponent>

<style>
    div.content-container {
        display: grid;
        grid-template-columns: max-content max-content 1fr;
        gap: 8px 30px;
        margin-top: 10px;
        justify-content: start;
        align-items: center;
    }
    
    h2 {
        color: var(--color-gray-300);
    }
    
    h3 {
        color: var(--color-gray-100);
    }
    
    div.button {
        color: var(--color-gray-500);
        background-color: var(--color-gray-900);
        padding: 6px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
    }
    
    div.button:hover {
        color: var(--color-gray-300);
    }
    
    div.button:active {
        background-color: var(--color-gray-800);
    }
    
</style>