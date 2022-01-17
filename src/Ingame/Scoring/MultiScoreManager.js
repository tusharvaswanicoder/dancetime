// [New id]: original id
let ID_CORRELATION_MAP = {};
export let ORIGINAL_IDS = [];

// Takes a list of ids on a frame and updates seeking queue if any are missing from before
// Call this before GetOriginalIdFromId
export const RecordIdsOnFrame = (pose_ids) => {
    
    // Missing original ids from this frame
    const missing_original_ids = ORIGINAL_IDS.filter((id) => !pose_ids.includes(id));
    
    // New ids this frame that are not original and not correlated yet
    const new_ids = pose_ids.filter((id) => 
        !ORIGINAL_IDS.includes(id) && !Object.keys(ID_CORRELATION_MAP).includes(id));
    
    if (missing_original_ids.length > 0 && new_ids.length > 0) {
        // If we have both missing original ids and new ids, correlate them
        for (let i = 0; i < new_ids.length; i++) {
            const new_id = new_ids[i];
            const original_id = typeof missing_original_ids[i] == 'undefined' ? missing_original_ids[0] : missing_original_ids[i];
            ID_CORRELATION_MAP[new_id] = original_id;
            console.log(`CORRELATE id ${new_id} to ${original_id}`);
        }
    }
}

export const GetOriginalIdFromId = (pose_id, max_poses) => {
    const correlation_id = ID_CORRELATION_MAP[pose_id];
    const original_ids_length = ORIGINAL_IDS.length;
    const is_original_id = ORIGINAL_IDS.includes(pose_id);
    
    // TODO: add support for more than 2 players at once
    if (correlation_id) {
        // Correlation ID exists, so use that
        return correlation_id;
    } else if (is_original_id) {
        return pose_id;
    } else if (original_ids_length < max_poses && !is_original_id) {
        // Less than 2 players have been detected over the lifetime of gameplay, so add this ID as a new original id
        ORIGINAL_IDS.push(pose_id);
        return pose_id;
    }
    
    console.warn(`Failed to get original ID from id ${pose_id}`);
    return pose_id;
}

export const ResetMultiScores = () => {
    ID_CORRELATION_MAP = {};
    ORIGINAL_IDS = [];
    id_seeking_queue = [];
}