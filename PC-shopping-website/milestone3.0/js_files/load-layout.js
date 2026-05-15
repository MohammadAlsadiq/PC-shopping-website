async function loadComponent(placeholderId, filePath){
    const placeholder = document.getElementById(placeholderId);

    if(!placeholder){
        return;
    }

    try{
        const response = await fetch(filePath);

        if(!response.ok){
            throw new Error(`Failed to load ${filePath}`);
        }

        const html = await response.text();
        placeholder.innerHTML = html;
    }
    catch(error){
        console.error(error);
    }
}

async function loadNavbar(){
    await loadComponent("navbar-placeholder", "components/navbar.html");

    const profileIcon = document.getElementById("profile");
    const profileDropdown = document.getElementById("profileDropdown");

    if(profileIcon && profileDropdown){
        await import("./js-navbar_files/profile-icon.js");
    }
}

async function loadFooter(){
    await loadComponent("footer-placeholder", "components/footer.html");
}

async function loadLayout(){
    await loadNavbar();
    await loadFooter();
}

loadLayout();