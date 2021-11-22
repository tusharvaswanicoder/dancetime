export const NAV_IDS = {
    PLAY: 1,
    CREATE: 2,
    DOWNLOADS: 3
}

export const GAMESTATE = {
    NOT_INGAME: 1,
    INGAME: 2
}

export const INGAME_STATE = {
    LOADING: 1,
    SETTINGS: 2,
}

export const VISIBILITY = {
    DRAFT: "Draft",
    UNLISTED: "Unlisted",
    PUBLIC: "Public"
}

export const DIFFICULTY = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
    EXPERT: "Expert"
}

export const THUMBNAIL_INTERVAL = 10;
export const MAX_PROJECT_TAGS = 5;

export const COMPONENT_TYPE = {
    METADATA: 1,
    ADD_NEW: 2,
    VIDEO_IN_OUT_POINTS: 3,
    SCORING_AREAS: 4,
    BLOCKED_AREA: 5
}

export const COMPONENT_DATA = {
    [COMPONENT_TYPE.METADATA]:              {name: 'Project Info', limit: 1},
    [COMPONENT_TYPE.ADD_NEW]:               {name: 'Add New Component', limit: 1},
    [COMPONENT_TYPE.VIDEO_IN_OUT_POINTS]:   {name: 'Video In/Out Points', limit: 1, get_default_data: (project) => {
        return {
            in: 0,
            out: project.length
        }
    }},
    [COMPONENT_TYPE.SCORING_AREAS]:         {name: 'Scoring Areas', limit: 1, get_default_data: (project) => {
        return {keyframes: []} // List of keyframes: {time: 0, enabled: true}
    }},
    [COMPONENT_TYPE.BLOCKED_AREA]:          {name: 'Blocked Area', limit: 10, get_default_data: (project) => {
        return {
            enabled_keyframes: [], // List of keyframes: {time: 0, enabled: true}
            shape_keyframes: []    // List of keyframes: {time: 0, points: []}
        }
    }}
}

export function GetComponentTypeFromName (component_name) {
    for (const [type, value] of Object.entries(COMPONENT_DATA)) {
        if (value.name == component_name) {
            return type;
        }
    }
}


export function GetDefaultComponentData (project, component_type) {
    if (!COMPONENT_DATA[component_type].get_default_data) {
        throw new Error('Component does not have default data');
    }
    
    const default_data = COMPONENT_DATA[component_type].get_default_data(project);
    default_data.type = component_type;
    return default_data;
} 