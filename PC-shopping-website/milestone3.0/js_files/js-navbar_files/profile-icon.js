const profileIcon = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");

const profileMenus = {
    guest: [
        { text: "Sign Up", href: "#" },
        { text: "Log In", href: "#" }
    ],

    user: [
        { text: "Profile", href: "#" },
        { text: "Log Out", action: "logout" }
    ],

    admin: [
        { text: "Orders", href: "#" },
        { text: "Dashboard", href: "#" }
    ]
};

function getProfileMenuType(){
    const sessionData = localStorage.getItem("chipshipSession");

    if(sessionData === null){
        return "guest";
    }

    try{
        const session = JSON.parse(sessionData);

        if(session.isLoggedIn !== true){
            return "guest";
        }

        if(session.role === "admin"){
            return "admin";
        }

        return "user";
    }
    catch(error){
        return "guest";
    }
}

function renderProfileDropdown(){
    const menuType = getProfileMenuType();
    const menuItems = profileMenus[menuType];

    profileDropdown.innerHTML = "";

    menuItems.forEach(function(item){
        if(item.action === "logout"){
            const button = document.createElement("button");
            button.textContent = item.text;

            button.addEventListener("click", function(){
                logOutUser();
            });

            profileDropdown.appendChild(button);
        }
        else{
            const link = document.createElement("a");
            link.textContent = item.text;
            link.href = item.href;

            profileDropdown.appendChild(link);
        }
    });
}

function openProfileDropdown(){
    profileDropdown.classList.add("show");
    profileIcon.setAttribute("aria-expanded", "true");
}

function closeProfileDropdown(){
    profileDropdown.classList.remove("show");
    profileIcon.setAttribute("aria-expanded", "false");
}

function toggleProfileDropdown(){
    if(profileDropdown.classList.contains("show")){
        closeProfileDropdown();
    }
    else{
        renderProfileDropdown();
        openProfileDropdown();
    }
}

function logOutUser(){
    localStorage.removeItem("chipshipSession");
    renderProfileDropdown();
    closeProfileDropdown();
}

profileIcon.addEventListener("click", function(event){
    event.stopPropagation();
    toggleProfileDropdown();
});

profileIcon.addEventListener("keydown", function(event){
    if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        toggleProfileDropdown();
    }
});

document.addEventListener("click", function(event){
    if(!profileDropdown.contains(event.target) && event.target !== profileIcon){
        closeProfileDropdown();
    }
});

document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
        closeProfileDropdown();
    }
});

renderProfileDropdown();