function onInteraction(view:View) {
    let model = view.ViewModel;
    model.RecommendPlan = MembershipPlansOptions.Tourist;

    if ((model.EUCitizen && model.BGResidency == BGResidencyOptions.WantsToBecomeBGResident) ||
        model.BGResidency == BGResidencyOptions.IsBGResident) {
        /*
            Für EU citizens ist eine BG residency ein no-brainer. Alle Pläne sind möglich.
            Und wer als non-EU citizen doch schon eine BG residency hat, der kann auch alle Pläne nutzen.
         */

        let llcRequired = model.Contractors || model.Employees || model.Inventory || model.LimitedLiability ||
                          model.AverageRevenue == AverageRevenueOptions.high;
        let llcSuggested = model.AverageRevenue == AverageRevenueOptions.medium &&
                           model.AverageExpenses == AverageExpensesOptions.high;
        if (llcRequired || llcSuggested) {
            /*
                Notwendig ist eine EOOD, wenn ein Business viel Umsatz macht oder Abhängigkeiten aufweist.
                Oder eine EOOD ist naheliegend, wenn die Ausgaben hoch im Verhältnis zu den Einnahmen sind.
             */
            model.RecommendPlan = MembershipPlansOptions.Expat_LLC;
        }
        else {
            //TODO: die average expenses werden nicht korrekt gesetzt und berücksichtigt


            /*
                Self-Employment ist eigentlich der Plan, den NN allen empfehlen möchte. Damit bleibt
                ein Solopreneur wirklich unabhängig und es entsteht kein bürokratischer Aufwand.
             */
            model.RecommendPlan = MembershipPlansOptions.Expat_Free;
        }
    }
    else {
        /*
            Wer als non-EU citizen ohne BG residency eine BG residency bekommen will,
            der kann das über den Resident Plan versuchen.
            Ansonsten bleibt nur der Tourist für non-EU citizens.
         */
        if (model.BGResidency == BGResidencyOptions.WantsToBecomeBGResident)
            model.RecommendPlan = MembershipPlansOptions.Resident;
        else
            model.RecommendPlan = MembershipPlansOptions.Tourist;
    }

    view.Update(model);
}



enum MembershipPlansOptions {
    None,
    Visitor,
    Tourist,
    Resident,
    Expat_Free,
    Expat_LLC
}

enum BGResidencyOptions {
    IsBGResident,
    WantsToBecomeBGResident,
    UnsureIfBGResidencyWanted,
    DoesNotWantToBecomeBGResident
}

enum AverageRevenueOptions {
    low,
    medium,
    high
}

enum AverageExpensesOptions {
    negligible,
    medium,
    high
}


class Model {
    public EUCitizen:boolean = false;
    public BGResidency:BGResidencyOptions = BGResidencyOptions.WantsToBecomeBGResident;

    public Contractors:boolean = false;
    public Employees:boolean = false;
    public Inventory:boolean = false;
    public LimitedLiability:boolean = false;

    public AverageRevenue:AverageRevenueOptions = AverageRevenueOptions.low;
    public AverageExpenses:AverageExpensesOptions = AverageExpensesOptions.negligible;

    public RecommendPlan:MembershipPlansOptions = MembershipPlansOptions.None;
}


class ViewPlan {
    preview:HTMLElement;
    overview:HTMLElement;

    kind:string;

    constructor(kind:string) {
        this.kind = kind;

        this.preview = document.getElementById("planpreview-" + kind);
        this.overview = document.getElementById("plan-" + kind);

        console.log("viewplan ctor: " + kind + "/" + this.preview + "/" + this.overview);
    }

    public set Recommend(value:boolean) {
        console.log("viewplan recommend: " + this.kind + "=" + value);

        if (this.preview != null) this.preview.className = "planpreview_body" + (value ? " show" : "");
        if (this.overview != null) this.overview.className = "plan_body" + (value ? " recommended" : "");
    }
}


class ViewPlans {
    plans:ViewPlan[];

    constructor(initialRecommendedPlan:MembershipPlansOptions) {
        this.plans = [];
        this.plans[MembershipPlansOptions.None] = new ViewPlan("none");
        this.plans[MembershipPlansOptions.Visitor] = new ViewPlan("visitor");
        this.plans[MembershipPlansOptions.Tourist] = new ViewPlan("tourist");
        this.plans[MembershipPlansOptions.Resident] = new ViewPlan("resident");
        this.plans[MembershipPlansOptions.Expat_Free] = new ViewPlan("expat-free");
        this.plans[MembershipPlansOptions.Expat_LLC] = new ViewPlan("expat-llc");

        this.Update(initialRecommendedPlan);
    }

    public Update(recommendedPlan:MembershipPlansOptions) {
        [
            MembershipPlansOptions.None,
            MembershipPlansOptions.Visitor,
            MembershipPlansOptions.Tourist,
            MembershipPlansOptions.Resident,
            MembershipPlansOptions.Expat_Free,
            MembershipPlansOptions.Expat_LLC
        ].forEach((plan) => {
            this.plans[plan].Recommend = false;
        })

        this.plans[recommendedPlan].Recommend = true;
    }
}


class View {
    rb_EUCitizen_yes:HTMLInputElement;
    rb_EUCitizen_no:HTMLInputElement;

    sb_BGResidency:HTMLSelectElement;
    
    cb_contractors:HTMLInputElement;
    cb_employees:HTMLInputElement;
    cb_inventory:HTMLInputElement;
    cb_limitedLiability:HTMLInputElement;

    sb_AverageRevenue:HTMLSelectElement;
    sb_AverageExpenses:HTMLSelectElement;

    plans:ViewPlans;


    constructor() {
        this.rb_EUCitizen_yes = document.getElementById("yes") as HTMLInputElement;
        this.rb_EUCitizen_yes.onclick = () => this.OnChanged(this);

        this.rb_EUCitizen_no = document.getElementById("no") as HTMLInputElement;
        this.rb_EUCitizen_no.onclick = () => this.OnChanged(this);

        this.sb_BGResidency = document.getElementById("residency") as HTMLSelectElement;
        this.sb_BGResidency.onchange = () => this.OnChanged(this);

        this.cb_contractors = document.getElementById("contractors") as HTMLInputElement;
        this.cb_contractors.onclick = () => this.OnChanged(this);

        this.cb_employees = document.getElementById("employees") as HTMLInputElement;
        this.cb_employees.onclick = () => this.OnChanged(this);

        this.cb_inventory = document.getElementById("inventory") as HTMLInputElement;
        this.cb_inventory.onclick = () => this.OnChanged(this);

        this.cb_limitedLiability = document.getElementById("liability") as HTMLInputElement;
        this.cb_limitedLiability.onclick = () => this.OnChanged(this);

        this.sb_AverageRevenue = document.getElementById("revenue-2") as HTMLSelectElement;
        this.sb_AverageRevenue.onchange = () => this.OnChanged(this);

        this.sb_AverageExpenses = document.getElementById("expenses-2") as HTMLSelectElement;
        this.sb_AverageExpenses.onchange = () => this.OnChanged(this);

        this.plans = new ViewPlans(MembershipPlansOptions.None);
    }


    public get ViewModel() : Model {
        let vm = new Model();

        vm.EUCitizen = this.rb_EUCitizen_yes.checked;
        vm.BGResidency = this.BGResidency;
        vm.Contractors = this.cb_contractors.checked;
        vm.Employees = this.cb_employees.checked;
        vm.Inventory = this.cb_inventory.checked;
        vm.LimitedLiability = this.cb_limitedLiability.checked;
        vm.AverageRevenue = this.AverageRevenue;
        vm.AverageExpenses = this.AverageExpenses;

        return vm;
    }

    public Update(vm:Model) {
        this.rb_EUCitizen_yes.checked = vm.EUCitizen;
        this.rb_EUCitizen_no.checked = !this.rb_EUCitizen_yes.checked;

        this.BGResidency = vm.BGResidency;

        this.cb_contractors.checked = vm.Contractors;
        this.cb_employees.checked = vm.Employees;
        this.cb_inventory.checked = vm.Inventory;
        this.cb_limitedLiability.checked = vm.LimitedLiability;

        this.AverageRevenue = vm.AverageRevenue;
        this.AverageExpenses = vm.AverageExpenses;

        this.plans.Update(vm.RecommendPlan);
    }


    BG_RESIDENCY_OPTIONS = ["bg-have","bg-yes","bg-maybe","bg-no"];
    get BGResidency() : BGResidencyOptions {
        switch(this.sb_BGResidency.value) {
            case this.BG_RESIDENCY_OPTIONS[0]: return BGResidencyOptions.IsBGResident;
            case this.BG_RESIDENCY_OPTIONS[1]: return BGResidencyOptions.WantsToBecomeBGResident;
            case this.BG_RESIDENCY_OPTIONS[2]: return BGResidencyOptions.UnsureIfBGResidencyWanted;
            case this.BG_RESIDENCY_OPTIONS[3]: return BGResidencyOptions.DoesNotWantToBecomeBGResident;
            default: return BGResidencyOptions.WantsToBecomeBGResident;
        }
    }
    set BGResidency(value:BGResidencyOptions) {
        this.sb_BGResidency.value = this.BG_RESIDENCY_OPTIONS[value];
    }


    AVERAGE_REVENUE_OPTIONS = ["revenue-low","revenue-medium","revenue-high"];
    get AverageRevenue() : AverageRevenueOptions {
        switch(this.sb_AverageRevenue.value) {
            case this.AVERAGE_REVENUE_OPTIONS[0]: return AverageRevenueOptions.low;
            case this.AVERAGE_REVENUE_OPTIONS[1]: return AverageRevenueOptions.medium;
            case this.AVERAGE_REVENUE_OPTIONS[2]: return AverageRevenueOptions.high;
            default: return AverageRevenueOptions.low;
        }
    }
    set AverageRevenue(value:AverageRevenueOptions) {
        this.sb_AverageRevenue.value = this.AVERAGE_REVENUE_OPTIONS[value];
    }


    AVERAGE_EXPENSES_OPTIONS = ["expenses-negligible", "expenses-medium", "expenses-medium"];
    get AverageExpenses() : AverageExpensesOptions {
        switch(this.sb_AverageExpenses.value) {
            case this.AVERAGE_EXPENSES_OPTIONS[0]: return AverageExpensesOptions.negligible;
            case this.AVERAGE_EXPENSES_OPTIONS[1]: return AverageExpensesOptions.medium;
            case this.AVERAGE_EXPENSES_OPTIONS[2]: return AverageExpensesOptions.high
            default: return AverageExpensesOptions.negligible;
        }
    }
    set AverageExpenses(value:AverageExpensesOptions) {
        this.sb_AverageExpenses.value = this.AVERAGE_EXPENSES_OPTIONS[value];
    }


    public OnChanged : (view:View) => void;
}


let _view = new View();
_view.OnChanged = onInteraction;


