/*
Model: Zustand aller Select Boxes und der Pläne.

Update: Aktualisiert das Model gem. aktueller Msg.
Die Msg ist die ID der Event-Quelle.

Event Handling: Stellt das Model zusammen (collect) und stellt es dar (project).
Mit dem Model wird die Domäne aufgerufen.
Für alle Select Boxes gibt es nur einen Event Handler.

Beim project werden alle Pläne auf "plan_body" gesetzt und nur einer auch noch auf "recommended".
*/
function onCitizenshipChanged(sel:HTMLSelectElement) {
    // <div id="plan-tourist" class="plan_body"> -> <div id="plan-tourist" class="plan_body recommended">
    let planTourist = document.getElementById("plan-tourist");
    let planResident = document.getElementById("plan-resident");

    let option = sel.options[sel.selectedIndex].value;
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

var selectBox = document.getElementById("citizenship") as HTMLSelectElement;
selectBox.addEventListener("change", function() { onCitizenshipChanged(selectBox); });