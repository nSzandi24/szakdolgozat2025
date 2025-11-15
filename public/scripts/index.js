document.getElementById("login").addEventListener("click", async () => {
    const username = prompt("Felhasználónév:");
    const password = prompt("Jelszó:");
    const res = await fetch("/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    alert(data.message);
});

document.getElementById("register").addEventListener("click", () => {
    window.location.href = "regist.html";
});
