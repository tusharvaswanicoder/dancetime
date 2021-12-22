import { writable } from "svelte/store";
import { DIFFICULTY, VISIBILITY } from '../constants';
import { v1 } from 'uuid';
import { DB_TABLES, StoreObject, DeleteObjectInDB } from '../ChartAndKeypointDBManager';
import { GetVideoMetadataFromYouTube } from './GetVideoMetadata';

const PROJECTS_LOCALSTORE_NAME = 'projects';GetVideoMetadataFromYouTube

class ProjectManager {
    constructor () {
        this.ensureProjectsInLocalStorage();
        this.projects = JSON.parse(localStorage.getItem(PROJECTS_LOCALSTORE_NAME));
        
        Object.entries(this.projects).forEach(([uuid, project]) => {
            this.projects[uuid] = {...this.getNewProjectMetadata(), ...project}; // Ensure that any new metadata is added
        })
        
        this.projectsStore = writable(this.projects);
    }
    
    /**
     * Ensures that the downloadedMedia object is in localStorage so we can use it
     */
     ensureProjectsInLocalStorage () {
        if (!localStorage.getItem(PROJECTS_LOCALSTORE_NAME)) {
            localStorage.setItem(PROJECTS_LOCALSTORE_NAME, JSON.stringify({}));
        }
    }
    
    /**
     * Updates this.projects in the localStorage and in the projectsStore
     */
     updateProjectsInLocalStorage () {
        // Clear keypoints before updating localStorage
        const projects_to_add = {};
        Object.keys(this.projects).forEach((key) => {
            projects_to_add[key] = JSON.parse(JSON.stringify(this.projects[key]));
            projects_to_add[key].keypoints = {};
        })
        
        localStorage.setItem(PROJECTS_LOCALSTORE_NAME, JSON.stringify(projects_to_add));
        this.projectsStore.set(this.projects);
    }
    
    saveProject(project) {
        project.last_edited = (new Date()).toISOString();
        this.projects[project.uuid] = project;
        this.updateProjectsInLocalStorage();
        
        StoreObject(JSON.stringify(project.keypoints), project.uuid, DB_TABLES.LOCAL_KEYPOINTS, () => {
            
        })
    }
    
    projectExists (uuid) {
        return typeof this.projects[uuid] != 'undefined'; 
    }
    
    createNewProject (name, youtube_link) {
        const metadata = this.getNewProjectMetadata(name, youtube_link);
        this.projects[metadata.uuid] = metadata;
        this.updateProjectsInLocalStorage();
        GetVideoMetadataFromYouTube(youtube_link).then((video_metadata) => {
            metadata.choreography = video_metadata.author;
            metadata.title = video_metadata.title;
            metadata.video_id = video_metadata.video_id;
            metadata.duration = video_metadata.duration;
            metadata.ready = true;
            this.updateProjectsInLocalStorage();
        }).catch((error) => {
            metadata.ready = false;
            metadata.error = true;
            this.updateProjectsInLocalStorage();
        })
    }

    deleteProject (project) {
        if (this.projects[project.uuid]) {
            DeleteObjectInDB(project.uuid, DB_TABLES.LOCAL_KEYPOINTS, () => {
                delete this.projects[project.uuid];
                this.updateProjectsInLocalStorage();
            })
        }
    }
    
    getNewProjectMetadata (name, youtube_link) {
        return {
            project_name: name,
            uuid: this.getNewProjectUUID(),
            title: '',
            song_artist: '',
            choreography: '',
            difficulty: DIFFICULTY.EASY,
            last_edited: (new Date()).toISOString(),
            video_link: youtube_link,
            duration: 0,
            visibility: VISIBILITY.DRAFT,
            version: 1,
            tags: [],
            components: [],
            keypoints: {} // Keypoints are only stored in memory here
        }
    }
    
    getNewProjectUUID () {
        let uuid = v1();
        while (this.projectExists(uuid)) {
            uuid = v1();
        }
        return uuid;
    }
    
    subscribe (f) {
        return this.projectsStore.subscribe(f);
    }
}

const projectManager = new ProjectManager();
export default projectManager;