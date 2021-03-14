var tooltips = document.getElementsByClassName("help_content");
for (var i = 0; i < tooltips.length; i++) {
    var tooltip = tooltips[i];
    var helpbutton = tooltip.parentElement;
    helpbutton.onmousedown = function () {
        // Alle anderen Tooltips unsichtbar machen
        for (var j = 0; j < tooltips.length; j++)
            if (j != i)
                tooltips[j].className = "help_content";
        // Den gewünschten so schalten, wie er sein soll
        var helpVisible = tooltip.className.indexOf("show") > 0;
        tooltip.className = "help_content" + (helpVisible ? "" : " show");
    };
}
