document.addEventListener('DOMContentLoaded', function () {
    //--------------------select sections-----------------------
    const memberLink = document.querySelector('.member-link');
    const adminLink = document.querySelector('.admin-link');
    const memberContent = document.querySelector('.member-container');
    const adminContent = document.querySelector('.admin-container');

    adminContent.style.display = 'flex';
    adminLink.classList.add('active');

    memberLink.addEventListener('click', function (event) {
        event.preventDefault();
        adminContent.style.display = 'none';
        memberContent.style.display = 'block';
        adminLink.classList.remove('active');
        memberLink.classList.add('active');
    });

    adminLink.addEventListener('click', function (event) {
        event.preventDefault();
        memberContent.style.display = 'none';
        adminContent.style.display = 'flex';
        memberLink.classList.remove('active');
        adminLink.classList.add('active');
    });

    //-------------------retain information-----------------------------
    let form = document.querySelector(".add-profile form");
    form.querySelectorAll("input, select").forEach(input => {
        if (sessionStorage.getItem(input.name)) {
            input.value = sessionStorage.getItem(input.name);
        }

        input.addEventListener("input", function () {
            sessionStorage.setItem(input.name, this.value);
        });
    });

    //---------------------clear all rows-------------------------
    function clearForm() {
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("name").value = "";
        document.getElementById("gender").selectedIndex = 0;
        document.getElementById("email").value = "";
        document.getElementById("phonenum").value = "";
        sessionStorage.clear();
        window.location.href = window.location.href;
    }

    window.onload = function () {
        if (sessionStorage.getItem("clearForm") === "true") {
            clearForm();
            sessionStorage.removeItem("clearForm");
        }
    };

    //------------------------select row--------------------------
    const rows = document.querySelectorAll('table tr:not(:first-child)');
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const memberDeleteBtn = document.getElementById("member-delete-btn");
    let isEditing = false;
    let selectedRow = null;
    let mselectedRow = null;
    document.querySelectorAll(".admin-container tr").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.classList.contains('no-data')) return;

            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            selectedRow = this;
            this.classList.add('selected');

            editBtn.disabled = false;
            deleteBtn.disabled = false;
        });
    });

    document.querySelectorAll(".member-container tr").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.classList.contains('no-data')) return;
    
            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            mselectedRow = this;
            this.classList.add('selected');
    
            memberDeleteBtn.disabled = false;
        });
    });

    //------------------------------deselect------------------
    document.addEventListener("click", function (event) {
        const table = document.querySelector(".box table");
        const table2 = document.querySelector(".member-box table");
        const tableOption = document.querySelector('.table-option')
        if (!table.contains(event.target) && !tableOption.contains(event.target) && !table2.contains(event.target)) {
            if (isEditing) return;
            if (selectedRow) {
                selectedRow.classList.remove('selected');
                selectedRow = null;
            }
            if (mselectedRow) {
                mselectedRow.classList.remove('selected');
                mselectedRow = null;
            }
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            memberDeleteBtn.disabled = true;
        }
    }, true);

    //-----------------------------edit data-----------------------
    let selectedAdminId = null;

    const discardBtn = document.getElementById("discard-btn");
    const confirmBtn = document.getElementById("confirm-btn");
    const addProfile = document.querySelector(".add-profile");
    const editProfile = document.querySelector(".edit-profile");
    editBtn.addEventListener("click", function () {
        if (!selectedRow) return;
        isEditing = true;
        addProfile.style.display = "none";
        editProfile.style.display = "block";
        editBtn.disabled = true;
        deleteBtn.disabled = true;


        const cells = selectedRow.getElementsByTagName("td");
        document.getElementById("selectedAdminId").value = cells[0].textContent;
        document.getElementById("eusername").value = cells[1].textContent;
        document.getElementById("epassword").value = cells[2].textContent;
        document.getElementById("ename").value = cells[3].textContent;
        document.getElementById("egender").value = cells[4].textContent;
        document.getElementById("eemail").value = cells[5].textContent;
        document.getElementById("ephonenum").value = cells[6].textContent;

    });

    //discard changes button
    discardBtn.addEventListener("click", function () {
        document.querySelector(".add-profile form").reset();
        addProfile.style.display = "block";
        editProfile.style.display = "none";
        isEditing = false;
    });

    confirmBtn.addEventListener("click", function () {
        isEditing = false;
        addProfile.style.display = "block";
        editProfile.style.display = "none";
    });

    //----------------------delete data------------------------
    let id = null;
    let table = null;
    deleteBtn.addEventListener("click", () => {
        if (!selectedRow) return;

        let popUp = document.getElementById("popup");
        popUp.style.display = "flex";
        id = selectedRow.getAttribute("admin-id");
        table = "administrator";
        console.log(`ID: ${id}, Table: ${table}`);
    });

    
    document.getElementById("member-delete-btn").addEventListener("click", () => {
        console.log("Selected row:", mselectedRow);
        if (!mselectedRow) return;
        console.log("Showing member delete popup");
        let popUp = document.getElementById("mpopup");
        
        popUp.style.display = "flex";
        id = mselectedRow.getAttribute("member-id");
        table = "member";
        console.log(`ID: ${id}, Table: ${table}`);
    });

    document.querySelector(".content").addEventListener("click", function (event) {
        if (event.target.classList.contains("confirmDelete")) {
            console.log("confirmDelete button detected");

            if (!id || !table) {
                console.error("Missing data-id or data-table attribute");
                return;
            }

            fetch("delete.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `table=${table}&id=${id}`
            })
                .then(res => res.text())
                .then(() => location.reload()) 
                .catch(console.error);
    
            document.getElementById("popup").style.display = "none";
            document.getElementById("mpopup").style.display = "none";
        }
        if (event.target.classList.contains("cancelDelete")) {
            document.getElementById("mpopup").style.display = "none";
            document.getElementById("popup").style.display = "none";
        }
    });

    //-----------------------------search--------------------------
    document.querySelectorAll(".search-bar").forEach(searchBar => {
        searchBar.addEventListener("keyup", function () {
            const searchValue = this.value.toLowerCase();

            let table = this.closest("div").querySelector("table");
            let rows = table.querySelectorAll("tr:not(:first-child)");
    
            rows.forEach(row => {
                if (row.classList.contains("no-data")) return;
    
                const usernameCell = row.cells[1].textContent.toLowerCase(); 
    
                if (usernameCell.includes(searchValue)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });

});