<script>
    import { onDestroy, onMount } from 'svelte';
    import tfjs from '../tensorflow/TFJS';
    import {
        testIngameScores,
        ingameCamera,
        ingameCameraCanvas,
        groupmodeStateStore,
        TFJSReady,
        playGameMetadata,
        ingameTime,
        ingameRawScores,
        ingameEvalScreenShouldShow,
        ingameJudgementTotals,
        ingameAdjustedScores,
        ingameFinalScores,
        ingameRawJudgements,
        ingameShouldScore,
        ingameNumStars,
        ingameVideoPlayer,
        ingameCurrentJudgement
    } from '../stores';
    import { sleep, GetVideoStartAndEndTimeFromMetadata, GetScoringZoneEnabledAtTime } from '../utils';
    import { AnalyzePose } from './Scoring/Scoring';
    import { DEFAULT_ACCURACY_SCORE_THRESHOLD } from './Scoring/Defaults';
    import { GetNumStarsFromPerfectPercentage } from './Scoring/Stars';
    import {
        GetPerfectPercentage,
        GetTotalFinalScore,
        GetScoringDurationFromInOutScoringAreas
    } from './Scoring/Judgements';
    import { COMPONENT_TYPE, GROUP_STATE, GROUP_MODES_MAX_PLAYERS } from '../constants';
    
    const shouldDisplayDebugScores = false;

    let raf;
    let first_frame_run = false;
    let scoring_areas_component;
    $: {
        scoring_areas_component = $playGameMetadata.components.find((component) => component.type == COMPONENT_TYPE.SCORING_AREAS)
    }

    const onFrame = async () => {
        const time = $ingameTime;
        const poses = await tfjs.detectFrame($ingameCameraCanvas);
        const playing = (await $ingameVideoPlayer.getPlayerState()) == 1;

        // If scoring areas component, check to see if scoring is enabled at this time
        if (scoring_areas_component) {
            const shouldScore = GetScoringZoneEnabledAtTime(time, scoring_areas_component.keyframes);
            // Only update if it changed
            if ($ingameShouldScore != shouldScore) {
                $ingameShouldScore = shouldScore;
            }
        }

        // Iterate through the number of poses per the current group mode
        const max_poses = GROUP_MODES_MAX_PLAYERS[$groupmodeStateStore];
        for (let i = 0; i < max_poses; i++) {
            const pose = poses[i];

            if (playing && $ingameShouldScore) {
                await AnalyzePose(
                    pose,
                    time,
                    $playGameMetadata,
                    $ingameRawScores,
                    $ingameAdjustedScores,
                    $ingameJudgementTotals,
                    $ingameRawJudgements,
                    $ingameCurrentJudgement
                );
            }
        }

        if (!$ingameEvalScreenShouldShow) {
            raf = window.requestAnimationFrame(onFrame);
        } else {
            const startEndTime =
                GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
            const scoringDuration = GetScoringDurationFromInOutScoringAreas(
                $playGameMetadata.duration,
                startEndTime.start,
                startEndTime.end,
                scoring_areas_component
            );

            for (const player_id in Object.keys($ingameJudgementTotals)) {
                $ingameFinalScores[player_id] = GetTotalFinalScore(
                    $ingameJudgementTotals[player_id],
                    scoringDuration
                );
            }
        }

        first_frame_run = true;
    };

    const startTFJS = async () => {
        while (
            !$ingameCamera ||
            $ingameCamera.readyState != 4 ||
            !$ingameCameraCanvas
        ) {
            await sleep(500);
        }

        // Use multipose model if this is not solo mode
        const modelType = $groupmodeStateStore == GROUP_STATE.SOLO ?
            tfjs.modelTypes.SINGLEPOSE_LIGHTNING : 
            tfjs.modelTypes.MULTIPOSE_LIGHTNING;

        await tfjs.initialize(modelType, DEFAULT_ACCURACY_SCORE_THRESHOLD);
        await onFrame();
    };

    $: {
        if (!$TFJSReady && first_frame_run) {
            $TFJSReady = true;
        }
    }

    const UpdateNumStars = (judgementTotals) => {
        if (typeof judgementTotals == 'undefined') {
            return 0;
        }

        const startEndTime =
            GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
        const scoringDuration = GetScoringDurationFromInOutScoringAreas(
            $playGameMetadata.duration,
            startEndTime.start,
            startEndTime.end,
            scoring_areas_component
        );
        return GetNumStarsFromPerfectPercentage(
            GetPerfectPercentage(judgementTotals, scoringDuration)
        );
    };

    // Update stars as judgements change
    $: {
        for (const player_id in Object.keys($ingameJudgementTotals)) {
            $ingameNumStars[player_id] = UpdateNumStars($ingameJudgementTotals[player_id]);
        }
    }

    onMount(() => {
        startTFJS();
    });

    onDestroy(() => {
        if (raf) {
            window.cancelAnimationFrame(raf);
        }
    });
</script>

{#if shouldDisplayDebugScores}
    <h1>{$testIngameScores}</h1>
{/if}

<style>
    h1 {
        color: yellow;
        font-weight: bold;
        font-size: 3rem;
        position: absolute;
        top: 0;
        left: 0;
        margin: 10px;
        z-index: 50;
    }
</style>
