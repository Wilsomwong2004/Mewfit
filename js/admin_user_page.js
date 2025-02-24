document.addEventListener('DOMContentLoaded', function() {
    const memberLink = document.querySelector('.member-link');
    const adminLink = document.querySelector('.admin-link');
    const memberContent = document.querySelector('.member-container');
    const adminContent = document.querySelector('.admin-container');

    // Show member content by default
    adminContent.style.display = 'flex';
    adminLink.classList.add('active'); 

    memberLink.addEventListener('click', function(event) {
        event.preventDefault();
        adminContent.style.display = 'none';
        memberContent.style.display = 'block';
        adminLink.classList.remove('active');
        memberLink.classList.add('active');
    });

    adminLink.addEventListener('click', function(event) {
        event.preventDefault();
        memberContent.style.display = 'none';
        adminContent.style.display = 'flex';
        memberLink.classList.remove('active');
        adminLink.classList.add('active');
    });
});