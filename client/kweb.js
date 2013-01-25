// This library requires you to use a specifically laid out html file
// to allow you to load and display different pages within one html
// document. its really quite trivial. Maybe someday I'll put in some
// documentation here.
// Author: Karshan Sharma <sharma34@illinois.edu>
// Last Modified: Sun May 13 15:32:51 CDT 2012
(function(window, $, undefined) {
  // array of functions to be called on a page load.
  // key: page name
  pageLoaders = [];
  var kweb = {
    onPageLoad :
      function(pageName, handler) {
        // TODO: input argument validation
        pageLoaders[pageName] = handler;
      },
    showPage :
      function(pageName, args) {
        $('.page').hide();
        if (typeof pageLoaders[pageName] === "function")
          pageLoaders[pageName](kweb.getPage(pageName), args);
        $('.page').filter('#' + pageName).show();
      },
    getPage :
      function(pageName) {
        return $('.page').filter('#' + pageName);
      }
  };
  window.kweb = kweb;
})(window, jQuery);