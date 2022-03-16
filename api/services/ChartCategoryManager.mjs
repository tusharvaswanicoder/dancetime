import azMySQLManager from './AzMySQLManager.mjs';

class ChartCategoryManager {
    constructor () {
        // Case insentisive functions
        this.category_charts_func_map = 
        {
            ['newest']: this.getChartsInCategoryNewest
        }
    }

    /**
     * Returns metadata for charts within a certain category, such as Popular or Newest.
     * Metadata does not include keypoints.
     * @param {*} category 
     */
    async getChartsInCategory (category) {
        if (this.category_charts_func_map[category]) {
            return await this.category_charts_func_map[category]();
        }
    }

    /**
     * Returns a list of chart metadata for the newest published charts.
     */
    async getChartsInCategoryNewest () {
        return await azMySQLManager.pool.query('SELECT chart_id, title, song_artist, choreography, difficulty, last_edited, video_link, video_id, duration, visibility, version, tags, components, user_id FROM charts ORDER BY last_edited DESC LIMIT 50');
    }

    async userRequestChartsInCategory (context, req) {
        return new Promise(async (resolve, reject) => {
            if (!req.params.category) {
                context.status(400).end();
                return resolve();
            }

            const charts = await this.getChartsInCategory(req.params.category);

            if (charts) {
                for (const chart of charts) {
                    chart.tags = azMySQLManager.compressedStringToJSON(chart.tags);
                    chart.components = azMySQLManager.compressedStringToJSON(chart.components);
                }

                context.send({charts});
            } else {
                context.send({charts: []});
            }
            
            resolve();
        })
    }
}

const chartCategoryManager = new ChartCategoryManager();
export default chartCategoryManager;