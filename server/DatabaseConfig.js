export const default_tables = [
    {
        // All users that have logged in at least once with the magic link and set their username
        name: 'users',
        structure: `(user_id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        username VARCHAR(20) UNIQUE, 
                        email VARCHAR(60) UNIQUE)`
    },
    {
        // List of emails that have been invited to play.
        // An email must be in this table to get a magic link to login.
        name: 'invited_emails',
        structure: `(email VARCHAR(60) PRIMARY KEY)`
    },
    {
        // Table of all publicly available charts, whether they are Public or Unlisted visibility.
        // Every time a chart is published from the editor, it is added or updated here.
        // There is no difference between the structure of this table and the projects table.
        // Charts in this table are ONLY updated when the author (user_id) hits publish again from the
        // editor to publish a new version.
        // last_edited refers to the last publish time, aka last updated.
        name: 'charts',
        structure: `(chart_id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        title VARCHAR(60), 
                        song_artist VARCHAR(60), 
                        choreography VARCHAR(60), 
                        difficulty VARCHAR(20), 
                        last_edited DATETIME,
                        video_link VARCHAR(200), 
                        video_id VARCHAR(20), 
                        duration DECIMAL(10, 2), 
                        visibility VARCHAR(20), 
                        version INTEGER, 
                        tags BLOB, 
                        components BLOB, 
                        keypoints MEDIUMBLOB, 
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(user_id))`
    },
    {
        // Table of all projects (charts) that users are working on.
        // These may or may not be available to play in the Play screen.
        name: 'projects',
        structure: `(project_id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        title VARCHAR(60), 
                        chart_id INTEGER,
                        FOREIGN KEY (chart_id) REFERENCES charts(chart_id),
                        song_artist VARCHAR(60), 
                        choreography VARCHAR(60), 
                        difficulty VARCHAR(20), 
                        last_edited DATETIME, 
                        video_link VARCHAR(200), 
                        video_id VARCHAR(20), 
                        duration DECIMAL(10, 2), 
                        visibility VARCHAR(20), 
                        version INTEGER, 
                        tags BLOB, 
                        components BLOB, 
                        keypoints MEDIUMBLOB,
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(user_id))`
    },
    {
        // All upvotes with timestamps for each chart.
        // Query all-time to get all upvotes for a specific chart, or query a time range using timestamp
        // to get upvotes in a time period.
        // The value will be a 1 or a -1 depending on if it was an upvote or downvote.
        name: 'chart_upvotes',
        structure: `(timestamp DATETIME, 
                        chart_id INTEGER,
                        FOREIGN KEY (chart_id) REFERENCES charts(chart_id), 
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(user_id), 
                        value TINYINT)`
    },
    {
        // All scores for each chart for each user, similar in format to chart_upvotes with timestamp.
        // Includes version of the chart for record-keeping, and also JSON object of judgements
        name: 'chart_scores',
        structure: `(timestamp DATETIME, 
                        chart_id INTEGER,
                        FOREIGN KEY (chart_id) REFERENCES charts(chart_id), 
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(user_id), 
                        score DECIMAL(10, 6), 
                        judgements JSON, 
                        version INTEGER)`
    },
    {
        // Total viewcount for each chart.
        // Updated realtime when users click on the chart to view it or play it.
        // TODO: potentially add another table with view snapshots each X time interval
        // so it can be determined which charts are "hotter" than others in terms of views
        // in a given time interval
        name: 'chart_views',
        structure: `(chart_id INTEGER,
                        FOREIGN KEY (chart_id) REFERENCES charts(chart_id), 
                        viewcount INTEGER)`
    },
    {
        // All favorited charts for each user
        name: 'chart_favorites',
        structure: `(timestamp DATETIME, 
                        chart_id INTEGER,
                        FOREIGN KEY (chart_id) REFERENCES charts(chart_id), 
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(user_id))`
    },
];