const isProd = window.location.hostname !== "localhost";
export const DEV = isProd
    ? {}
    : {
          initialLevel: 1,
          startInWinScene: false,
          skipTitle: false,
          showPaths: false,
          loseDisabled: false,
          winDisabled: false,
      };
