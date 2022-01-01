<script>
    import BasicComponent from './BasicComponent.svelte';
    import { createProject, createProjectUnsaved, createVideoPlayer, createEditorDisabled, createVideoCurrentTime, createSelectedComponent, createSelectedComponentIndex } from '../../stores';
    import DeleteRow from './DeleteRow.svelte';
    import Dropdown from '../../Dropdown.svelte';
    import KeyframeControls from './KeyframeControls.svelte';
    import {
        COMPONENT_TYPE,
        COMPONENT_DATA
    } from '../../constants';
    import { GetRoundedTimeFromTime, GetScoringZoneEnabledAtTime, GetScoringZoneEnabledNextKeyframe, GetScoringZoneEnabledPrevKeyframe, CreateNavToTime } from '../../utils';

    const type = COMPONENT_TYPE.SCORING_AREAS;
    let componentSelected = false;
    export let component = {};
    export let componentIndex;

    const options = ['Yes', 'No']
    let selectedOption = options[0];

    const addNewKeyframeForCurrentTime = () => {
        const currentTime = GetRoundedTimeFromTime($createVideoCurrentTime);
        component.keyframes[currentTime] = selectedOption == 'Yes';
        component = component;
        $createProjectUnsaved = true;
    }
    
    const onDropdownChanged = (new_val, old_val) => {
        selectedOption = new_val;
        addNewKeyframeForCurrentTime();
    };

    const onClickNewKeyframe = () => {
        // Click keyframe to remove an existing one, otherwise add a new keyframe
        const currentTime = GetRoundedTimeFromTime($createVideoCurrentTime);
        if (typeof component.keyframes[currentTime] != 'undefined') {
            delete component.keyframes[currentTime];
            component = component;
            $createProjectUnsaved = true;
            return
        }

        addNewKeyframeForCurrentTime();
    }

    const onClickNextKeyframe = () => {
        const next_keyframe_time = GetScoringZoneEnabledNextKeyframe($createVideoCurrentTime, component.keyframes, true);
        if (next_keyframe_time) {
            CreateNavToTime(parseFloat(next_keyframe_time), $createVideoPlayer, $createEditorDisabled);
        }
    }

    const onClickPrevKeyframe = () => {
        const prev_keyframe_time = GetScoringZoneEnabledPrevKeyframe($createVideoCurrentTime, component.keyframes, true);
        if (prev_keyframe_time) {
            CreateNavToTime(parseFloat(prev_keyframe_time), $createVideoPlayer, $createEditorDisabled);
        }
    }

    // Update selected option as current time moves to reflect current scoring state
    $: {
        selectedOption = GetScoringZoneEnabledAtTime($createVideoCurrentTime, component.keyframes) ? 
            'Yes' : 'No';
    }
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
        <KeyframeControls {onClickPrevKeyframe} {onClickNewKeyframe} {onClickNextKeyframe} />
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
