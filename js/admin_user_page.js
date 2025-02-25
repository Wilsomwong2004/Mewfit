document.addEventListener('DOMContentLoaded', function() {
    //select sections
    const memberLink = document.querySelector('.member-link');
    const adminLink = document.querySelector('.admin-link');
    const memberContent = document.querySelector('.member-container');
    const adminContent = document.querySelector('.admin-container');

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

    //select row
    const rows = document.querySelectorAll('table tr:not(:first-child)'); 
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    
    let selectedRow = null;
    rows.forEach(row => {
        row.addEventListener('click', function(event) {

            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            selectedRow = this;
            this.classList.add('selected');

            editBtn.disabled = false;
            deleteBtn.disabled = false;
        });
    });

    //deselect
    document.addEventListener("click", function (event) {
        const table = document.querySelector(".box table"); 
        const tableOption = document.querySelector('.table-option')
        if (!table.contains(event.target) && !tableOption.contains(event.target)) {
            if (selectedRow) {
                selectedRow.classList.remove('selected'); 
                selectedRow = null; 
            }
            editBtn.disabled = true;
            deleteBtn.disabled = true;
        }
    }, true);

    // Edit Button Functionality
    editBtn.addEventListener("click", function () {
        if (!selectedRow) return;
        const discardBtn = document.querySelector(".discard-btn");
        
        const cells = selectedRow.getElementsByTagName("td");
        document.getElementById("username").value = cells[1].textContent;
        document.getElementById("password").value = cells[2].textContent;
        document.getElementById("name").value = cells[3].textContent;
        document.getElementById("gender").value = cells[4].textContent;
        document.getElementById("email").value = cells[5].textContent;
        document.getElementById("phonenum").value = cells[6].textContent;
        document.getElementById("id").value = selectedRow.getAttribute("member-id");

        document.querySelector(".add-profile-btn").innerText = "Update Changes";
        discardBtn.style.display = "block";
    });

    //discard changes button
    document.querySelector(".discard-btn").addEventListener("click", function () {
        document.querySelector(".add-profile form").reset();
        document.getElementById("id").value = ""; // Reset hidden ID field if exists
        document.querySelector(".add-profile-btn").innerText = "Create New"; // Reset button text
    });

    // Delete Button Functionality
    let id = null;
    let table = null;
    deleteBtn.addEventListener("click", () => {
        if (!selectedRow) return;
    
        document.getElementById("popup").style.display = "flex"; 
        id = selectedRow.getAttribute("admin-id"); 
        table = "administrator"; 
    });

    document.getElementById("confirmDelete").addEventListener("click", () =>  {
        if (!id || !table) return; 
    
        fetch("delete.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `table=${table}&id=${id}`
        })
        .then(res => res.text())
        .then(() => location.reload())
        .catch(console.error);

        document.getElementById("popup").style.display = "none";
    });

    document.getElementById("cancelDelete").addEventListener("click", () => {
        document.getElementById("popup").style.display = "none"; 
    });

});