document.getElementById('resetLocalStorage').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = "index.html";
});

document.getElementById('exportPosts').addEventListener('click', function() {
    exportPosts();
});

document.getElementById('importPostsBtn').addEventListener('click', function() {
    document.getElementById('importPostsFile').click();
});

document.getElementById('importPostsFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const posts = JSON.parse(e.target.result);
            importPosts(posts);
        };
        reader.readAsText(file);
    }
});

document.addEventListener("DOMContentLoaded", async function() {
    // Initialize SQL.js
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/${file}`
    });

    // Load the database from localStorage
    function loadDB() {
        const buffer = localStorage.getItem('database');
        if (buffer) {
            const data = new Uint8Array(JSON.parse(buffer));
            return new SQL.Database(data);
        } else {
            const db = new SQL.Database();
            db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, timestamp TEXT)");
            return db;
        }
    }

    // Save the database to localStorage
    function saveDB(db) {
        const data = db.export();
        const buffer = Array.from(new Uint8Array(data));
        localStorage.setItem('database', JSON.stringify(buffer));
    }

    // Initialize or load the database
    const db = loadDB();

    // Function to fetch posts and display them
    function displayPosts() {
        const res = db.exec("SELECT * FROM posts ORDER BY id DESC");
        const posts = res[0] ? res[0].values : [];

        const postsContainer = document.getElementById("posts");
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";
            postDiv.innerHTML = `<h2>${post[1]}</h2><p>${post[2].substring(0, 140)}...</p><small>${post[3]}</small>`;
            postDiv.onclick = function() {
                window.location.href = `post.html?id=${post[0]}`;
            };
            postsContainer.appendChild(postDiv);
        });
    }

    // Function to export posts
    function exportPosts() {
        const res = db.exec("SELECT * FROM posts ORDER BY id DESC");
        const posts = res[0] ? res[0].values : [];

        const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'posts.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function to import posts
    function importPosts(posts) {
        db.run("DELETE FROM posts"); // Clear existing posts
        posts.forEach(post => {
            db.run("INSERT INTO posts (id, title, content, timestamp) VALUES (?, ?, ?, ?)", post);
        });

        // Save the database to localStorage
        saveDB(db);

        // Display the imported posts
        displayPosts();
		
		closeBtn.onclick();
    }

    // Initial display of posts
    displayPosts();

    // Save the database to localStorage
    saveDB(db);

    // Make functions and database available globally
    window.saveDB = saveDB;
    window.db = db;
    window.displayPosts = displayPosts;
    window.exportPosts = exportPosts;
    window.importPosts = importPosts;

    // Burger menu functionality
    const burgerMenu = document.getElementById('burgerMenu');
    const navDrawer = document.getElementById('navDrawer');
    const closeBtn = document.getElementById('closeBtn');

    burgerMenu.onclick = function() {
        navDrawer.style.width = '250px';
    }

    closeBtn.onclick = function() {
        navDrawer.style.width = '0';
    }

    // Close the nav drawer if the user clicks outside of it
    window.onclick = function(event) {
        if (event.target === navDrawer) {
            navDrawer.style.width = '0';
        }
    }
});