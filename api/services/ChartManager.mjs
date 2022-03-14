import azMySQLManager from './AzMySQLManager.mjs';

class ChartManager {
    constructor () {
        
    }

    /**
     * Returns metadata about a chart with id
     * @param {*} chart_id 
     */
    getChartMetadata (chart_id) {

    }

    /**
     * Tries to get the keypoints object of a published chart, if it exists.
     * @param {*} chart_id 
     */
    async getChartKeypoints (context, req) {
        const chart_id = req.params.chart_id;

        if (!chart_id) {
            return context.status(400).end();
        }

        try {
            const keypoints = await azMySQLManager.tryGetPublishedChartKeypoints(chart_id);
            context.send({keypoints})
        } catch (error) {
            console.error(error);
            context.send({
                error: 'An error occurred while downloading keypoints.'
            })
        }
    }
    
    /**
     * Called to publish a chart. Can be used for charts that have been published before
     * or those that have never been published.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async publishChart (context, req) {
        return new Promise(async (resolve, reject) => {
            const user = context.user;
            const chart = req.body.chart;

            // TODO: put in string length limits for fields
            if (!this.verifyValidChart(chart)) {
                context.send({error: 'Chart validation failed.'});
                return resolve();
            }

            try {
                const publish_result = await azMySQLManager.publishChart(chart, user);
                context.send({
                    chart: publish_result
                })
            } catch (error) {
                context.send({
                    error: 'An error occurred.'
                })
            } finally {
                resolve();
            }
        })
    }

    /**
     * Verifies that a chart object contains all required information for publishing.
     * @param {*} chart Chart object from user.
     */
    verifyValidChart (chart) {
        if (!chart ||
            !chart.title ||
            !chart.song_artist ||
            !chart.choreography ||
            !chart.difficulty ||
            !chart.video_link ||
            !chart.video_id ||
            !chart.duration ||
            !chart.visibility ||
            !chart.tags ||
            !chart.components ||
            !chart.keypoints)
        {
            return false;
        }

        // TODO: more validity checks on various fields

        return true;
    }
}

const chartManager = new ChartManager();
export default chartManager;