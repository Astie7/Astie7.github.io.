(() => {
    const hostname = window.location.hostname || "";
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isFile = window.location.protocol === "file:";
    const localRedirect = "http://localhost:3000/rules/";
    const productionRedirect = "https://astie7.github.io/Pantheverse/rules/";

    window.PV_SUPABASE = window.PV_SUPABASE || {
        url: "https://hdchgfqusjwloxuzaebv.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY2hnZnF1c2p3bG94dXphZWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTA3MjMsImV4cCI6MjA4NTk4NjcyM30.XofJWA76O8aeV7UqY7G2HGtdjdzB1i6YpKFRqkGcHcU",
        authRedirectTo: (isLocal || isFile) ? localRedirect : productionRedirect
    };
})();
