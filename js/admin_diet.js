document.addEventListener('DOMContentLoaded', function () {
    //--------------------select sections-----------------------
    const nutritionLink = document.querySelector('.nutrition-link');
    const dietLink = document.querySelector('.diet-link');
    const nutritionContent = document.querySelector('.nutrition-container');
    const dietContent = document.querySelector('.diet-container');

    dietContent.style.display = 'flex';
    dietLink.classList.add('active');

    nutritionLink.addEventListener('click', function (event) {
        event.preventDefault();
        dietContent.style.display = 'none';
        nutritionContent.style.display = 'flex';
        dietLink.classList.remove('active');
        nutritionLink.classList.add('active');
    });

    dietLink.addEventListener('click', function (event) {
        event.preventDefault();
        nutritionContent.style.display = 'none';
        dietContent.style.display = 'flex';
        nutritionLink.classList.remove('active');
        dietLink.classList.add('active');
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
        document.querySelector('form').reset();
        sessionStorage.clear();
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
    const nutriDeleteBtn = document.getElementById("nutrition-delete-btn");
    const nutriEditBtn = document.getElementById("nutrition-edit-btn");
    let isEditing = false;
    let selectedRow = null;
    let mselectedRow = null;
    document.querySelectorAll(".diet-container tr").forEach(row => {
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

    document.querySelectorAll(".nutrition-container tr").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.classList.contains('no-data')) return;
    
            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            mselectedRow = this;
            this.classList.add('selected');
    
            nutriDeleteBtn.disabled = false;
            nutriEditBtn.disabled = false;
        });
    });

    //------------------------------deselect------------------
    document.addEventListener("click", function (event) {
        const table = document.querySelector(".box table");
        const table2 = document.querySelector(".nutri-box table");
        const tableOption = document.querySelectorAll('.table-option')
        if (table.contains(event.target) && tableOption.contains(event.target) && table2.contains(event.target)) {
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
            nutriDeleteBtn.disabled = true;
            nutriEditBtn.disabled = true;
        }
    }, true);

    //-----------------------------edit data-----------------------
    const addProfile = document.getElementById("dadd-profile");
    const editProfile = document.getElementById("dedit-profile");
    const naddProfile = document.getElementById("nadd-profile");
    const neditProfile = document.getElementById("nedit-profile");
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

    nutriEditBtn.addEventListener("click", function () {
        if (!mselectedRow) return;
        isEditing = true;
        document.getElementById("nutrition-name").value = "";
        document.getElementById("calories").value = "";
        document.getElementById("fat").value = "";
        document.getElementById("protein").value = "";
        document.getElementById("carb").value = "";
        naddProfile.style.display = "none";
        neditProfile.style.display = "block";
        nutriEditBtn.disabled = true;
        nutriDeleteBtn.disabled = true;
        
        const cells = mselectedRow.getElementsByTagName("td");
        document.getElementById("selectedNutriId").value = cells[0].textContent;
        document.getElementById("enutrition-name").value = cells[1].textContent;
        document.getElementById("ecalories").value = cells[2].textContent;
        document.getElementById("efat").value = cells[3].textContent;
        document.getElementById("eprotein").value = cells[4].textContent;
        document.getElementById("ecarb").value = cells[5].textContent;

    });

    //discard changes button
    document.getElementById("discard-btn").addEventListener("click", () => {
        addProfile.style.display = "block";
        editProfile.style.display = "none";
        isEditing = false;
    });

    document.getElementById("ndiscard-btn").addEventListener("click", () => {
        naddProfile.style.display = "block";
        neditProfile.style.display = "none";
        isEditing = false;
    });

    document.getElementById("confirm-btn").addEventListener("click", () => {
        isEditing = false;
        addProfile.style.display = "block";
        editProfile.style.display = "none";
    });

    document.getElementById("nconfirm-btn").addEventListener("click", () => {
        isEditing = false;
        naddProfile.style.display = "block";
        neditProfile.style.display = "none";
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

    
    document.getElementById("nutrition-delete-btn").addEventListener("click", () => {
        console.log("Selected row:", mselectedRow);
        if (!mselectedRow) return;
        let popUp = document.getElementById("mpopup");
        
        popUp.style.display = "flex";
        id = mselectedRow.getAttribute("nutrition-id");
        table = "nutrition";
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