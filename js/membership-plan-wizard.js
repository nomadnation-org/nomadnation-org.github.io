function onCitizenshipChanged(sel) {
    // <div id="plan-tourist" class="plan_body"> -> <div id="plan-tourist" class="plan_body recommended">
    let planTourist = document.getElementById("plan-tourist");
    let planResident = document.getElementById("plan-resident");

    var option = sel.options[sel.selectedIndex].value;
    if (option == "eu-citizen-true")
    {
        planTourist.className = "plan_body recommended";
        planResident.className = "plan_body";
    }
    else {
        planTourist.className = "plan_body";
        planResident.className = "plan_body recommended";
    }
}


