<script>
    import BasicComponent from './BasicComponent.svelte';
    import { createProject, createProjectUnsaved, createSelectedComponent, createSelectedComponentIndex } from '../../stores';
    import DeleteRow from './DeleteRow.svelte';
    import Dropdown from '../../Dropdown.svelte';
    import KeyframeControls from './KeyframeControls.svelte';
    import {
        COMPONENT_TYPE,
        COMPONENT_DATA
    } from '../../constants';

    const type = COMPONENT_TYPE.SCORING_AREAS;
    let componentSelected = false;
    export let component = {};
    export let componentIndex;

    const options = ['Yes', 'No']
    let selectedOption = options[0];
    
    const onDropdownChanged = (new_val, old_val) => {
        selectedOption = new_val;
        $createProjectUnsaved = true;
    };
</script>

<BasicComponent selected={componentSelected} {component} {componentIndex} title={COMPONENT_DATA[type].name}>
    <div class="content-container">
        <h2>Scoring Enabled</h2>
        <div>
            <Dropdown
                onChanged={onDropdownChanged}
                {selectedOption}
                {options}
            />
        </div>
        <KeyframeControls />
    </div>
    <DeleteRow {componentIndex} />
</BasicComponent>

<style>
    div.content-container {
        display: grid;
        grid-template-columns: max-content 80px 1fr;
        grid-auto-rows: 1fr;
        gap: 8px 30px;
        margin-top: 10px;
        justify-content: start;
        align-items: center;
        color: var(--color-gray-300);
    }
    
    div.content-container > div {
        color: var(--color-gray-100);
    }
</style>
