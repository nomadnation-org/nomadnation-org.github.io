var MembershipPlans;
(function (MembershipPlans) {
    MembershipPlans[MembershipPlans["None"] = 0] = "None";
    MembershipPlans[MembershipPlans["Visitor"] = 1] = "Visitor";
    MembershipPlans[MembershipPlans["Tourist"] = 2] = "Tourist";
    MembershipPlans[MembershipPlans["Resident"] = 3] = "Resident";
    MembershipPlans[MembershipPlans["Expat_Free"] = 4] = "Expat_Free";
    MembershipPlans[MembershipPlans["Expat_LLC"] = 5] = "Expat_LLC";
})(MembershipPlans || (MembershipPlans = {}));
var Model = /** @class */ (function () {
    function Model() {
        this.EUCitizen = false;
        this.RecommendPlan = MembershipPlans.None;
    }
    return Model;
}());
var ViewPlan = /** @class */ (function () {
    function ViewPlan(kind) {
        this.kind = kind;
        this.preview = document.getElementById("planpreview-" + kind);
        this.overview = document.getElementById("plan-" + kind);
        console.log("viewplan ctor: " + kind + "/" + this.preview + "/" + this.overview);
    }
    Object.defineProperty(ViewPlan.prototype, "Recommend", {
        set: function (value) {
            console.log("viewplan recommend: " + this.kind + "=" + value);
            if (this.preview != null)
                this.preview.className = "planpreview_body" + (value ? " show" : "");
            if (this.overview != null)
                this.overview.className = "plan_body" + (value ? " recommended" : "");
        },
        enumerable: false,
        configurable: true
    });
    return ViewPlan;
}());
var ViewPlans = /** @class */ (function () {
    function ViewPlans(initialRecommendedPlan) {
        this.plans = new Array();
        this.plans[MembershipPlans.None] = new ViewPlan("none");
        this.plans[MembershipPlans.Visitor] = new ViewPlan("visitor");
        this.plans[MembershipPlans.Tourist] = new ViewPlan("tourist");
        this.plans[MembershipPlans.Resident] = new ViewPlan("resident");
        this.plans[MembershipPlans.Expat_Free] = new ViewPlan("expat-free");
        this.plans[MembershipPlans.Expat_LLC] = new ViewPlan("expat-llc");
        this.Update(initialRecommendedPlan);
    }
    ViewPlans.prototype.Update = function (recommendedPlan) {
        var _this = this;
        [
            MembershipPlans.None,
            MembershipPlans.Visitor,
            MembershipPlans.Tourist,
            MembershipPlans.Resident,
            MembershipPlans.Expat_Free,
            MembershipPlans.Expat_LLC
        ].forEach(function (plan) {
            _this.plans[plan].Recommend = false;
        });
        this.plans[recommendedPlan].Recommend = true;
    };
    return ViewPlans;
}());
var View = /** @class */ (function () {
    function View() {
        var _this = this;
        this.eu_citizen_yes = document.getElementById("yes");
        this.eu_citizen_yes.onclick = function () { return _this.OnChanged(_this); };
        this.eu_citizen_no = document.getElementById("no");
        this.eu_citizen_no.onclick = function () { return _this.OnChanged(_this); };
        this.plans = new ViewPlans(MembershipPlans.None);
    }
    Object.defineProperty(View.prototype, "ViewModel", {
        get: function () {
            var vm = new Model();
            vm.EUCitizen = this.eu_citizen_yes.checked;
            return vm;
        },
        enumerable: false,
        configurable: true
    });
    View.prototype.Update = function (vm) {
        this.eu_citizen_yes.checked = vm.EUCitizen;
        this.eu_citizen_no.checked = !this.eu_citizen_yes.checked;
        this.plans.Update(vm.RecommendPlan);
    };
    return View;
}());
function onInteraction(view) {
    var model = view.ViewModel;
    model.RecommendPlan = model.EUCitizen ? MembershipPlans.Expat_Free : MembershipPlans.Resident;
    view.Update(model);
}
var _view = new View();
_view.OnChanged = onInteraction;
