document.addEventListener('DOMContentLoaded', function() {
  // Active nav link highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(function(link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Hamburger menu toggle
  var hamburger = document.querySelector('.hamburger');
  var navUl = document.querySelector('nav ul');
  var nav = document.querySelector('nav');

  if (hamburger && navUl) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navUl.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('nav a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navUl.classList.remove('active');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target)) {
        hamburger.classList.remove('active');
        navUl.classList.remove('active');
      }
    });
  }
});
