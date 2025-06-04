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

    // Load the database
    const db = loadDB();

    document.getElementById("postForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const timestamp = new Date().toLocaleString();

        // Insert the new post into the database with timestamp
        db.run("INSERT INTO posts (title, content, timestamp) VALUES (?, ?, ?)", [title, content, timestamp]);

        // Save the database to localStorage
        saveDB(db);

        // Redirect to home page
        window.location.href = "index.html";
    });

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