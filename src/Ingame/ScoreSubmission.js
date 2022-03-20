export const SubmitScores = (chart_id, score, judgement_totals) => {
    
    fetch(`/api/play/submit/${chart_id}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        //make sure to serialize your JSON body
        body: JSON.stringify({
            j: JSON.stringify(judgement_totals),
            score: score
        }),
    })
    .catch((error) => {
        console.log(error);
        resolve();
    });
}