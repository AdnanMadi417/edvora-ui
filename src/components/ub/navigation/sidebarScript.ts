// Hook-free so the root (server) layout can import it. See sidebarState.ts.
export const SIDEBAR_STORAGE_KEY = "ub-sidebar";

/** Inline, blocking script for <head>: applies a collapsed desktop sidebar before first paint. */
export const SIDEBAR_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("${SIDEBAR_STORAGE_KEY}")==="collapsed")document.documentElement.setAttribute("data-ub-sidebar","collapsed")}catch(e){}})();`;
