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
            return new SQL.Database();
        }
    }

    // Initialize or load the database
    const db = loadDB();

    // Function to get query parameters
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const query = {};
        for (const [key, value] of params.entries()) {
            query[key] = value;
        }
        return query;
    }

    // Function to convert URLs to clickable links
    function linkify(text) {
        const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlPattern, function(url) {
            let hyperlink = url;
            if (!hyperlink.match(/^https?:\/\//i)) {
                hyperlink = 'http://' + hyperlink;
            }
            return `<a href="${hyperlink}" target="_blank">${url}</a>`;
        });
    }

    // Get the post ID from the query parameters
    const queryParams = getQueryParams();
    const postId = queryParams.id;

    // Fetch the post from the database
    const res = db.exec(`SELECT * FROM posts WHERE id = ${postId}`);
    const post = res[0] ? res[0].values[0] : null;

    // Display the post
    const postContainer = document.getElementById("post");
    if (post) {
        const postTitle = post[1];
        const postContent = linkify(post[2]); // Linkify the post content
        const postDate = post[3];
        postContainer.innerHTML = `<h2>${postTitle}</h2><p>${postContent}</p><small>${postDate}</small>`;
    } else {
        postContainer.innerHTML = `<p>Post not found.</p>`;
    }
});