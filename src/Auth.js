import { writable } from "svelte/store";

export let USER = writable({})
export function getUserInfo() {
    return new Promise((resolve, reject) => {
        fetch('/api/user/get')
            .then(res => res.json())
            .then(res => {
                if (res) {
                    USER.set({
                        loggedIn: true,
                        email: res.email,
                        username: res.username,
                        user_id: res.user_id
                    });
                }
                resolve();
            }).catch((error) => {
                // console.log(error);
                resolve();
            });
    });
}