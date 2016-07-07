(function () {
  var BrowserWindow = window.require('electron').remote.BrowserWindow;

  function init() {
    document.getElementById("minimize").addEventListener("click", function (e) {
      var window = BrowserWindow.getFocusedWindow();
      window.minimize();
    });

    document.getElementById("fullscreen").addEventListener("click", function (e) {
      var window = BrowserWindow.getFocusedWindow();
      window.maximize();
    });

    document.getElementById("close").addEventListener("click", function (e) {
      var window = BrowserWindow.getFocusedWindow();
      window.close();
    });
  };

  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init();
    }
  };
})();
