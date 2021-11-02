import { writable } from "svelte/store";

export let USER = writable({})
export function getUserInfo() {
    fetch('/getMyInfo')
        .then(res => res.json())
        .then(res => {
            if (res) {
                USER.set({
                    loggedIn: true,
                    email: res.email
                });
            }
        }).catch((error) => {
            // console.log(error);
        });
}