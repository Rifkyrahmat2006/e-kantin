<style>
    /* Hide the logout form/button in the user menu */
    .fi-user-menu form[action*="logout"],
    .fi-user-menu button[type="submit"] {
        display: none !important;
    }
    
    /* Just in case there are other logout buttons */
    form[action$="/logout"] {
        display: none !important;
    }
</style>
