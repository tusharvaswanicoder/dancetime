import azMySQLManager from './AzMySQLManager.js';

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
     * Called to publish a chart. Can be used for charts that have been published before
     * or those that have never been published.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async publishChart (req, res) {
        const user = req.user;
        const chart = req.body.chart;

        // TODO: put in string length limits for fields
        if (!this.verifyValidChart(chart)) {
            return res.send({error: 'Chart validation failed.'});
        }

        try {
            const publish_result = await azMySQLManager.publishChart(chart, user);
            res.send({
                chart: publish_result
            })
        } catch (error) {
            res.send({
                error: 'An error occurred.'
            })
        }
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