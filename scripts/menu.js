const chapters = [
    { title: "Chapter 1", link: "chapters/chapter1.html" },
    { title: "Chapter 2", link: "chapters/chapter2.html" },
    { title: "Chapter 3", link: "chapters/chapter3.html" }
];

function createMenu() {
    const menu = document.createElement('ul');
    menu.classList.add('menu');

    chapters.forEach(chapter => {
        const menuItem = document.createElement('li');
        const menuLink = document.createElement('a');
        menuLink.href = chapter.link;
        menuLink.textContent = chapter.title;
        menuItem.appendChild(menuLink);
        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);
}

document.addEventListener('DOMContentLoaded', createMenu);