<script>
    import BasicComponent from "./BasicComponent.svelte";
    import { createProject } from "../../stores";
    import Drowndown from "../../Dropdown.svelte";
    
    const componentOptions = ['Video In/Out Points', 'Scoring Areas'];
    
    const OnClick = () => {
        
    }
</script>

<BasicComponent {OnClick} title='Add New Component'>
    <div class='content-container'>
        <h2>Select Component</h2>
        <Drowndown options={componentOptions} />
        <button>Add Component</button>
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