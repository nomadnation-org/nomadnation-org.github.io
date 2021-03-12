function onInteraction(view) {
    var model = view.ViewModel;
    model.RecommendPlan = MembershipPlansOptions.Tourist;
    if ((model.EUCitizen && (model.BGResidency == BGResidencyOptions.WantsToBecomeBGResident || model.BGResidency == BGResidencyOptions.UnsureIfBGResidencyWanted)) ||
        model.BGResidency == BGResidencyOptions.IsBGResident) {
        /*
            Für EU citizens ist eine BG residency ein no-brainer. Alle Pläne sind möglich.
            Und wer als non-EU citizen doch schon eine BG residency hat, der kann auch alle Pläne nutzen.
         */
        var llcRequired = model.Contractors || model.Employees || model.Inventory || model.LimitedLiability ||
            model.AverageRevenue == AverageRevenueOptions.high;
        var llcSuggested = model.AverageRevenue == AverageRevenueOptions.medium &&
            model.AverageExpenses == AverageExpensesOptions.high;
        if (llcRequired || llcSuggested) {
            /*
                Notwendig ist eine EOOD, wenn ein Business viel Umsatz macht oder Abhängigkeiten aufweist.
                Oder eine EOOD ist naheliegend, wenn die Ausgaben hoch im Verhältnis zu den Einnahmen sind.
             */
            model.RecommendPlan = MembershipPlansOptions.Expat_LLC;
        }
        else {
            /*
                Self-Employment ist eigentlich der Plan, den NN allen empfehlen möchte. Damit bleibt
                ein Solopreneur wirklich unabhängig und es entsteht kein bürokratischer Aufwand.
             */
            if (model.Diploma && (model.AverageExpenses == AverageExpensesOptions.negligible || model.AverageExpenses == AverageExpensesOptions.medium)) {
                model.RecommendPlan = MembershipPlansOptions.Resident;
            }
            else {
                if ((model.AverageRevenue == AverageRevenueOptions.low && model.BGResidency == BGResidencyOptions.WantsToBecomeBGResident) ||
                    model.BGResidency == BGResidencyOptions.UnsureIfBGResidencyWanted) {
                    model.RecommendPlan = MembershipPlansOptions.Tourist;
                }
                else {
                    model.RecommendPlan = MembershipPlansOptions.Expat_Free;
                }
            }
        }
    }
    else {
        /*
            Wer als non-EU citizen ohne BG residency eine BG residency bekommen will,
            der kann das über den Resident Plan versuchen.
            Ansonsten bleibt nur der Tourist für non-EU citizens.
         */
        if (model.BGResidency == BGResidencyOptions.WantsToBecomeBGResident && model.Diploma)
            model.RecommendPlan = MembershipPlansOptions.Resident;
        else
            model.RecommendPlan = MembershipPlansOptions.Tourist;
    }
    view.Update(model);
}
var MembershipPlansOptions;
(function (MembershipPlansOptions) {
    MembershipPlansOptions[MembershipPlansOptions["None"] = 0] = "None";
    MembershipPlansOptions[MembershipPlansOptions["Visitor"] = 1] = "Visitor";
    MembershipPlansOptions[MembershipPlansOptions["Tourist"] = 2] = "Tourist";
    MembershipPlansOptions[MembershipPlansOptions["Resident"] = 3] = "Resident";
    MembershipPlansOptions[MembershipPlansOptions["Expat_Free"] = 4] = "Expat_Free";
    MembershipPlansOptions[MembershipPlansOptions["Expat_LLC"] = 5] = "Expat_LLC";
})(MembershipPlansOptions || (MembershipPlansOptions = {}));
var BGResidencyOptions;
(function (BGResidencyOptions) {
    BGResidencyOptions[BGResidencyOptions["IsBGResident"] = 0] = "IsBGResident";
    BGResidencyOptions[BGResidencyOptions["WantsToBecomeBGResident"] = 1] = "WantsToBecomeBGResident";
    BGResidencyOptions[BGResidencyOptions["UnsureIfBGResidencyWanted"] = 2] = "UnsureIfBGResidencyWanted";
    BGResidencyOptions[BGResidencyOptions["DoesNotWantToBecomeBGResident"] = 3] = "DoesNotWantToBecomeBGResident";
})(BGResidencyOptions || (BGResidencyOptions = {}));
var AverageRevenueOptions;
(function (AverageRevenueOptions) {
    AverageRevenueOptions[AverageRevenueOptions["low"] = 0] = "low";
    AverageRevenueOptions[AverageRevenueOptions["medium"] = 1] = "medium";
    AverageRevenueOptions[AverageRevenueOptions["high"] = 2] = "high";
})(AverageRevenueOptions || (AverageRevenueOptions = {}));
var AverageExpensesOptions;
(function (AverageExpensesOptions) {
    AverageExpensesOptions[AverageExpensesOptions["negligible"] = 0] = "negligible";
    AverageExpensesOptions[AverageExpensesOptions["medium"] = 1] = "medium";
    AverageExpensesOptions[AverageExpensesOptions["high"] = 2] = "high";
})(AverageExpensesOptions || (AverageExpensesOptions = {}));
var Model = /** @class */ (function () {
    function Model() {
        this.EUCitizen = false;
        this.BGResidency = BGResidencyOptions.WantsToBecomeBGResident;
        this.Contractors = false;
        this.Employees = false;
        this.Inventory = false;
        this.LimitedLiability = false;
        this.Diploma = false;
        this.AverageRevenue = AverageRevenueOptions.low;
        this.AverageExpenses = AverageExpensesOptions.negligible;
        this.RecommendPlan = MembershipPlansOptions.None;
    }
    return Model;
}());
var ViewPlan = /** @class */ (function () {
    function ViewPlan(kind) {
        this.kind = kind;
        this.preview = document.getElementById("planpreview-" + kind);
        this.overview = document.getElementById("plan-" + kind);
    }
    Object.defineProperty(ViewPlan.prototype, "Recommend", {
        set: function (value) {
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
        this.plans = [];
        this.plans[MembershipPlansOptions.None] = new ViewPlan("none");
        this.plans[MembershipPlansOptions.Visitor] = new ViewPlan("visitor");
        this.plans[MembershipPlansOptions.Tourist] = new ViewPlan("tourist");
        this.plans[MembershipPlansOptions.Resident] = new ViewPlan("resident");
        this.plans[MembershipPlansOptions.Expat_Free] = new ViewPlan("expat-free");
        this.plans[MembershipPlansOptions.Expat_LLC] = new ViewPlan("expat-llc");
        this.Update(initialRecommendedPlan);
    }
    ViewPlans.prototype.Update = function (recommendedPlan) {
        var _this = this;
        [
            MembershipPlansOptions.None,
            MembershipPlansOptions.Visitor,
            MembershipPlansOptions.Tourist,
            MembershipPlansOptions.Resident,
            MembershipPlansOptions.Expat_Free,
            MembershipPlansOptions.Expat_LLC
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
        this.BG_RESIDENCY_OPTIONS = ["bg-have", "bg-yes", "bg-maybe", "bg-no"];
        this.AVERAGE_REVENUE_OPTIONS = ["revenue-low", "revenue-medium", "revenue-high"];
        this.AVERAGE_EXPENSES_OPTIONS = ["expense-negligible", "expense-medium", "expenses-high"];
        this.rb_EUCitizen_yes = document.getElementById("yes");
        this.rb_EUCitizen_yes.onclick = function () { return _this.OnChanged(_this); };
        this.rb_EUCitizen_no = document.getElementById("no");
        this.rb_EUCitizen_no.onclick = function () { return _this.OnChanged(_this); };
        this.sb_BGResidency = document.getElementById("residency");
        this.sb_BGResidency.onchange = function () { return _this.OnChanged(_this); };
        this.cb_contractors = document.getElementById("contractors");
        this.cb_contractors.onclick = function () { return _this.OnChanged(_this); };
        this.cb_employees = document.getElementById("employees");
        this.cb_employees.onclick = function () { return _this.OnChanged(_this); };
        this.cb_inventory = document.getElementById("inventory");
        this.cb_inventory.onclick = function () { return _this.OnChanged(_this); };
        this.cb_limitedLiability = document.getElementById("liability");
        this.cb_limitedLiability.onclick = function () { return _this.OnChanged(_this); };
        this.cb_diploma = document.getElementById("diploma");
        this.cb_diploma.onclick = function () { return _this.OnChanged(_this); };
        this.sb_AverageRevenue = document.getElementById("revenue-2");
        this.sb_AverageRevenue.onchange = function () { return _this.OnChanged(_this); };
        this.sb_AverageExpenses = document.getElementById("expenses-2");
        this.sb_AverageExpenses.onchange = function () { return _this.OnChanged(_this); };
        this.plans = new ViewPlans(MembershipPlansOptions.None);
    }
    Object.defineProperty(View.prototype, "ViewModel", {
        get: function () {
            var vm = new Model();
            vm.EUCitizen = this.rb_EUCitizen_yes.checked;
            vm.BGResidency = this.BGResidency;
            vm.Contractors = this.cb_contractors.checked;
            vm.Employees = this.cb_employees.checked;
            vm.Inventory = this.cb_inventory.checked;
            vm.LimitedLiability = this.cb_limitedLiability.checked;
            vm.Diploma = this.cb_diploma.checked;
            vm.AverageRevenue = this.AverageRevenue;
            vm.AverageExpenses = this.AverageExpenses;
            return vm;
        },
        enumerable: false,
        configurable: true
    });
    View.prototype.Update = function (vm) {
        this.rb_EUCitizen_yes.checked = vm.EUCitizen;
        this.rb_EUCitizen_no.checked = !this.rb_EUCitizen_yes.checked;
        this.BGResidency = vm.BGResidency;
        this.cb_contractors.checked = vm.Contractors;
        this.cb_employees.checked = vm.Employees;
        this.cb_inventory.checked = vm.Inventory;
        this.cb_limitedLiability.checked = vm.LimitedLiability;
        this.cb_diploma.checked = vm.Diploma;
        this.AverageRevenue = vm.AverageRevenue;
        this.AverageExpenses = vm.AverageExpenses;
        this.plans.Update(vm.RecommendPlan);
    };
    Object.defineProperty(View.prototype, "BGResidency", {
        get: function () {
            switch (this.sb_BGResidency.value) {
                case this.BG_RESIDENCY_OPTIONS[0]: return BGResidencyOptions.IsBGResident;
                case this.BG_RESIDENCY_OPTIONS[1]: return BGResidencyOptions.WantsToBecomeBGResident;
                case this.BG_RESIDENCY_OPTIONS[2]: return BGResidencyOptions.UnsureIfBGResidencyWanted;
                case this.BG_RESIDENCY_OPTIONS[3]: return BGResidencyOptions.DoesNotWantToBecomeBGResident;
                default: return BGResidencyOptions.WantsToBecomeBGResident;
            }
        },
        set: function (value) {
            this.sb_BGResidency.value = this.BG_RESIDENCY_OPTIONS[value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(View.prototype, "AverageRevenue", {
        get: function () {
            switch (this.sb_AverageRevenue.value) {
                case this.AVERAGE_REVENUE_OPTIONS[0]: return AverageRevenueOptions.low;
                case this.AVERAGE_REVENUE_OPTIONS[1]: return AverageRevenueOptions.medium;
                case this.AVERAGE_REVENUE_OPTIONS[2]: return AverageRevenueOptions.high;
                default: return AverageRevenueOptions.low;
            }
        },
        set: function (value) {
            this.sb_AverageRevenue.value = this.AVERAGE_REVENUE_OPTIONS[value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(View.prototype, "AverageExpenses", {
        get: function () {
            switch (this.sb_AverageExpenses.value) {
                case this.AVERAGE_EXPENSES_OPTIONS[0]: return AverageExpensesOptions.negligible;
                case this.AVERAGE_EXPENSES_OPTIONS[1]: return AverageExpensesOptions.medium;
                case this.AVERAGE_EXPENSES_OPTIONS[2]: return AverageExpensesOptions.high;
                default: return AverageExpensesOptions.negligible;
            }
        },
        set: function (value) {
            this.sb_AverageExpenses.value = this.AVERAGE_EXPENSES_OPTIONS[value];
        },
        enumerable: false,
        configurable: true
    });
    return View;
}());
var _view = new View();
_view.OnChanged = onInteraction;
// _view.Update(new Model()); // Bei allen Input-Elementen einen Initialwert setzen
