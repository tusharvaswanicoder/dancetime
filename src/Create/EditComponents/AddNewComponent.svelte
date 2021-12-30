<script>
    import BasicComponent from './BasicComponent.svelte';
    import { createProject, createProjectUnsaved } from '../../stores';
    import Dropdown from '../../Dropdown.svelte';
    import {
        COMPONENT_TYPE,
        COMPONENT_DATA,
        GetDefaultComponentData,
        GetComponentTypeFromName,
    } from '../../constants';

    const type = COMPONENT_TYPE.ADD_NEW;
    let componentSelected = false;

    const componentOptions = [
        COMPONENT_DATA[COMPONENT_TYPE.VIDEO_IN_OUT_POINTS].name,
        COMPONENT_DATA[COMPONENT_TYPE.SCORING_AREAS].name,
        COMPONENT_DATA[COMPONENT_TYPE.BLOCKED_AREA].name,
        COMPONENT_DATA[COMPONENT_TYPE.PREVIEW_AREA].name,
    ];

    let selectedOption = componentOptions[0];

    /**
     * Returns list of component names to be disabled based on createProject.components list
     * @param components
     */
    const getDisabledOptions = (components) => {
        const counts = {};

        components.forEach((component) => {
            if (!counts[component.type]) {
                counts[component.type] = 1;
            } else {
                counts[component.type] += 1;
            }
        });

        const disabled = [];
        Object.entries(COMPONENT_DATA).forEach(([type, value]) => {
            if (counts[type] && counts[type] >= value.limit) {
                disabled.push(value.name);
            }
        });

        return disabled;
    };

    const clickAddComponent = () => {
        const disabled = getDisabledOptions($createProject.components);
        if (disabled.includes(selectedOption)) {
            return;
        }

        if (!componentOptions.includes(selectedOption)) {
            return;
        }

        const component_type = GetComponentTypeFromName(selectedOption);
        
        $createProject.components.push(
            GetDefaultComponentData($createProject, component_type)
        );
        
        // Refresh reactive store to update components
        $createProject = $createProject;
        $createProjectUnsaved = true;
    };
    
    $: {
        // Look at disabled options again and change currently selected if it is now disabled
        ensureSelectedOptionIsNotDisabled($createProject.components)
    }
    
    const ensureSelectedOptionIsNotDisabled = (components) => {
        const new_disabled = getDisabledOptions(components);
        if (new_disabled.includes(selectedOption)) {
            const remaining_options = componentOptions.filter((option) => {
                return !new_disabled.includes(option);
            })
            
            if (remaining_options.length > 0) {
                selectedOption = remaining_options[0];
            }
        }
    }

    const onDropdownChanged = (new_val, old_val) => {
        selectedOption = new_val;
    };
</script>

<BasicComponent selected={componentSelected} title={COMPONENT_DATA[type].name}>
    <div class="content-container">
        <h2>Select Component</h2>
        <Dropdown
            onChanged={onDropdownChanged}
            {selectedOption}
            options={componentOptions}
            disabled={getDisabledOptions($createProject.components)}
        />
        <button on:click={clickAddComponent}>Add Component</button>
    </div>
</BasicComponent>

<style>
    div.content-container {
        display: grid;
        grid-template-columns: max-content 1fr;
        grid-auto-rows: 1fr;
        gap: 8px 30px;
        margin-top: 10px;
        justify-content: start;
        align-items: center;
    }

    div.content-container h2 {
        color: var(--color-gray-300);
    }

    button {
        color: var(--color-yellow-light);
        margin-top: 10px;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 1.25rem;
        grid-column: 1 / 3;
        justify-self: center;
        cursor: pointer;
        transition: 0.2s ease-in-out color;
        border: none;
        background: none;
    }

    button:hover {
        color: var(--color-yellow-dark);
    }
</style>
