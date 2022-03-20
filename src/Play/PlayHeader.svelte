<script>
    import Icon from "../Icon.svelte";
    import { modeStateStore, groupmodeStateStore } from '../stores';
    import { MODE_STATE, GROUP_MODES } from '../constants';
    import Dropdown from "../Dropdown.svelte";
    
    const group_modes_titles = Object.values(GROUP_MODES).map((value) => value.title);
    
    const clickCreateButton = () => {
        $modeStateStore = MODE_STATE.CREATE;
    }
    
    let selected_group_mode;
    $: {
        selected_group_mode = GROUP_MODES[$groupmodeStateStore].title;
    }
    
    const onDropdownChanged = (new_val, old_val) => {
        const entry = Object.values(GROUP_MODES).find((value) => value.title == new_val);
        $groupmodeStateStore = entry.state;
    }
</script>

<main>
    <div class='left-container'>
        <div class='title'>
            DanceTime
        </div>
        <div class='tag'>
            Alpha
        </div>
    </div>
    
    <div class='middle-container'>
        <input type='text' placeholder="Search" />
    </div>
    
    <div class='right-container'>
        <div class='dropdown-container' title="Select your dance mode">
            <Dropdown options={group_modes_titles} selectedOption={selected_group_mode} onChanged={onDropdownChanged} />
        </div>
        <div class='create-button' on:click={clickCreateButton}>
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
    
    div.left-container div.tag {
        text-transform: uppercase;
        font-size: 12px;
        user-select: none;
        background: linear-gradient(
            45deg,
            var(--color-green-dark) 0%,
            var(--color-green-light) 100%
        );
        border-radius: 6px;
        padding: 3px;
        padding-left: 6px;
        padding-right: 6px;
        color: white;
        font-weight: bold;
        margin-top: -7px;
        margin-left: 2px;
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
    
    div.right-container div.dropdown-container {
        margin-right: 20px;
        font-weight: bold;
        color: rgb(31, 31, 31);
        --dropdown-bg-color: white;
        --dropdown-border-color: #D6D6D6;
        --dropdown-bg-color-hover: #EBEBEB;
        width: 100px;
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
        transition: 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) transform;
    }
    
    div.right-container div.create-button:hover {
        transform: scale(1.05)
    }
    
    div.right-container div.create-button span.text {
        @include lhCrop(1.1);
        // Hack for fixing the line height so the text isn't vertically off-centered
    }
</style>